import React, { createContext, useState, ReactNode } from 'react';

type UserRole = 'admin' | 'dokter' | 'tamu' | null;

export interface User {
  id_users: number;
  username: string;
  nama: string;
  role: UserRole;
  spesialisasi?: string; // Menampung info 'Umum' atau 'Ortodental'
}

interface AuthContextProps {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextProps>({
  user: null,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
