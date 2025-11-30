'use client';

import { useState, useRef, useEffect } from 'react';
import { Check, Palette } from 'lucide-react';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  disabled?: boolean;
  className?: string;
}

const MODERN_COLORS = [
  '#3B82F6', // Blue
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#1E293B', // Slate
  '#0EA5E9', // Sky
];

export function ColorPicker({ value, onChange, disabled = false, className = '' }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleColorSelect = (color: string) => {
    onChange(color);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div 
          className="w-5 h-5 rounded border border-slate-300 dark:border-slate-600"
          style={{ backgroundColor: value }}
        />
        <span className="text-sm text-slate-700 dark:text-slate-300">Color</span>
        <Palette className="w-4 h-4 text-slate-500" />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full mt-1 left-0 bg-white dark:bg-slate-800 rounded-lg shadow-xl p-2 z-[100] border border-slate-200 dark:border-slate-700 min-w-[160px]">
          <div className="grid grid-cols-4 gap-1.5">
            {MODERN_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => handleColorSelect(color)}
                disabled={disabled}
                className={`
                  relative w-8 h-8 rounded transition-all
                  hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed
                  ${value.toLowerCase() === color.toLowerCase() 
                    ? 'ring-2 ring-offset-1 ring-slate-900 dark:ring-white' 
                    : 'hover:ring-2 hover:ring-slate-400'
                  }
                `}
                style={{ backgroundColor: color }}
                title={color}
              >
                {value.toLowerCase() === color.toLowerCase() && (
                  <Check className="absolute inset-0 m-auto w-4 h-4 text-white drop-shadow-lg" strokeWidth={3} />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
