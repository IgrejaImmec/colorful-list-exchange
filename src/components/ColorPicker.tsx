
import React from 'react';

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange, label }) => {
  const presetColors = [
    '#ffffff', '#f5f5f5', '#fafafa', '#f0f9ff', '#f0fdf4', '#fffbeb',
    '#0ea5e9', '#4f46e5', '#8b5cf6', '#ec4899', '#f43f5e', '#10b981',
    '#fbbf24', '#f97316', '#ef4444', '#000000', '#111111', '#333333'
  ];
  
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium mb-2">{label}</label>
      
      <div className="flex gap-2 items-center mb-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 border-0 p-0 bg-transparent cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input-primary text-sm"
          placeholder="#000000"
        />
      </div>
      
      <div className="grid grid-cols-6 gap-2">
        {presetColors.map((color) => (
          <button
            key={color}
            onClick={() => onChange(color)}
            className={`w-full aspect-square rounded-md transition-transform hover:scale-110 ${
              value === color ? 'ring-2 ring-primary ring-offset-2' : ''
            }`}
            style={{ backgroundColor: color }}
            aria-label={`Color ${color}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorPicker;
