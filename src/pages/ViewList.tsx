
import React, { useState } from 'react';
import { useList } from '../context/ListContext';
import ListItem from '../components/ListItem';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

const ViewList = () => {
  const { items, listTitle, listDescription, listStyle } = useList();
  const [filter, setFilter] = useState<'all' | 'available' | 'claimed'>('all');
  const { toast } = useToast();
  
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
  
  return (
    <div 
      className="min-h-screen p-6 transition-all duration-500 page-transition"
      style={{ 
        backgroundColor: listStyle.backgroundColor,
        fontFamily: listStyle.fontFamily,
        color: isLightColor(listStyle.backgroundColor) ? '#333333' : '#ffffff',
        paddingBottom: '5rem'
      }}
    >
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{listTitle}</h1>
          
          <Button 
            onClick={handleShare}
            variant="outline" 
            size="icon"
            className="h-9 w-9 rounded-full"
            style={{
              backgroundColor: hexToRgba(listStyle.accentColor, 0.1),
              color: listStyle.accentColor,
              borderColor: hexToRgba(listStyle.accentColor, 0.2)
            }}
          >
            <Share2 size={16} />
          </Button>
        </div>
        
        <p className="mb-6 opacity-80">{listDescription}</p>
        
        <div 
          className="flex gap-2 mb-6 p-1 rounded-lg"
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
        
        {filteredItems.length === 0 ? (
          <div className="text-center py-8 opacity-70">
            <p>Nenhum item encontrado.</p>
          </div>
        ) : (
          <div>
            {filteredItems.map((item) => (
              <ListItem key={item.id} item={item} viewMode={true} />
            ))}
          </div>
        )}
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

export default ViewList;
