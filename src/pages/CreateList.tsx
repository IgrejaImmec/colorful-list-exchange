
import React, { useEffect } from 'react';
import { useList } from '../context/ListContext';
import ListItem from '../components/ListItem';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast";
import Logo from '@/components/Logo';
import ListForm from '@/components/ListForm';
import ItemForm from '@/components/ItemForm';

const CreateList = () => {
  const { 
    items, 
    listTitle, 
    listDescription, 
    listImage, 
    addItem, 
    setListTitle, 
    setListDescription, 
    setListImage, 
    getShareableLink,
    loading
  } = useList();
  const { toast } = useToast();
  
  const handleListFormSubmit = (values: { title: string; description: string; image?: string }) => {
    setListTitle(values.title);
    setListDescription(values.description || '');
    if (values.image !== undefined) {
      setListImage(values.image);
    }
    
    toast({
      title: "Informações salvas",
      description: "Os detalhes da lista foram atualizados.",
    });
  };
  
  const handleItemFormSubmit = (values: { name: string; description: string }) => {
    addItem(values.name.trim(), values.description?.trim() || '');
    
    toast({
      title: "Item adicionado",
      description: "O item foi adicionado à sua lista.",
    });
  };

  const copyShareableLink = () => {
    navigator.clipboard.writeText(getShareableLink());
    toast({
      title: "Link copiado!",
      description: "O link foi copiado para sua área de transferência.",
    });
  };
  
  return (
    <div className="min-h-screen p-6 max-w-md mx-auto page-transition" style={{ paddingBottom: '5rem' }}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gradient">Criar Lista</h1>
        <Logo />
      </div>
      
      <div className="glass-card p-6 mb-8 animate-slide-in">
        <ListForm 
          defaultValues={{
            title: listTitle,
            description: listDescription,
            image: listImage
          }}
          onSubmit={handleListFormSubmit}
          isProcessing={loading}
          submitButtonText="Salvar Detalhes"
        />
        
        {items.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-muted-foreground">Link para compartilhar</h2>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={copyShareableLink}
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
        <ItemForm onSubmit={handleItemFormSubmit} isProcessing={loading} />
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
