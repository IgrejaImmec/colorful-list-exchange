
import React, { useState } from 'react';
import { useList, ListItem as ListItemType } from '../context/ListContext';
import { Trash2, Check, Gift, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast";
import PaymentModal from './PaymentModal';

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
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const { toast } = useToast();
  
  const handleRemove = () => {
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
