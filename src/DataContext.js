import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

// Authorized users for the app - only 3 people allowed
const BASE_ALLOWED_USERS = [
  { email: 'owner@olivegardens.com', password: 'owner123', name: 'Owner', role: 'Owner' },
  { email: 'wife@olivegardens.com', password: 'wife123', name: 'Wife', role: 'Co-Manager' },
  { email: 'programmer@olivegardens.com', password: 'prog123', name: 'Programmer', role: 'Developer' }
];

const getAllowedUsers = () => {
  try {
    const stored = localStorage.getItem('registeredUsers');
    const registered = stored ? JSON.parse(stored) : [];
    return [...BASE_ALLOWED_USERS, ...registered];
  } catch (e) {
    console.error('Error loading registered users:', e);
    return [...BASE_ALLOWED_USERS];
  }
};

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
  const [uploads, setUploads] = useState([]); // Upload history tracking state
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  
  // Authentication State
  const [user, setUser] = useState(null);

  const login = async (email, password) => {
    try {
      // 1. Try to verify user credentials using the remote Supabase 'managers' table
      const { data, error } = await supabase
        .from('managers')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        // Fallback: Check local predefined allowed users and local storage registered users
        const allowedUsers = getAllowedUsers();
        const allowedUser = allowedUsers.find(u => u.email === email && u.password === password);
        if (!allowedUser) {
          return { success: false, error: 'Invalid email or password. Access denied.' };
        }
        
        const userObj = {
          name: allowedUser.name,
          email: allowedUser.email,
          role: allowedUser.role,
          avatar: allowedUser.name.charAt(0).toUpperCase()
        };
        
        setUser(userObj);
        localStorage.setItem('currentUser', JSON.stringify(userObj));
        return { success: true };
      }

      // Found in Supabase
      const userObj = {
        name: data.name,
        email: data.email,
        role: data.role,
        avatar: data.name.charAt(0).toUpperCase()
      };
      
      setUser(userObj);
      localStorage.setItem('currentUser', JSON.stringify(userObj));
      return { success: true };
    } catch (err) {
      console.warn("Database login verification failed. Falling back to local verification:", err);
      // Failover to local storage
      const allowedUsers = getAllowedUsers();
      const allowedUser = allowedUsers.find(u => u.email === email && u.password === password);
      if (!allowedUser) {
        return { success: false, error: 'Invalid email or password. Access denied.' };
      }
      
      const userObj = {
        name: allowedUser.name,
        email: allowedUser.email,
        role: allowedUser.role,
        avatar: allowedUser.name.charAt(0).toUpperCase()
      };
      
      setUser(userObj);
      localStorage.setItem('currentUser', JSON.stringify(userObj));
      return { success: true };
    }
  };

  const registerUser = async (email, password, name) => {
    try {
      // 1. Try to register user in remote Supabase 'managers' table
      const { data: existingUser, error: checkError } = await supabase
        .from('managers')
        .select('email')
        .eq('email', email)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingUser) {
        return { success: false, error: 'This email is already registered.' };
      }

      const { error: insertError } = await supabase
        .from('managers')
        .insert([{
          email,
          password,
          name,
          role: 'User'
        }]);

      if (insertError) throw insertError;
      
      // Sync locally as fallback
      try {
        const stored = localStorage.getItem('registeredUsers') || '[]';
        const registered = JSON.parse(stored);
        if (!registered.some(u => u.email === email)) {
          registered.push({ email, password, name, role: 'User' });
          localStorage.setItem('registeredUsers', JSON.stringify(registered));
        }
      } catch (e) {
        console.warn("Failed to write user local storage cache:", e);
      }

      return { success: true };
    } catch (err) {
      console.warn("Error registering user to remote database, falling back to local storage:", err);
      // Fallback to local storage
      const allowedUsers = getAllowedUsers();
      if (allowedUsers.some(u => u.email === email)) {
        return { success: false, error: 'This email is already registered.' };
      }

      const newUser = {
        email,
        password,
        name,
        role: 'User'
      };

      try {
        const stored = localStorage.getItem('registeredUsers') || '[]';
        const registered = JSON.parse(stored);
        registered.push(newUser);
        localStorage.setItem('registeredUsers', JSON.stringify(registered));
        return { success: true };
      } catch (e) {
        console.error('Error saving registered user locally:', e);
        return { success: false, error: 'Error creating account. Please try again.' };
      }
    }
  };

  const logout = () => {
    setUser(null);
    // Clear session from localStorage
    localStorage.removeItem('currentUser');
  };

  // Restore user session on app mount and fetch data
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

    // Restore session and fetch data
    restoreUserSession();
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Check if supabase is configured
      if (process.env.REACT_APP_SUPABASE_URL === 'https://placeholder.supabase.co' || !process.env.REACT_APP_SUPABASE_URL) {
        console.warn("Supabase is not configured yet. Set REACT_APP_SUPABASE_URL in .env");
        setIsLoaded(true);
        return;
      }

      // Fetch transactions
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .select('*');
      
      if (txError) throw txError;
      if (txData) {
        const normalizedData = txData.map(t => ({ ...t, unit: normalizeUnitName(t.unit) }));
        setTransactions(normalizedData);
      }

      // Fetch units metadata
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

      // Fetch uploads history
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
    } catch (err) {
      console.error("Error fetching data from Supabase:", err);
      setError(err.message);
    } finally {
      setIsLoaded(true);
    }
  };

  const updateUnitMetadata = async (unitId, newMetadata) => {
    // Optimistic UI update
    setUnitMetadata(prev => ({
      ...prev,
      [unitId]: {
        ...prev[unitId],
        ...newMetadata
      }
    }));

    try {
      const { error } = await supabase
        .from('units')
        .upsert({ 
          id: unitId, 
          custom_name: newMetadata.customName, 
          resident: newMetadata.resident,
          email: newMetadata.email
        });
      
      if (error) throw error;
    } catch (err) {
      console.error("Error updating unit metadata:", err);
      // Ideally revert state here on failure
    }
  };

  const addTransaction = async (transaction) => {
    const newTransaction = {
      ...transaction,
      unit: normalizeUnitName(transaction.unit),
      id: transaction.id || Date.now().toString() + Math.random().toString(36).substring(2, 9),
      amount: parseFloat(transaction.amount) || 0
    };
    
    // Optimistic UI update
    setTransactions(prev => [...prev, newTransaction]);

    try {
      const { error } = await supabase
        .from('transactions')
        .insert([newTransaction]);
        
      if (error) throw error;
    } catch (err) {
      console.error("Error adding transaction:", err);
    }
  };

  const importData = async (newTransactions) => {
    const formattedData = newTransactions.map(t => ({
      ...t,
      unit: normalizeUnitName(t.unit),
      id: t.id || Date.now().toString() + Math.random().toString(36).substring(2, 9),
      amount: parseFloat(t.amount) || 0
    }));
    
    // Optimistic UI update
    setTransactions(prev => [...prev, ...formattedData]);

    try {
      const { error } = await supabase
        .from('transactions')
        .insert(formattedData);
        
      if (error) throw error;
    } catch (err) {
      console.error("Error importing data:", err);
    }
  };

  const clearData = async () => {
    // Be careful with this in a real database! 
    // This will delete all rows if RLS allows it.
    if (window.confirm("WARNING: This will attempt to delete ALL records from Supabase! Are you sure?")) {
      setTransactions([]);
      setUnitMetadata({});
      setUploads([]);
      try {
        await supabase.from('transactions').delete().neq('id', '0');
        await supabase.from('units').delete().neq('id', '0');
        await supabase.from('uploads').delete().neq('id', '0');
      } catch (err) {
        console.error("Error clearing data:", err);
      }
    }
  };

  // Subscribe to Supabase real-time updates for transactions, units, and uploads
  useEffect(() => {
    // Check if supabase is configured
    if (process.env.REACT_APP_SUPABASE_URL === 'https://placeholder.supabase.co' || !process.env.REACT_APP_SUPABASE_URL) {
      return;
    }

    // 1. Transactions subscription
    const txChannel = supabase
      .channel('public-transactions-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions' },
        (payload) => {
          console.log('Real-time transaction change:', payload);
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

    // 2. Units subscription
    const unitsChannel = supabase
      .channel('public-units-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'units' },
        (payload) => {
          console.log('Real-time unit change:', payload);
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

    // 3. Uploads subscription
    const uploadsChannel = supabase
      .channel('public-uploads-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'uploads' },
        (payload) => {
          console.log('Real-time upload change:', payload);
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
    const newUpload = {
      filename,
      row_count: parseInt(rowCount, 10) || 0,
      file_hash: fileHash,
      uploaded_at: new Date().toISOString()
    };
    
    // Optimistic state update
    setUploads(prev => [newUpload, ...prev]);

    try {
      const { error } = await supabase
        .from('uploads')
        .insert([newUpload]);
        
      if (error) throw error;
    } catch (err) {
      console.error("Error adding upload record to Supabase:", err);
      // Fetch uploads history to sync with DB
      try {
        const { data: uploadData } = await supabase
          .from('uploads')
          .select('*')
          .order('uploaded_at', { ascending: false });
        if (uploadData) setUploads(uploadData);
      } catch (e) {
        console.warn("Failed to resync uploads:", e);
      }
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
