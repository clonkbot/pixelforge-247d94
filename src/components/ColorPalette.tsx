import React, { useState } from 'react';

interface ColorPaletteProps {
  color: string;
  setColor: (color: string) => void;
}

const PALETTE_COLORS = [
  // Neon row
  '#00fff7', '#39ff14', '#ff2d6a', '#ffd700', '#ff6b00', '#8b5cf6',
  // Pastels
  '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#1dd1a1', '#feca57',
  // Basics
  '#ffffff', '#c8d6e5', '#8395a7', '#576574', '#222f3e', '#000000',
  // Earth tones
  '#ff6b6b', '#ee5a24', '#f79f1f', '#a3cb38', '#009432', '#0652DD',
  // Skin tones
  '#fcd5b5', '#e8beac', '#d4a574', '#b8763c', '#8d5524', '#5c3317',
];

export const ColorPalette: React.FC<ColorPaletteProps> = ({ color, setColor }) => {
  const [customColor, setCustomColor] = useState(color);

  return (
    <div className="p-4 border-b border-cyan-500/20">
      {/* Section Label */}
      <div className="text-[10px] font-bold tracking-widest text-cyan-500/50 uppercase mb-3">
        Colors
      </div>

      {/* Current Color Display */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-14 h-14 rounded-xl border-2 border-cyan-400/50 shadow-lg transition-all duration-300"
          style={{
            backgroundColor: color,
            boxShadow: `0 0 20px ${color}40, 0 0 40px ${color}20`,
          }}
        />
        <div className="flex-1">
          <div className="text-xs text-gray-400 mb-1">Current</div>
          <input
            type="text"
            value={color}
            onChange={(e) => {
              if (/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value)) {
                setCustomColor(e.target.value);
                if (e.target.value.length === 7) {
                  setColor(e.target.value);
                }
              }
            }}
            className="w-full px-2 py-1 text-xs font-mono bg-[#1a1a2e] border border-cyan-500/30 rounded-md text-cyan-400 focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      {/* Color Picker */}
      <div className="relative mb-4">
        <input
          type="color"
          value={color}
          onChange={(e) => {
            setColor(e.target.value);
            setCustomColor(e.target.value);
          }}
          className="absolute inset-0 w-full h-10 opacity-0 cursor-pointer"
        />
        <div className="w-full h-10 rounded-lg bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-cyan-500 via-blue-500 to-purple-500 border border-cyan-500/30 flex items-center justify-center">
          <span className="text-xs font-medium text-white drop-shadow-lg">Pick Custom Color</span>
        </div>
      </div>

      {/* Preset Palette */}
      <div className="grid grid-cols-6 gap-1.5">
        {PALETTE_COLORS.map((c, i) => (
          <button
            key={`${c}-${i}`}
            onClick={() => setColor(c)}
            className={`
              aspect-square rounded-lg transition-all duration-200 hover:scale-110
              ${color === c
                ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0a0a0f] scale-110'
                : 'hover:ring-1 hover:ring-cyan-400/50'
              }
            `}
            style={{
              backgroundColor: c,
              boxShadow: color === c ? `0 0 12px ${c}60` : 'none',
            }}
          />
        ))}
      </div>
    </div>
  );
};
