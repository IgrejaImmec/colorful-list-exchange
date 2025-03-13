
import React from 'react';
import { Link } from 'react-router-dom';
import { useList } from '../context/ListContext';
import { ListPlus, Paintbrush, Eye, Trash, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast";
import Logo from '@/components/Logo';

const Index = () => {
  const { items, clearList, getShareableLink } = useList();
  const { toast } = useToast();
  
  const handleClearList = () => {
    if (confirm('Tem certeza que deseja limpar toda a lista? Esta ação não pode ser desfeita.')) {
      clearList();
      toast({
        title: "Lista limpa",
        description: "Todos os itens foram removidos.",
      });
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(getShareableLink());
    toast({
      title: "Link copiado!",
      description: "O link foi copiado para sua área de transferência.",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 page-transition" style={{ paddingBottom: '5rem' }}>
      <div className="w-full max-w-md">
        <div className="glass-card p-8 mb-8 text-center animate-blur-in">
          <div className="flex justify-center mb-6">
            <Logo size="lg" />
          </div>
          
          <h1 className="text-3xl font-bold mb-3 text-gradient">Lista de Presentes</h1>
          <p className="text-muted-foreground mb-8">
            Crie sua lista personalizada e compartilhe com quem desejar
          </p>
          
          <div className="grid gap-4">
            <Link to="/create">
              <Button className="w-full btn-primary gap-2">
                <ListPlus size={18} />
                <span>Criar Lista</span>
              </Button>
            </Link>
            
            <Link to="/customize">
              <Button variant="outline" className="w-full btn-secondary gap-2">
                <Paintbrush size={18} />
                <span>Personalizar</span>
              </Button>
            </Link>
            
            {items.length > 0 && (
              <>
                <Link to="/view">
                  <Button variant="outline" className="w-full btn-secondary gap-2">
                    <Eye size={18} />
                    <span>Visualizar Lista</span>
                  </Button>
                </Link>
                
                <Button 
                  variant="outline" 
                  className="w-full btn-secondary gap-2"
                  onClick={handleShare}
                >
                  <Share2 size={18} />
                  <span>Compartilhar Lista</span>
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="mt-4 text-destructive hover:text-destructive/80 hover:bg-destructive/10 gap-2"
                  onClick={handleClearList}
                >
                  <Trash size={16} />
                  <span>Limpar Lista</span>
                </Button>
              </>
            )}
          </div>
        </div>
        
        <div className="text-center text-sm text-muted-foreground">
          <p>Sua lista tem {items.length} {items.length === 1 ? 'item' : 'itens'}</p>
          <p className="mt-1">
            {items.filter(item => item.claimed).length} {items.filter(item => item.claimed).length === 1 ? 'item reservado' : 'itens reservados'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
