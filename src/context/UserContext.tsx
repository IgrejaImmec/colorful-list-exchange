
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import axios from 'axios';

export type User = {
  id: string;
  name: string;
  email: string;
  hasSubscription?: boolean;
  subscriptionExpiry?: Date;
};

type UserContextType = {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  dbConnected: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

// Configure axios to use the backend API
axios.defaults.baseURL = 'http://localhost:3001';

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [dbConnected, setDbConnected] = useState<boolean>(false);
  const { toast } = useToast();
  
  const isAuthenticated = !!user;
  
  useEffect(() => {
    // Check database connection
    const checkDbConnection = async () => {
      try {
        // Check if backend is available
        const response = await axios.get('/server');
        setDbConnected(response.status === 200);
        if (response.status !== 200) {
          console.log("Server connection not available");
        } else {
          console.log("Server connected successfully");
        }
      } catch (error) {
        console.error("Error checking server connection:", error);
        setDbConnected(false);
      }
    };
    
    checkDbConnection();
    
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Error parsing stored user:', err);
        localStorage.removeItem('user');
      }
    }
  }, []);
  
  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      if (!email || !password) {
        throw new Error('Email e senha são obrigatórios');
      }
      
      // Call backend API to authenticate
      const response = await axios.post('/server/login', { email, password });
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Falha ao fazer login');
      }
      
      const userData: User = response.data.user;
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      toast({
        title: "Login realizado com sucesso",
        description: `Bem-vindo de volta, ${userData.name}!`,
      });
      
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Falha ao fazer login';
      setError(errorMessage);
      toast({
        title: "Erro ao fazer login",
        description: errorMessage,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      if (!name || !email || !password) {
        throw new Error('Todos os campos são obrigatórios');
      }
      
      // Call backend API to register
      const response = await axios.post('/server/users', { name, email, password });
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Falha ao criar conta');
      }
      
      const userData: User = {
        id: response.data.user.id,
        name: response.data.user.name,
        email: response.data.user.email,
        hasSubscription: false
      };
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      toast({
        title: "Cadastro realizado com sucesso",
        description: `Bem-vindo, ${name}!`,
      });
      
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Falha ao criar conta';
      setError(errorMessage);
      toast({
        title: "Erro ao criar conta",
        description: errorMessage,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso.",
    });
  };
  
  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated,
        dbConnected
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
