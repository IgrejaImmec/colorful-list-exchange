
import React from 'react';
import { useList } from '../context/ListContext';
import ColorPicker from '../components/ColorPicker';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/components/ui/use-toast";

const CustomizeList = () => {
  const { listStyle, updateListStyle } = useList();
  const { toast } = useToast();
  
  const handleFontChange = (value: string) => {
    updateListStyle({ fontFamily: value });
    toast({
      title: "Fonte atualizada",
      description: "A fonte da sua lista foi alterada.",
    });
  };
  
  const handleBackgroundChange = (color: string) => {
    updateListStyle({ backgroundColor: color });
  };
  
  const handleAccentChange = (color: string) => {
    updateListStyle({ accentColor: color });
  };
  
  return (
    <div className="min-h-screen p-6 max-w-md mx-auto page-transition" style={{ paddingBottom: '5rem' }}>
      <h1 className="text-2xl font-bold mb-6 text-gradient">Personalizar Lista</h1>
      
      <div className="glass-card p-6 mb-8 animate-slide-in">
        <h2 className="text-xl font-medium mb-4">Cores e Estilo</h2>
        
        <ColorPicker
          label="Cor de Fundo"
          value={listStyle.backgroundColor}
          onChange={handleBackgroundChange}
        />
        
        <ColorPicker
          label="Cor de Destaque"
          value={listStyle.accentColor}
          onChange={handleAccentChange}
        />
        
        <div className="mb-6">
          <Label htmlFor="fontFamily" className="block text-sm font-medium mb-2">Fonte</Label>
          <Select value={listStyle.fontFamily} onValueChange={handleFontChange}>
            <SelectTrigger className="input-primary">
              <SelectValue placeholder="Selecione uma fonte" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Inter, sans-serif">Inter</SelectItem>
              <SelectItem value="'Playfair Display', serif">Playfair Display</SelectItem>
              <SelectItem value="'Roboto', sans-serif">Roboto</SelectItem>
              <SelectItem value="'Montserrat', sans-serif">Montserrat</SelectItem>
              <SelectItem value="'Poppins', sans-serif">Poppins</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="glass-card p-6 mb-8 animate-slide-in">
        <h2 className="text-xl font-medium mb-4">Visualização</h2>
        
        <div 
          className="rounded-xl p-6 transition-all duration-300 shadow-sm"
          style={{ 
            backgroundColor: listStyle.backgroundColor,
            fontFamily: listStyle.fontFamily,
            color: isLightColor(listStyle.backgroundColor) ? '#333333' : '#ffffff'
          }}
        >
          <h3 className="text-lg font-medium mb-2">Exemplo de Item</h3>
          <p className="text-sm opacity-80 mb-4">Este é um exemplo de como seus itens irão aparecer.</p>
          
          <button 
            style={{ 
              backgroundColor: listStyle.accentColor,
              color: isLightColor(listStyle.accentColor) ? '#333333' : '#ffffff',
            }}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90"
          >
            Botão de Exemplo
          </button>
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
  
  // Calculate perceived brightness using the formula
  // (0.299*R + 0.587*G + 0.114*B)
  const brightness = (r * 0.299 + g * 0.587 + b * 0.114);
  
  // If the brightness is greater than 128, the color is light
  return brightness > 128;
}

export default CustomizeList;
