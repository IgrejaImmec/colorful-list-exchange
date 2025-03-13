
import React, { useState } from 'react';
import { useList, ListItem as ListItemType } from '../context/ListContext';
import { Trash2, Check, Gift, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from "@/components/ui/use-toast";

interface ListItemProps {
  item: ListItemType;
  editable?: boolean;
  viewMode?: boolean;
  customBorderRadius?: string;
  accentColor?: string;
}

const ListItem: React.FC<ListItemProps> = ({ 
  item, 
  editable = false, 
  viewMode = false,
  customBorderRadius,
  accentColor
}) => {
  const { removeItem, claimItem, loading } = useList();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const { toast } = useToast();
  
  const handleClaim = () => {
    if (!name || !phone) {
      toast({
        title: "Informações incompletas",
        description: "Por favor, preencha seu nome e telefone.",
        variant: "destructive"
      });
      return;
    }
    
    claimItem(item.id, name, phone)
      .then(() => {
        toast({
          title: "Item reservado com sucesso!",
          description: "Obrigado por sua contribuição.",
        });
        setOpen(false);
      });
  };
  
  const handleRemove = () => {
    removeItem(item.id)
      .then(() => {
        toast({
          title: "Item removido",
          description: "O item foi removido da sua lista.",
        });
      });
  };
  
  return (
    <div className={`glass-card p-4 mb-4 transition-all duration-300 item-transition ${item.claimed ? 'opacity-70' : ''} ${customBorderRadius || ''}`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-medium text-lg">{item.name}</h3>
          <p className="text-muted-foreground text-sm mt-1">{item.description}</p>
          
          {item.claimed && (
            <div className="mt-2 flex items-center text-sm" style={{ color: accentColor || '#0078ff' }}>
              <Check size={16} className="mr-1" />
              <span>Reservado por {item.claimedBy?.name}</span>
            </div>
          )}
        </div>
        
        <div>
          {editable && (
            <button 
              onClick={handleRemove}
              className="p-2 text-muted-foreground hover:text-destructive transition-colors duration-200"
              aria-label="Remover item"
              disabled={loading}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
            </button>
          )}
          
          {viewMode && !item.claimed && (
            <button 
              onClick={() => setOpen(true)}
              className="p-2 transition-colors duration-200"
              style={{ color: accentColor || '#0078ff' }}
              aria-label="Reservar item"
              disabled={loading}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Gift size={18} />}
            </button>
          )}
        </div>
      </div>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px] animate-scale-in">
          <DialogHeader>
            <DialogTitle>Reservar Item</DialogTitle>
            <DialogDescription>
              Preencha seus dados para reservar "{item.name}"
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Seu nome</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Digite seu nome completo"
                className="input-primary"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="phone">Seu telefone</Label>
              <Input 
                id="phone" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                placeholder="(00) 00000-0000"
                className="input-primary"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button 
              onClick={handleClaim} 
              disabled={loading}
              style={{ backgroundColor: accentColor }}
            >
              {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
              Confirmar Reserva
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ListItem;
