
import React from 'react';
import { Label } from '@/components/ui/label';

interface PatternPickerProps {
  value: string;
  onChange: (value: string) => void;
}

const PatternPicker: React.FC<PatternPickerProps> = ({ value, onChange }) => {
  // Common patterns from https://heropatterns.com/
  const patterns = [
    {
      name: 'Nenhum',
      value: '',
      preview: '#ffffff'
    },
    {
      name: 'Polka Dots',
      value: 'radial-gradient(circle, #00000011 1px, transparent 1px) 0 0 / 20px 20px',
      preview: '#f8f8f8'
    },
    {
      name: 'Listras Diagonais',
      value: 'repeating-linear-gradient(45deg, #00000009, #00000009 10px, transparent 10px, transparent 20px)',
      preview: '#fafafa'
    },
    {
      name: 'Xadrez',
      value: 'linear-gradient(45deg, #00000008 25%, transparent 25%, transparent 75%, #00000008 75%), linear-gradient(45deg, #00000008 25%, transparent 25%, transparent 75%, #00000008 75%)',
      preview: '#f5f5f5'
    },
    {
      name: 'Círculos',
      value: 'radial-gradient(#00000010 2px, transparent 2px), radial-gradient(#00000010 2px, transparent 2px) 25px 25px',
      preview: '#f0f0f0'
    },
    {
      name: 'Ondas',
      value: 'linear-gradient(to right, #00000008 1px, transparent 1px), linear-gradient(to bottom, #00000008 1px, transparent 1px)',
      preview: '#fafafa'
    },
    {
      name: 'Zigzag',
      value: 'linear-gradient(135deg, #00000010 25%, transparent 25%) -10px 0, linear-gradient(225deg, #00000010 25%, transparent 25%) -10px 0, linear-gradient(315deg, #00000010 25%, transparent 25%), linear-gradient(45deg, #00000010 25%, transparent 25%)',
      preview: '#f8f8f8'
    },
    {
      name: 'Hexágonos',
      value: 'radial-gradient(at 30% 30%, #00000008 0, transparent 50px), radial-gradient(at 70% 70%, #00000008 0, transparent 50px)',
      preview: '#f5f5f5'
    }
  ];
  
  return (
    <div className="mb-6">
      <Label className="block text-sm font-medium mb-2">Padrão de Fundo</Label>
      
      <div className="grid grid-cols-4 gap-2">
        {patterns.map((pattern, index) => (
          <button
            key={index}
            className={`aspect-square rounded transition-all p-0 overflow-hidden ${
              value === pattern.value ? 'ring-2 ring-primary ring-offset-2' : 'border border-gray-200'
            }`}
            onClick={() => onChange(pattern.value)}
            style={{ 
              background: pattern.preview,
              backgroundImage: pattern.value
            }}
            aria-label={`Pattern ${pattern.name}`}
          >
            <span className="sr-only">{pattern.name}</span>
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        {patterns.find(p => p.value === value)?.name || 'Selecione um padrão'}
      </p>
    </div>
  );
};

export default PatternPicker;
