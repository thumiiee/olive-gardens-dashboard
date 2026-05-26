import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

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
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  
  // Authentication State
  const [user, setUser] = useState({
    name: "Thumelo",
    email: "manager@olivegardens.com",
    role: "Property Manager",
    avatar: "T"
  });

  const login = (email, password) => {
    setUser({
      name: "Thumelo",
      email: email || "manager@olivegardens.com",
      role: "Property Manager",
      avatar: "T"
    });
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  useEffect(() => {
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
      try {
        await supabase.from('transactions').delete().neq('id', '0');
        await supabase.from('units').delete().neq('id', '0');
      } catch (err) {
        console.error("Error clearing data:", err);
      }
    }
  };

  return (
    <DataContext.Provider value={{ 
      transactions, addTransaction, importData, clearData,
      unitMetadata, updateUnitMetadata, isLoaded, error,
      user, login, logout
    }}>
      {children}
    </DataContext.Provider>
  );
};
