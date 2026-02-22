import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api } from '../utils/api';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);       // null = not logged in, object = logged in
  const [userLoading, setUserLoading] = useState(true);

  useEffect(() => {
    const storedId = localStorage.getItem('pawchart_user_id');
    if (storedId) {
      api.getUser(storedId)
        .then(data => setUser(data))
        .catch(() => {
          // stale ID — clear it
          localStorage.removeItem('pawchart_user_id');
        })
        .finally(() => setUserLoading(false));
    } else {
      setUserLoading(false);
    }
  }, []);

  const login = useCallback(async (email, name) => {
    const data = await api.createUser({ email, name });
    localStorage.setItem('pawchart_user_id', data.id);
    setUser(data);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('pawchart_user_id');
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const storedId = localStorage.getItem('pawchart_user_id');
    if (!storedId) return;
    const data = await api.getUser(storedId);
    setUser(data);
    return data;
  }, []);

  return (
    <UserContext.Provider value={{ user, userLoading, login, logout, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
