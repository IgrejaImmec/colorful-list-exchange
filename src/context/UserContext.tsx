
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { userDb, testConnection } from '../services/dbService';

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
  dbConnected: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [dbConnected, setDbConnected] = useState<boolean>(false);
  const { toast } = useToast();
  
  const isAuthenticated = !!user;
  
  useEffect(() => {
    // Check database connection
    testConnection()
      .then(connected => {
        setDbConnected(connected);
        if (!connected) {
          toast({
            title: "Erro de conexão com o banco de dados",
            description: "Não foi possível conectar ao banco de dados. Usando modo offline.",
            variant: "destructive"
          });
        }
      });
    
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
      
      if (dbConnected) {
        // Use database for authentication
        const dbUser = await userDb.findUserByEmail(email);
        
        if (dbUser && dbUser.password === password) { // In a real app, use proper password hashing
          const user = {
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            createdAt: new Date(dbUser.created_at)
          };
          
          setUser(user);
          localStorage.setItem('user', JSON.stringify(user));
          
          toast({
            title: "Login realizado com sucesso",
            description: `Bem-vindo de volta, ${user.name}!`,
          });
          
          return true;
        } else {
          throw new Error('Email ou senha incorretos');
        }
      } else {
        // Fallback to mock authentication when database is not connected
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockUser: User = {
          id: crypto.randomUUID(),
          name: email.split('@')[0], // Simple name from email
          email,
          createdAt: new Date(),
        };
        
        setUser(mockUser);
        localStorage.setItem('user', JSON.stringify(mockUser));
        
        toast({
          title: "Login realizado com sucesso (modo offline)",
          description: `Bem-vindo de volta, ${mockUser.name}!`,
        });
        
        return true;
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
      if (!name || !email || !password) {
        throw new Error('Todos os campos são obrigatórios');
      }
      
      if (dbConnected) {
        // Check if user already exists
        const existingUser = await userDb.findUserByEmail(email);
        if (existingUser) {
          throw new Error('Este email já está em uso');
        }
        
        // Create user in database
        const newUser = await userDb.createUser(name, email, password);
        
        if (newUser) {
          const user = {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            createdAt: new Date(newUser.created_at)
          };
          
          setUser(user);
          localStorage.setItem('user', JSON.stringify(user));
          
          toast({
            title: "Cadastro realizado com sucesso",
            description: `Bem-vindo, ${name}!`,
          });
          
          return true;
        } else {
          throw new Error('Erro ao criar usuário');
        }
      } else {
        // Fallback to mock registration when database is not connected
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockUser: User = {
          id: crypto.randomUUID(),
          name,
          email,
          createdAt: new Date(),
        };
        
        setUser(mockUser);
        localStorage.setItem('user', JSON.stringify(mockUser));
        
        toast({
          title: "Cadastro realizado com sucesso (modo offline)",
          description: `Bem-vindo, ${name}!`,
        });
        
        return true;
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
