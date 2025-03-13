
import React, { useState } from 'react';
import { useList } from '../context/ListContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import ListItem from '../components/ListItem';
import ImageUploader from '../components/ImageUploader';
import { Plus } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import Logo from '@/components/Logo';

const CreateList = () => {
  const { items, listTitle, listDescription, listImage, addItem, setListTitle, setListDescription, setListImage, getShareableLink } = useList();
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gradient">Criar Lista</h1>
        <Logo />
      </div>
      
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
        
        <ImageUploader 
          value={listImage}
          onChange={setListImage}
          label="Imagem da Lista (opcional)"
        />
        
        {items.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-muted-foreground">Link para compartilhar</h2>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  navigator.clipboard.writeText(getShareableLink());
                  toast({
                    title: "Link copiado!",
                    description: "O link foi copiado para sua área de transferência.",
                  });
                }}
              >
                Copiar Link
              </Button>
            </div>
            <Input
              readOnly
              value={getShareableLink()}
              className="input-primary text-sm"
              onClick={(e) => {
                (e.target as HTMLInputElement).select();
              }}
            />
          </div>
        )}
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
