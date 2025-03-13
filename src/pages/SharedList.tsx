
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useList } from '../context/ListContext';
import ListItem from '../components/ListItem';
import { Button } from '@/components/ui/button';
import { Share2, Loader2, Heart } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import Logo from '@/components/Logo';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const SharedList = () => {
  const { listId } = useParams<{ listId: string }>();
  const navigate = useNavigate();
  const { items, listTitle, listDescription, listImage, listStyle, loading, loadListById } = useList();
  const [filter, setFilter] = useState<'all' | 'available' | 'claimed'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const loadList = async () => {
      if (!listId) {
        navigate('/');
        return;
      }
      
      const success = await loadListById(listId);
      setIsLoading(false);
      
      if (!success) {
        toast({
          title: "Lista não encontrada",
          description: "A lista que você está procurando não existe ou foi removida.",
          variant: "destructive"
        });
        navigate('/');
      }
    };
    
    loadList();
  }, [listId, navigate, loadListById, toast]);
  
  useEffect(() => {
    // Apply custom font if needed
    if (listStyle.fontFamily) {
      const fontName = listStyle.fontFamily.split(',')[0].replace(/['"]+/g, '');
      
      // Only load if not a system font
      if (!['Inter', 'Roboto', 'Arial', 'sans-serif'].includes(fontName)) {
        const link = document.createElement('link');
        link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(' ', '+')}:wght@400;500;700&display=swap`;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
        
        return () => {
          document.head.removeChild(link);
        };
      }
    }
  }, [listStyle.fontFamily]);
  
  const filteredItems = items.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'available') return !item.claimed;
    if (filter === 'claimed') return item.claimed;
    return true;
  });
  
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: listTitle,
          text: `Confira minha lista de presentes: ${listTitle}`,
          url: window.location.href,
        });
      } else {
        // Fallback for browsers that don't support the Web Share API
        navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copiado!",
          description: "O link foi copiado para sua área de transferência.",
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast({
        title: "Erro ao compartilhar",
        description: "Não foi possível compartilhar a lista.",
        variant: "destructive"
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg">Carregando lista...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className={`min-h-screen p-6 transition-all duration-500 page-transition`}
      style={{ 
        backgroundColor: listStyle.backgroundColor,
        fontFamily: listStyle.fontFamily,
        color: listStyle.textColor || (isLightColor(listStyle.backgroundColor) ? '#333333' : '#ffffff'),
        paddingBottom: '5rem',
        backgroundImage: listStyle.backgroundImage ? 
          `url(${listStyle.backgroundImage})` : 
          (listStyle.backgroundPattern || ''),
        backgroundSize: listStyle.backgroundImage ? 'cover' : 'auto',
        backgroundPosition: 'center',
        backgroundRepeat: listStyle.backgroundImage ? 'no-repeat' : 'repeat',
      }}
    >
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-4">
          <Logo size="sm" />
          
          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1"
            onClick={handleShare}
            style={{
              backgroundColor: hexToRgba(listStyle.accentColor, 0.1),
              color: listStyle.accentColor,
              borderColor: hexToRgba(listStyle.accentColor, 0.2)
            }}
          >
            <Share2 size={14} />
            <span>Compartilhar</span>
          </Button>
        </div>
        
        <div className="mb-6">
          <h1 
            className="text-2xl font-bold mb-2"
            style={{ 
              color: listStyle.titleColor || (isLightColor(listStyle.backgroundColor) ? '#000000' : '#ffffff')
            }}
          >
            {listTitle}
            {loading && <Loader2 className="w-5 h-5 ml-2 inline animate-spin" />}
          </h1>
          
          {listImage && (
            <div className="mb-4">
              <img 
                src={listImage} 
                alt={listTitle}
                className="w-full h-auto rounded-lg shadow-md"
              />
            </div>
          )}
          
          <p className="mb-6 opacity-80">{listDescription}</p>
        </div>
        
        <div 
          className={`flex gap-2 mb-6 p-1 rounded-lg`}
          style={{
            backgroundColor: hexToRgba(isLightColor(listStyle.backgroundColor) ? '#000000' : '#ffffff', 0.05)
          }}
        >
          <button
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${filter === 'all' ? 'shadow-sm' : 'opacity-70'}`}
            style={{
              backgroundColor: filter === 'all' ? 
                (isLightColor(listStyle.backgroundColor) ? '#ffffff' : hexToRgba('#ffffff', 0.1)) : 
                'transparent'
            }}
            onClick={() => setFilter('all')}
          >
            Todos
          </button>
          
          <button
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${filter === 'available' ? 'shadow-sm' : 'opacity-70'}`}
            style={{
              backgroundColor: filter === 'available' ? 
                (isLightColor(listStyle.backgroundColor) ? '#ffffff' : hexToRgba('#ffffff', 0.1)) : 
                'transparent'
            }}
            onClick={() => setFilter('available')}
          >
            Disponíveis
          </button>
          
          <button
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${filter === 'claimed' ? 'shadow-sm' : 'opacity-70'}`}
            style={{
              backgroundColor: filter === 'claimed' ? 
                (isLightColor(listStyle.backgroundColor) ? '#ffffff' : hexToRgba('#ffffff', 0.1)) : 
                'transparent'
            }}
            onClick={() => setFilter('claimed')}
          >
            Reservados
          </button>
        </div>
        
        {loading && filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin opacity-70" />
            <p>Carregando itens...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-8 opacity-70">
            <p>Nenhum item encontrado.</p>
          </div>
        ) : (
          <div className={`space-y-${listStyle.itemSpacing}`}>
            {filteredItems.map((item) => (
              <ListItem 
                key={item.id} 
                item={item} 
                viewMode={true} 
                customBorderRadius={listStyle.borderRadius}
                accentColor={listStyle.accentColor}
              />
            ))}
          </div>
        )}
        
        <div className="mt-12 pt-6 border-t border-gray-200/30 text-center text-sm opacity-70">
          <p className="flex items-center justify-center gap-1">
            Criado com <Heart size={14} className="text-red-500" /> no ListaAi
          </p>
        </div>
      </div>
    </div>
  );
};

// Helper function to determine if a color is light or dark
function isLightColor(color: string) {
  // Convert hex to RGB
  let r, g, b;
  if (color.startsWith('#')) {
    const hex = color.substring(1);
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  } else {
    return true; // Default to assuming light for non-hex colors
  }
  
  // Calculate perceived brightness
  const brightness = (r * 0.299 + g * 0.587 + b * 0.114);
  
  // If the brightness is greater than 128, the color is light
  return brightness > 128;
}

// Helper function to convert hex to rgba
function hexToRgba(hex: string, alpha: number) {
  let r, g, b;
  if (hex.startsWith('#')) {
    const hexValue = hex.substring(1);
    r = parseInt(hexValue.substring(0, 2), 16);
    g = parseInt(hexValue.substring(2, 4), 16);
    b = parseInt(hexValue.substring(4, 6), 16);
  } else {
    return hex; // Return original if not hex
  }
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default SharedList;
