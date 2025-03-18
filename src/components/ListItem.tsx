
import React, { useState } from 'react';
import { useList, ListItem as ListItemType } from '../context/ListContext';
import { Trash2, Check, Gift, Loader2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast";
import PaymentModal from './PaymentModal';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

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
  const { removeItem, claimItem, updateItem, loading } = useList();
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const [editDescription, setEditDescription] = useState(item.description);
  const { toast } = useToast();
  
  const handleRemove = () => {
    // Only remove items that haven't been claimed
    if (item.claimed) {
      toast({
        title: "Não é possível remover",
        description: "Itens já reservados não podem ser removidos.",
        variant: "destructive"
      });
      return;
    }
    
    removeItem(item.id)
      .then(() => {
        toast({
          title: "Item removido",
          description: "O item foi removido da sua lista.",
        });
      });
  };
  
  const handleClaim = async (name: string, phone: string) => {
    return claimItem(item.id, name, phone)
      .then(() => {
        toast({
          title: "Item reservado com sucesso!",
          description: "Obrigado por sua contribuição.",
        });
      });
  };
  
  const handleEditToggle = () => {
    if (isEditing) {
      // Save changes
      updateItem(item.id, {
        name: editName,
        description: editDescription
      }).then(() => {
        toast({
          title: "Item atualizado",
          description: "As alterações foram salvas com sucesso.",
        });
        setIsEditing(false);
      });
    } else {
      // Enable editing mode
      setEditName(item.name);
      setEditDescription(item.description);
      setIsEditing(true);
    }
  };
  
  const canEdit = editable && !item.claimed;
  
  return (
    <div className={`glass-card p-4 mb-4 transition-all duration-300 item-transition ${item.claimed ? 'opacity-70' : ''} ${customBorderRadius || ''}`}>
      {isEditing ? (
        <div className="space-y-3">
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="input-primary"
            placeholder="Nome do item"
          />
          <Textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className="input-primary"
            placeholder="Descrição do item"
          />
          <div className="flex justify-end gap-2 mt-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsEditing(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              size="sm"
              onClick={handleEditToggle}
              disabled={loading}
              style={accentColor ? { backgroundColor: accentColor } : undefined}
            >
              {loading ? <Loader2 size={16} className="animate-spin mr-1" /> : null}
              Salvar
            </Button>
          </div>
        </div>
      ) : (
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
          
          <div className="flex">
            {canEdit && (
              <>
                <button 
                  onClick={handleEditToggle}
                  className="p-2 text-muted-foreground hover:text-primary transition-colors duration-200 mr-1"
                  aria-label="Editar item"
                  disabled={loading}
                >
                  <Edit size={18} />
                </button>
                <button 
                  onClick={handleRemove}
                  className="p-2 text-muted-foreground hover:text-destructive transition-colors duration-200"
                  aria-label="Remover item"
                  disabled={loading}
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                </button>
              </>
            )}
            
            {viewMode && !item.claimed && (
              <button 
                onClick={() => setPaymentModalOpen(true)}
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
      )}
      
      <PaymentModal
        open={paymentModalOpen}
        onOpenChange={setPaymentModalOpen}
        item={item}
        onConfirm={handleClaim}
        accentColor={accentColor}
      />
    </div>
  );
};

export default ListItem;
