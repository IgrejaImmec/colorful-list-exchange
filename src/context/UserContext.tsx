
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";

export type User = {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
};

type UserContextType = {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const isAuthenticated = !!user;
  
  useEffect(() => {
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful login (in a real app, this would verify credentials)
      if (email && password) {
        const mockUser: User = {
          id: crypto.randomUUID(),
          name: email.split('@')[0], // Simple name from email
          email,
          createdAt: new Date(),
        };
        
        setUser(mockUser);
        localStorage.setItem('user', JSON.stringify(mockUser));
        
        toast({
          title: "Login realizado com sucesso",
          description: `Bem-vindo de volta, ${mockUser.name}!`,
        });
        
        return true;
      } else {
        throw new Error('Email e senha são obrigatórios');
      }
    } catch (err: any) {
      setError(err.message || 'Falha ao fazer login');
      toast({
        title: "Erro ao fazer login",
        description: err.message || 'Verifique suas credenciais e tente novamente.',
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful registration
      if (name && email && password) {
        const mockUser: User = {
          id: crypto.randomUUID(),
          name,
          email,
          createdAt: new Date(),
        };
        
        setUser(mockUser);
        localStorage.setItem('user', JSON.stringify(mockUser));
        
        toast({
          title: "Cadastro realizado com sucesso",
          description: `Bem-vindo, ${name}!`,
        });
        
        return true;
      } else {
        throw new Error('Todos os campos são obrigatórios');
      }
    } catch (err: any) {
      setError(err.message || 'Falha ao criar conta');
      toast({
        title: "Erro ao criar conta",
        description: err.message || 'Verifique os dados e tente novamente.',
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
        isAuthenticated
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
