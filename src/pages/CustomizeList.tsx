
import React, { useState } from 'react';
import { useList } from '../context/ListContext';
import ColorPicker from '../components/ColorPicker';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import PatternPicker from '@/components/PatternPicker';
import { Loader2 } from 'lucide-react';
import { ExtendedListStyle } from '@/lib/api';

const CustomizeList = () => {
  const { listStyle, updateListStyle, loading } = useList();
  const { toast } = useToast();
  const [previewStyle, setPreviewStyle] = useState<ExtendedListStyle>({...listStyle});
  
  const handleFontChange = (value: string) => {
    updateListStyle({ fontFamily: value });
    setPreviewStyle(prev => ({...prev, fontFamily: value}));
    toast({
      title: "Fonte atualizada",
      description: "A fonte da sua lista foi alterada.",
    });
  };
  
  const handleBorderRadiusChange = (value: string) => {
    updateListStyle({ borderRadius: value });
    setPreviewStyle(prev => ({...prev, borderRadius: value}));
  };
  
  const handleItemSpacingChange = (value: string) => {
    updateListStyle({ itemSpacing: value });
    setPreviewStyle(prev => ({...prev, itemSpacing: value}));
  };
  
  const handleBackgroundChange = (color: string) => {
    updateListStyle({ backgroundColor: color });
    setPreviewStyle(prev => ({...prev, backgroundColor: color}));
  };
  
  const handleAccentChange = (color: string) => {
    updateListStyle({ accentColor: color });
    setPreviewStyle(prev => ({...prev, accentColor: color}));
  };
  
  const handleTitleColorChange = (color: string) => {
    updateListStyle({ titleColor: color });
    setPreviewStyle(prev => ({...prev, titleColor: color}));
  };
  
  const handleTextColorChange = (color: string) => {
    updateListStyle({ textColor: color });
    setPreviewStyle(prev => ({...prev, textColor: color}));
  };
  
  const handleBackgroundImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const url = event.target.value;
    updateListStyle({ backgroundImage: url });
    setPreviewStyle(prev => ({...prev, backgroundImage: url}));
  };
  
  const handlePatternChange = (pattern: string) => {
    updateListStyle({ backgroundPattern: pattern });
    setPreviewStyle(prev => ({...prev, backgroundPattern: pattern}));
  };
  
  return (
    <div className="min-h-screen p-6 max-w-md mx-auto page-transition" style={{ paddingBottom: '5rem' }}>
      <h1 className="text-2xl font-bold mb-6 text-gradient">
        Personalizar Lista 
        {loading && <Loader2 className="w-5 h-5 ml-2 inline animate-spin" />}
      </h1>
      
      <Tabs defaultValue="colors" className="glass-card p-4 animate-slide-in">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="colors">Cores</TabsTrigger>
          <TabsTrigger value="typography">Tipografia</TabsTrigger>
          <TabsTrigger value="layout">Layout</TabsTrigger>
        </TabsList>
        
        <TabsContent value="colors" className="p-2">
          <ColorPicker
            label="Cor de Fundo"
            value={previewStyle.backgroundColor}
            onChange={handleBackgroundChange}
          />
          
          <ColorPicker
            label="Cor de Destaque"
            value={previewStyle.accentColor}
            onChange={handleAccentChange}
          />
          
          <ColorPicker
            label="Cor do Título"
            value={previewStyle.titleColor || '#000000'}
            onChange={handleTitleColorChange}
          />
          
          <ColorPicker
            label="Cor do Texto"
            value={previewStyle.textColor || '#333333'}
            onChange={handleTextColorChange}
          />
          
          <div className="mb-6">
            <Label htmlFor="backgroundImage" className="block text-sm font-medium mb-2">
              Imagem de Fundo (URL)
            </Label>
            <Input
              id="backgroundImage"
              value={previewStyle.backgroundImage}
              onChange={handleBackgroundImageChange}
              placeholder="https://exemplo.com/imagem.jpg"
              className="input-primary"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Deixe vazio para remover a imagem de fundo
            </p>
          </div>
          
          <PatternPicker
            value={previewStyle.backgroundPattern || ''}
            onChange={handlePatternChange}
          />
        </TabsContent>
        
        <TabsContent value="typography" className="p-2">
          <div className="mb-6">
            <Label htmlFor="fontFamily" className="block text-sm font-medium mb-2">Fonte</Label>
            <Select value={previewStyle.fontFamily} onValueChange={handleFontChange}>
              <SelectTrigger className="input-primary">
                <SelectValue placeholder="Selecione uma fonte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Inter, sans-serif">Inter</SelectItem>
                <SelectItem value="'Playfair Display', serif">Playfair Display</SelectItem>
                <SelectItem value="'Roboto', sans-serif">Roboto</SelectItem>
                <SelectItem value="'Montserrat', sans-serif">Montserrat</SelectItem>
                <SelectItem value="'Poppins', sans-serif">Poppins</SelectItem>
                <SelectItem value="'Lora', serif">Lora</SelectItem>
                <SelectItem value="'Open Sans', sans-serif">Open Sans</SelectItem>
                <SelectItem value="'Raleway', sans-serif">Raleway</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TabsContent>
        
        <TabsContent value="layout" className="p-2">
          <div className="mb-6">
            <Label htmlFor="borderRadius" className="block text-sm font-medium mb-2">
              Arredondamento de Bordas
            </Label>
            <Select value={previewStyle.borderRadius} onValueChange={handleBorderRadiusChange}>
              <SelectTrigger className="input-primary">
                <SelectValue placeholder="Selecione um arredondamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rounded-none">Sem arredondamento</SelectItem>
                <SelectItem value="rounded-sm">Pequeno</SelectItem>
                <SelectItem value="rounded-md">Médio</SelectItem>
                <SelectItem value="rounded-lg">Grande</SelectItem>
                <SelectItem value="rounded-xl">Extra grande</SelectItem>
                <SelectItem value="rounded-2xl">Duplo extra grande</SelectItem>
                <SelectItem value="rounded-3xl">Triplo extra grande</SelectItem>
                <SelectItem value="rounded-full">Completo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="mb-6">
            <Label htmlFor="itemSpacing" className="block text-sm font-medium mb-2">
              Espaçamento entre Itens
            </Label>
            <Select value={previewStyle.itemSpacing} onValueChange={handleItemSpacingChange}>
              <SelectTrigger className="input-primary">
                <SelectValue placeholder="Selecione um espaçamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Muito pequeno</SelectItem>
                <SelectItem value="2">Pequeno</SelectItem>
                <SelectItem value="4">Médio</SelectItem>
                <SelectItem value="6">Grande</SelectItem>
                <SelectItem value="8">Muito grande</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="glass-card p-6 my-8 animate-slide-in">
        <h2 className="text-xl font-medium mb-4">Visualização</h2>
        
        <div 
          className={`${previewStyle.borderRadius} p-6 transition-all duration-300 shadow-sm`}
          style={{ 
            backgroundColor: previewStyle.backgroundColor,
            fontFamily: previewStyle.fontFamily,
            color: previewStyle.textColor || (isLightColor(previewStyle.backgroundColor) ? '#333333' : '#ffffff'),
            backgroundImage: previewStyle.backgroundImage ? 
              `url(${previewStyle.backgroundImage})` : 
              (previewStyle.backgroundPattern || ''),
            backgroundSize: previewStyle.backgroundImage ? 'cover' : 'auto',
            backgroundPosition: 'center',
            backgroundRepeat: previewStyle.backgroundImage ? 'no-repeat' : 'repeat',
          }}
        >
          <h3 
            className="text-lg font-medium mb-2"
            style={{ color: previewStyle.titleColor || (isLightColor(previewStyle.backgroundColor) ? '#000000' : '#ffffff') }}
          >
            Exemplo de Item
          </h3>
          <p className="text-sm opacity-80 mb-4">Este é um exemplo de como seus itens irão aparecer.</p>
          
          <button 
            style={{ 
              backgroundColor: previewStyle.accentColor,
              color: isLightColor(previewStyle.accentColor) ? '#333333' : '#ffffff',
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
