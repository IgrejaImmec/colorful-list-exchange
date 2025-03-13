
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Image, Upload, X } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

interface ImageUploaderProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  value, 
  onChange, 
  label = "Imagem da Lista" 
}) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Simulate image upload to server
  const simulateUpload = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      setLoading(true);
      setTimeout(() => {
        // Create a local URL for preview
        const reader = new FileReader();
        reader.onload = () => {
          setLoading(false);
          resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
      }, 1000);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Formato inválido",
        description: "Por favor, selecione uma imagem.",
        variant: "destructive"
      });
      return;
    }

    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "A imagem deve ter no máximo 5MB.",
        variant: "destructive"
      });
      return;
    }

    try {
      const imageUrl = await simulateUpload(file);
      onChange(imageUrl);
      toast({
        title: "Imagem adicionada",
        description: "A imagem foi adicionada com sucesso."
      });
    } catch (error) {
      toast({
        title: "Erro ao fazer upload",
        description: "Não foi possível fazer o upload da imagem.",
        variant: "destructive"
      });
    }
  };

  const handleRemoveImage = () => {
    onChange('');
    toast({
      title: "Imagem removida",
      description: "A imagem foi removida da sua lista."
    });
  };

  return (
    <div className="mb-6">
      <Label className="block text-sm font-medium mb-2">{label}</Label>
      
      {value ? (
        <div className="relative">
          <img 
            src={value} 
            alt="Lista" 
            className="w-full h-48 object-cover rounded-lg mb-2"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-7 w-7 rounded-full bg-white/80 text-destructive hover:bg-white"
            onClick={handleRemoveImage}
          >
            <X size={16} />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
          <input
            type="file"
            id="image-upload"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <label 
            htmlFor="image-upload" 
            className="cursor-pointer block p-4 hover:bg-gray-50 transition-colors rounded-md"
          >
            {loading ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin h-8 w-8 border-2 border-primary rounded-full border-t-transparent mb-2"></div>
                <span className="text-sm text-gray-600">Carregando...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Image className="h-10 w-10 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">Clique para adicionar uma imagem</span>
                <span className="text-xs text-gray-500 mt-1">JPG, PNG ou GIF (máx. 5MB)</span>
              </div>
            )}
          </label>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
