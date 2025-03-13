
import React, { createContext, useContext, useState, useEffect } from 'react';

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
  listStyle: ListStyle;
  addItem: (name: string, description: string) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, data: Partial<ListItem>) => void;
  claimItem: (id: string, name: string, phone: string) => void;
  setListTitle: (title: string) => void;
  setListDescription: (description: string) => void;
  updateListStyle: (style: Partial<ListStyle>) => void;
  clearList: () => void;
};

const defaultListStyle: ListStyle = {
  backgroundColor: '#ffffff',
  accentColor: '#0078ff',
  fontFamily: 'Inter, sans-serif',
};

const ListContext = createContext<ListContextType | undefined>(undefined);

export const ListProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<ListItem[]>(() => {
    const savedItems = localStorage.getItem('listItems');
    return savedItems ? JSON.parse(savedItems) : [];
  });
  
  const [listTitle, setListTitle] = useState<string>(() => {
    const savedTitle = localStorage.getItem('listTitle');
    return savedTitle || 'Minha Lista';
  });
  
  const [listDescription, setListDescription] = useState<string>(() => {
    const savedDescription = localStorage.getItem('listDescription');
    return savedDescription || 'Descrição da minha lista';
  });
  
  const [listStyle, setListStyle] = useState<ListStyle>(() => {
    const savedStyle = localStorage.getItem('listStyle');
    return savedStyle ? JSON.parse(savedStyle) : defaultListStyle;
  });
  
  useEffect(() => {
    localStorage.setItem('listItems', JSON.stringify(items));
  }, [items]);
  
  useEffect(() => {
    localStorage.setItem('listTitle', listTitle);
  }, [listTitle]);
  
  useEffect(() => {
    localStorage.setItem('listDescription', listDescription);
  }, [listDescription]);
  
  useEffect(() => {
    localStorage.setItem('listStyle', JSON.stringify(listStyle));
  }, [listStyle]);
  
  const addItem = (name: string, description: string) => {
    setItems(prev => [...prev, {
      id: crypto.randomUUID(),
      name,
      description,
      claimed: false
    }]);
  };
  
  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };
  
  const updateItem = (id: string, data: Partial<ListItem>) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...data } : item
    ));
  };
  
  const claimItem = (id: string, name: string, phone: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { 
        ...item, 
        claimed: true, 
        claimedBy: { name, phone } 
      } : item
    ));
  };
  
  const updateListStyle = (style: Partial<ListStyle>) => {
    setListStyle(prev => ({ ...prev, ...style }));
  };
  
  const clearList = () => {
    setItems([]);
    setListTitle('Minha Lista');
    setListDescription('Descrição da minha lista');
    setListStyle(defaultListStyle);
  };
  
  return (
    <ListContext.Provider
      value={{
        items,
        listTitle,
        listDescription,
        listStyle,
        addItem,
        removeItem,
        updateItem,
        claimItem,
        setListTitle,
        setListDescription,
        updateListStyle,
        clearList
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
