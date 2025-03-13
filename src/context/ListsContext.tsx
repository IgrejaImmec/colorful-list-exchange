
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "./UserContext";
import { api, ExtendedListStyle } from "@/lib/api";

export type ListSummary = {
  id: string;
  title: string;
  description: string;
  itemCount: number;
  claimedCount: number;
  createdAt: Date;
  image?: string;
};

type ListsContextType = {
  lists: ListSummary[];
  loading: boolean;
  error: string | null;
  createNewList: (title: string, description: string) => Promise<string>;
  deleteList: (listId: string) => Promise<boolean>;
  refreshLists: () => Promise<void>;
  isPrinting: boolean;
  setPrinting: (isPrinting: boolean) => void;
};

const ListsContext = createContext<ListsContextType | undefined>(undefined);

export const ListsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lists, setLists] = useState<ListSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const { user } = useUser();
  const { toast } = useToast();
  
  const refreshLists = async () => {
    if (!user) {
      setLists([]);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, this would fetch from the server
      // For now, we'll retrieve from localStorage
      const storedListsString = localStorage.getItem(`user_lists_${user.id}`);
      let userLists: ListSummary[] = [];
      
      if (storedListsString) {
        try {
          userLists = JSON.parse(storedListsString);
        } catch (err) {
          console.error('Error parsing stored lists:', err);
          localStorage.removeItem(`user_lists_${user.id}`);
        }
      }
      
      // Update each list with current item counts
      const updatedLists = await Promise.all(
        userLists.map(async (list) => {
          try {
            const items = await api.getItems(list.id);
            return {
              ...list,
              itemCount: items.length,
              claimedCount: items.filter(item => item.claimed).length
            };
          } catch (err) {
            console.error(`Error fetching items for list ${list.id}:`, err);
            return list;
          }
        })
      );
      
      setLists(updatedLists);
    } catch (err: any) {
      setError(err.message || 'Falha ao carregar listas');
      toast({
        title: "Erro ao carregar listas",
        description: err.message || 'Não foi possível carregar suas listas.',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Refresh lists when user changes
  useEffect(() => {
    refreshLists();
  }, [user]);
  
  const createNewList = async (title: string, description: string): Promise<string> => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Create a new list ID
      const newListId = crypto.randomUUID();
      
      // Add the list to our local store
      const newList: ListSummary = {
        id: newListId,
        title,
        description,
        itemCount: 0,
        claimedCount: 0,
        createdAt: new Date(),
      };
      
      // Update our local state
      const updatedLists = [...lists, newList];
      setLists(updatedLists);
      
      // Store in localStorage
      localStorage.setItem(`user_lists_${user.id}`, JSON.stringify(updatedLists));
      
      // Initialize the list in our mock API
      await api.updateListSettings(newListId, { 
        title, 
        description
      });
      
      toast({
        title: "Lista criada com sucesso",
        description: "Sua nova lista foi criada."
      });
      
      return newListId;
    } catch (err: any) {
      setError(err.message || 'Falha ao criar lista');
      toast({
        title: "Erro ao criar lista",
        description: err.message || 'Não foi possível criar a lista.',
        variant: "destructive"
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const deleteList = async (listId: string): Promise<boolean> => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Remove from our local state
      const updatedLists = lists.filter(list => list.id !== listId);
      setLists(updatedLists);
      
      // Update localStorage
      localStorage.setItem(`user_lists_${user.id}`, JSON.stringify(updatedLists));
      
      toast({
        title: "Lista excluída",
        description: "A lista foi excluída com sucesso."
      });
      
      return true;
    } catch (err: any) {
      setError(err.message || 'Falha ao excluir lista');
      toast({
        title: "Erro ao excluir lista",
        description: err.message || 'Não foi possível excluir a lista.',
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  const setPrinting = (printing: boolean) => {
    setIsPrinting(printing);
  };
  
  return (
    <ListsContext.Provider
      value={{
        lists,
        loading,
        error,
        createNewList,
        deleteList,
        refreshLists,
        isPrinting,
        setPrinting
      }}
    >
      {children}
    </ListsContext.Provider>
  );
};

export const useLists = () => {
  const context = useContext(ListsContext);
  if (context === undefined) {
    throw new Error('useLists must be used within a ListsProvider');
  }
  return context;
};
