import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser } from '../api/services';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'crew';
  shipId: any;
  rank: string;
  token: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('fathom_user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await loginUser({ email, password });
    setUser(data);
    localStorage.setItem('fathom_user', JSON.stringify(data));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('fathom_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
