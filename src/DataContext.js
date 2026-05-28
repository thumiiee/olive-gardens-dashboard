import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured, supabaseConfigError } from './supabaseClient';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

const normalizeUnitName = (name) => {
  if (!name) return "Unknown";
  const trimmed = name.trim();
  if (trimmed.toLowerCase() === "airbnb") return "Flat 8"; // Map Airbnb back to Flat 8 for historical consistency
  if (trimmed.toLowerCase().startsWith("flat ")) {
    return "Flat " + trimmed.substring(5).trim();
  }
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
};

export const DataProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [unitMetadata, setUnitMetadata] = useState({});
  const [uploads, setUploads] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  const getBackendUnavailableMessage = useCallback(
    () => supabaseConfigError || 'Supabase is unavailable. Please configure backend access and try again.',
    []
  );

  const createUserObject = (record) => ({
    name: record.name,
    email: record.email,
    role: record.role,
    avatar: (record.name || '?').charAt(0).toUpperCase()
  });

  const normalizeEmail = (email) => (email || '').trim().toLowerCase();

  const login = async (email, password) => {
    if (!isSupabaseConfigured) {
      return { success: false, error: getBackendUnavailableMessage() };
    }

    const normalizedEmail = normalizeEmail(email);
    const normalizedPassword = (password || '').trim();

    try {
      const { data, error: loginError } = await supabase
        .from('managers')
        .select('*')
        .ilike('email', normalizedEmail)
        .eq('password', normalizedPassword)
        .maybeSingle();

      if (loginError) throw loginError;
      if (!data) {
        const { data: existingEmail } = await supabase
          .from('managers')
          .select('email')
          .ilike('email', normalizedEmail)
          .maybeSingle();
        if (existingEmail) {
          return { success: false, error: 'Incorrect password. Please try again.' };
        }
        return { success: false, error: 'No account found for this email. Create an account or check the email address.' };
      }

      const userObj = createUserObject(data);
      setUser(userObj);
      localStorage.setItem('currentUser', JSON.stringify(userObj));
      setError(null);
      return { success: true };
    } catch (err) {
      console.warn("Database login verification failed:", err);
      return { success: false, error: 'Login failed because the backend is unavailable. Please try again shortly.' };
    }
  };

  const registerUser = async (email, password, name) => {
    if (!isSupabaseConfigured) {
      return { success: false, error: getBackendUnavailableMessage() };
    }

    const normalizedEmail = normalizeEmail(email);
    const normalizedPassword = (password || '').trim();
    const normalizedName = (name || '').trim();

    try {
      const { data: existingUser, error: checkError } = await supabase
        .from('managers')
        .select('*')
        .ilike('email', normalizedEmail)
        .maybeSingle();

      if (checkError) throw checkError;
      if (existingUser) {
        // If the user re-registers with existing valid credentials, log them in.
        if (existingUser.password === normalizedPassword) {
          const userObj = createUserObject(existingUser);
          setUser(userObj);
          localStorage.setItem('currentUser', JSON.stringify(userObj));
          setError(null);
          return { success: true, message: 'Account already exists. Logged in successfully.' };
        }
        return { success: false, error: 'This email is already registered. Please sign in instead.' };
      }

      const { error: insertError } = await supabase
        .from('managers')
        .insert([{
          email: normalizedEmail,
          password: normalizedPassword,
          name: normalizedName || normalizedEmail,
          role: 'User'
        }]);

      if (insertError) throw insertError;
      setError(null);
      return { success: true };
    } catch (err) {
      console.warn("Error registering user to remote database:", err);
      return { success: false, error: 'Registration failed because the backend is unavailable. Please try again shortly.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const fetchData = useCallback(async () => {
    try {
      if (!isSupabaseConfigured) {
        const configMessage = getBackendUnavailableMessage();
        console.warn(configMessage);
        setError(configMessage);
        setIsLoaded(true);
        return;
      }

      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .select('*');

      if (txError) throw txError;
      if (txData) {
        const normalizedData = txData.map(t => ({ ...t, unit: normalizeUnitName(t.unit) }));
        setTransactions(normalizedData);
      }

      const { data: unitData, error: unitError } = await supabase
        .from('units')
        .select('*');

      if (unitError) throw unitError;
      if (unitData) {
        const metadataMap = {};
        unitData.forEach(u => {
          metadataMap[u.id] = { customName: u.custom_name, resident: u.resident, email: u.email };
        });
        setUnitMetadata(metadataMap);
      }

      try {
        const { data: uploadData, error: uploadError } = await supabase
          .from('uploads')
          .select('*')
          .order('uploaded_at', { ascending: false });
        if (uploadError) {
          console.warn("Could not fetch uploads history (table might not exist yet):", uploadError.message);
        } else if (uploadData) {
          setUploads(uploadData);
        }
      } catch (err) {
        console.warn("Error fetching uploads:", err);
      }

      setError(null);
    } catch (err) {
      console.error("Error fetching data from Supabase:", err);
      setError(err.message);
    } finally {
      setIsLoaded(true);
    }
  }, [getBackendUnavailableMessage]);

  useEffect(() => {
    const restoreUserSession = () => {
      try {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          return true;
        }
      } catch (e) {
        console.error('Error restoring user session:', e);
        localStorage.removeItem('currentUser');
      }
      return false;
    };

    restoreUserSession();
    fetchData();
  }, [fetchData]);

  const updateUnitMetadata = async (unitId, newMetadata) => {
    if (!isSupabaseConfigured) {
      setError(getBackendUnavailableMessage());
      return { success: false, error: getBackendUnavailableMessage() };
    }

    const previousMetadata = unitMetadata[unitId];

    setUnitMetadata(prev => ({
      ...prev,
      [unitId]: {
        ...prev[unitId],
        ...newMetadata
      }
    }));

    try {
      const { error: updateError } = await supabase
        .from('units')
        .upsert({
          id: unitId,
          custom_name: newMetadata.customName,
          resident: newMetadata.resident,
          email: newMetadata.email
        });

      if (updateError) throw updateError;
      setError(null);
      return { success: true };
    } catch (err) {
      console.error("Error updating unit metadata:", err);
      setError('Failed to sync unit update to backend.');
      setUnitMetadata(prev => ({ ...prev, [unitId]: previousMetadata }));
      return { success: false, error: 'Failed to sync unit update to backend.' };
    }
  };

  const addTransaction = async (transaction) => {
    if (!isSupabaseConfigured) {
      setError(getBackendUnavailableMessage());
      return { success: false, error: getBackendUnavailableMessage() };
    }

    const newTransaction = {
      ...transaction,
      unit: normalizeUnitName(transaction.unit),
      id: transaction.id || Date.now().toString() + Math.random().toString(36).substring(2, 9),
      amount: parseFloat(transaction.amount) || 0
    };

    setTransactions(prev => [...prev, newTransaction]);

    try {
      const { error: insertError } = await supabase
        .from('transactions')
        .insert([newTransaction]);

      if (insertError) throw insertError;
      setError(null);
      return { success: true };
    } catch (err) {
      console.error("Error adding transaction:", err);
      setError('Failed to sync transaction to backend.');
      setTransactions(prev => prev.filter(t => t.id !== newTransaction.id));
      return { success: false, error: 'Failed to sync transaction to backend.' };
    }
  };

  const importData = async (newTransactions) => {
    if (!isSupabaseConfigured) {
      setError(getBackendUnavailableMessage());
      return { success: false, error: getBackendUnavailableMessage() };
    }

    const formattedData = newTransactions.map(t => ({
      ...t,
      unit: normalizeUnitName(t.unit),
      id: t.id || Date.now().toString() + Math.random().toString(36).substring(2, 9),
      amount: parseFloat(t.amount) || 0
    }));

    setTransactions(prev => [...prev, ...formattedData]);

    try {
      const { error: insertError } = await supabase
        .from('transactions')
        .insert(formattedData);

      if (insertError) throw insertError;
      setError(null);
      return { success: true };
    } catch (err) {
      console.error("Error importing data:", err);
      setError('Failed to sync imported data to backend.');
      const importedIds = new Set(formattedData.map(t => t.id));
      setTransactions(prev => prev.filter(t => !importedIds.has(t.id)));
      return { success: false, error: 'Failed to sync imported data to backend.' };
    }
  };

  const clearData = async () => {
    if (!isSupabaseConfigured) {
      setError(getBackendUnavailableMessage());
      return { success: false, error: getBackendUnavailableMessage() };
    }

    if (window.confirm("WARNING: This will attempt to delete ALL records from Supabase! Are you sure?")) {
      try {
        await supabase.from('transactions').delete().neq('id', '0');
        await supabase.from('units').delete().neq('id', '0');
        await supabase.from('uploads').delete().neq('id', '0');
        setTransactions([]);
        setUnitMetadata({});
        setUploads([]);
        setError(null);
        return { success: true };
      } catch (err) {
        console.error("Error clearing data:", err);
        setError('Failed to clear backend data. Local state was not cleared.');
        return { success: false, error: 'Failed to clear backend data. Local state was not cleared.' };
      }
    }
    return { success: false, error: 'Clear data cancelled.' };
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return;
    }

    const txChannel = supabase
      .channel('public-transactions-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newTx = { ...payload.new, unit: normalizeUnitName(payload.new.unit) };
            setTransactions(prev => {
              if (prev.some(t => t.id === newTx.id)) return prev;
              return [...prev, newTx];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedTx = { ...payload.new, unit: normalizeUnitName(payload.new.unit) };
            setTransactions(prev => prev.map(t => t.id === updatedTx.id ? updatedTx : t));
          } else if (payload.eventType === 'DELETE') {
            setTransactions(prev => prev.filter(t => t.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    const unitsChannel = supabase
      .channel('public-units-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'units' },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const u = payload.new;
            setUnitMetadata(prev => ({
              ...prev,
              [u.id]: { customName: u.custom_name, resident: u.resident, email: u.email }
            }));
          }
        }
      )
      .subscribe();

    const uploadsChannel = supabase
      .channel('public-uploads-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'uploads' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newUpload = payload.new;
            setUploads(prev => {
              if (prev.some(u => u.id === newUpload.id || (u.file_hash && u.file_hash === newUpload.file_hash))) return prev;
              return [newUpload, ...prev];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(txChannel);
      supabase.removeChannel(unitsChannel);
      supabase.removeChannel(uploadsChannel);
    };
  }, []);

  const addUploadRecord = async (filename, rowCount, fileHash) => {
    if (!isSupabaseConfigured) {
      setError(getBackendUnavailableMessage());
      return { success: false, error: getBackendUnavailableMessage() };
    }

    const newUpload = {
      filename,
      row_count: parseInt(rowCount, 10) || 0,
      file_hash: fileHash,
      uploaded_at: new Date().toISOString()
    };

    setUploads(prev => [newUpload, ...prev]);

    try {
      const { error: insertError } = await supabase
        .from('uploads')
        .insert([newUpload]);

      if (insertError) throw insertError;
      setError(null);
      return { success: true };
    } catch (err) {
      console.error("Error adding upload record to Supabase:", err);
      setError('Failed to sync upload record to backend.');
      setUploads(prev => prev.filter(
        u => !(u.file_hash === newUpload.file_hash && u.uploaded_at === newUpload.uploaded_at)
      ));
      return { success: false, error: 'Failed to sync upload record to backend.' };
    }
  };

  return (
    <DataContext.Provider value={{
      transactions, addTransaction, importData, clearData,
      unitMetadata, updateUnitMetadata, isLoaded, error,
      user, login, logout, registerUser,
      uploads, addUploadRecord
    }}>
      {children}
    </DataContext.Provider>
  );
};
