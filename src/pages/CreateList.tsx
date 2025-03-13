
import React, { useState } from 'react';
import { useList } from '../context/ListContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import ListItem from '../components/ListItem';
import { Plus } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

const CreateList = () => {
  const { items, listTitle, listDescription, addItem, setListTitle, setListDescription } = useList();
  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const { toast } = useToast();
  
  const handleAddItem = () => {
    if (!itemName.trim()) {
      toast({
        title: "Nome do item é obrigatório",
        description: "Por favor, informe um nome para o item.",
        variant: "destructive"
      });
      return;
    }
    
    addItem(itemName.trim(), itemDescription.trim());
    setItemName('');
    setItemDescription('');
    
    toast({
      title: "Item adicionado",
      description: "O item foi adicionado à sua lista.",
    });
  };
  
  return (
    <div className="min-h-screen p-6 max-w-md mx-auto page-transition" style={{ paddingBottom: '5rem' }}>
      <h1 className="text-2xl font-bold mb-6 text-gradient">Criar Lista</h1>
      
      <div className="glass-card p-6 mb-8 animate-slide-in">
        <div className="mb-6">
          <Label htmlFor="listTitle">Título da Lista</Label>
          <Input
            id="listTitle"
            value={listTitle}
            onChange={(e) => setListTitle(e.target.value)}
            className="input-primary mt-1"
            placeholder="Ex: Lista de Casamento"
          />
        </div>
        
        <div className="mb-6">
          <Label htmlFor="listDescription">Descrição</Label>
          <Textarea
            id="listDescription"
            value={listDescription}
            onChange={(e) => setListDescription(e.target.value)}
            className="input-primary mt-1 min-h-[100px]"
            placeholder="Descreva sua lista..."
          />
        </div>
      </div>
      
      <div className="glass-card p-6 mb-8 animate-slide-in">
        <h2 className="text-xl font-medium mb-4">Adicionar Novo Item</h2>
        
        <div className="mb-4">
          <Label htmlFor="itemName">Nome do Item</Label>
          <Input
            id="itemName"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            className="input-primary mt-1"
            placeholder="Ex: Liquidificador"
          />
        </div>
        
        <div className="mb-4">
          <Label htmlFor="itemDescription">Descrição do Item</Label>
          <Textarea
            id="itemDescription"
            value={itemDescription}
            onChange={(e) => setItemDescription(e.target.value)}
            className="input-primary mt-1"
            placeholder="Detalhes adicionais, marca, modelo, cor..."
          />
        </div>
        
        <Button onClick={handleAddItem} className="w-full btn-primary gap-2">
          <Plus size={16} />
          <span>Adicionar Item</span>
        </Button>
      </div>
      
      {items.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-medium mb-4">Itens da Lista ({items.length})</h2>
          {items.map((item) => (
            <ListItem key={item.id} item={item} editable={true} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CreateList;
