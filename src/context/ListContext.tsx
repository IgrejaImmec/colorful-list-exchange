import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, ExtendedListStyle } from '@/lib/api';
import { useToast } from "@/components/ui/use-toast";

export type ListItem = {
  id: string;
  name: string;
  description: string;
  claimed: boolean;
  claimedBy?: {
    name: string;
    phone: string;
  };
};

export type ListStyle = {
  backgroundColor: string;
  accentColor: string;
  fontFamily: string;
};

type ListContextType = {
  items: ListItem[];
  listTitle: string;
  listDescription: string;
  listImage: string;
  listId: string;
  listStyle: ExtendedListStyle;
  loading: boolean;
  error: string | null;
  addItem: (name: string, description: string) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateItem: (id: string, data: Partial<ListItem>) => Promise<void>;
  claimItem: (id: string, name: string, phone: string) => Promise<void>;
  setListTitle: (title: string) => Promise<void>;
  setListDescription: (description: string) => Promise<void>;
  setListImage: (imageUrl: string) => Promise<void>;
  updateListStyle: (style: Partial<ExtendedListStyle>) => Promise<void>;
  clearList: () => void;
  refreshList: () => Promise<void>;
  getShareableLink: () => string;
  loadListById: (id: string) => Promise<boolean>;
};

const defaultListStyle: ExtendedListStyle = {
  backgroundColor: '#ffffff',
  accentColor: '#0078ff',
  fontFamily: 'Inter, sans-serif',
  borderRadius: 'rounded-2xl',
  itemSpacing: '4',
  backgroundImage: '',
  backgroundPattern: '',
  titleColor: '',
  textColor: '',
};

const ListContext = createContext<ListContextType | undefined>(undefined);

export const ListProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<ListItem[]>([]);
  const [listTitle, setListTitleState] = useState<string>('Minha Lista');
  const [listDescription, setListDescriptionState] = useState<string>('Descrição da minha lista');
  const [listImage, setListImageState] = useState<string>('');
  const [listId, setListId] = useState<string>(() => {
    const savedId = localStorage.getItem('listId');
    return savedId || crypto.randomUUID();
  });
  const [listStyle, setListStyle] = useState<ExtendedListStyle>(defaultListStyle);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false);
  const { toast } = useToast();
  
  const handleError = (error: any, message: string) => {
    console.error(`Error: ${message}`, error);
    setError(message);
    toast({
      title: "Erro",
      description: message,
      variant: "destructive"
    });
  };
  
  const refreshList = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const fetchedItems = await api.getItems(listId);
      setItems(fetchedItems);
      
      const settings = await api.getListSettings(listId);
      setListTitleState(settings.title);
      setListDescriptionState(settings.description);
      setListImageState(settings.image || '');
      setListStyle(settings.style);
    } catch (err) {
      handleError(err, 'Falha ao carregar os dados da lista');
    } finally {
      setLoading(false);
    }
  };
  
  const loadListById = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const exists = await api.checkListExists(id);
      
      if (!exists) {
        return false;
      }
      
      setListId(id);
      
      await refreshList();
      return true;
    } catch (err) {
      handleError(err, 'Falha ao carregar a lista');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (!initialized) {
      refreshList();
      setInitialized(true);
    }
  }, [initialized]);
  
  useEffect(() => {
    if (initialized) {
      localStorage.setItem('listItems', JSON.stringify(items));
      localStorage.setItem('listTitle', listTitle);
      localStorage.setItem('listDescription', listDescription);
      localStorage.setItem('listImage', listImage);
      localStorage.setItem('listId', listId);
      localStorage.setItem('listStyle', JSON.stringify(listStyle));
    }
  }, [items, listTitle, listDescription, listImage, listId, listStyle, initialized]);
  
  const addItem = async (name: string, description: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const newItem = await api.addItem(name, description);
      setItems(prev => [...prev, newItem]);
    } catch (err) {
      handleError(err, 'Falha ao adicionar item');
    } finally {
      setLoading(false);
    }
  };
  
  const removeItem = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await api.deleteItem(id);
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      handleError(err, 'Falha ao remover item');
    } finally {
      setLoading(false);
    }
  };
  
  const updateItem = async (id: string, data: Partial<ListItem>) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedItem = await api.updateItem(id, data);
      setItems(prev => prev.map(item => 
        item.id === id ? updatedItem : item
      ));
    } catch (err) {
      handleError(err, 'Falha ao atualizar item');
    } finally {
      setLoading(false);
    }
  };
  
  const claimItem = async (id: string, name: string, phone: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedItem = await api.claimItem(id, name, phone);
      setItems(prev => prev.map(item => 
        item.id === id ? updatedItem : item
      ));
    } catch (err) {
      handleError(err, 'Falha ao reservar item');
    } finally {
      setLoading(false);
    }
  };
  
  const setListTitle = async (title: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const settings = await api.updateListSettings(listId, { title });
      setListTitleState(settings.title);
    } catch (err) {
      handleError(err, 'Falha ao atualizar título da lista');
    } finally {
      setLoading(false);
    }
  };
  
  const setListDescription = async (description: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const settings = await api.updateListSettings(listId, { description });
      setListDescriptionState(settings.description);
    } catch (err) {
      handleError(err, 'Falha ao atualizar descrição da lista');
    } finally {
      setLoading(false);
    }
  };
  
  const setListImage = async (imageUrl: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const settings = await api.updateListSettings(listId, { image: imageUrl });
      setListImageState(settings.image || '');
    } catch (err) {
      handleError(err, 'Falha ao atualizar imagem da lista');
    } finally {
      setLoading(false);
    }
  };
  
  const updateListStyle = async (style: Partial<ExtendedListStyle>) => {
    setLoading(true);
    setError(null);
    
    try {
      const settings = await api.updateListSettings(listId, { style });
      setListStyle(settings.style);
    } catch (err) {
      handleError(err, 'Falha ao atualizar estilo da lista');
    } finally {
      setLoading(false);
    }
  };
  
  const clearList = () => {
    setItems([]);
    setListTitleState('Minha Lista');
    setListDescriptionState('Descrição da minha lista');
    setListImageState('');
    setListId(crypto.randomUUID());
    setListStyle(defaultListStyle);
    localStorage.clear();
    toast({
      title: "Lista limpa",
      description: "Todos os dados da lista foram removidos.",
    });
  };
  
  const getShareableLink = () => {
    return `${window.location.origin}/shared/${listId}`;
  };
  
  return (
    <ListContext.Provider
      value={{
        items,
        listTitle,
        listDescription,
        listImage,
        listId,
        listStyle,
        loading,
        error,
        addItem,
        removeItem,
        updateItem,
        claimItem,
        setListTitle,
        setListDescription,
        setListImage,
        updateListStyle,
        clearList,
        refreshList,
        getShareableLink,
        loadListById
      }}
    >
      {children}
    </ListContext.Provider>
  );
};

export const useList = () => {
  const context = useContext(ListContext);
  if (context === undefined) {
    throw new Error('useList must be used within a ListProvider');
  }
  return context;
};
