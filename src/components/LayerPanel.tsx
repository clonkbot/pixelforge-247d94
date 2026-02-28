import React from 'react';
import type { Layer } from '../App';

interface LayerPanelProps {
  layers: Layer[];
  activeLayerId: string;
  setActiveLayerId: (id: string) => void;
  addLayer: () => void;
  deleteLayer: (id: string) => void;
  toggleVisibility: (id: string) => void;
}

export const LayerPanel: React.FC<LayerPanelProps> = ({
  layers,
  activeLayerId,
  setActiveLayerId,
  addLayer,
  deleteLayer,
  toggleVisibility,
}) => {
  return (
    <div className="flex-1 p-4 flex flex-col min-h-0">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10px] font-bold tracking-widest text-cyan-500/50 uppercase">
          Layers
        </div>
        <button
          onClick={addLayer}
          className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/30 hover:border-cyan-400 transition-all duration-200 flex items-center justify-center"
          title="Add Layer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Layer List */}
      <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
        {[...layers].reverse().map((layer, index) => (
          <div
            key={layer.id}
            onClick={() => setActiveLayerId(layer.id)}
            className={`
              group relative p-3 rounded-xl cursor-pointer transition-all duration-200
              ${layer.id === activeLayerId
                ? 'bg-gradient-to-r from-cyan-500/20 to-pink-500/10 border border-cyan-500/40'
                : 'bg-[#1a1a2e]/50 border border-transparent hover:border-cyan-500/20 hover:bg-[#1a1a2e]'
              }
            `}
          >
            <div className="flex items-center gap-3">
              {/* Layer Preview Thumbnail */}
              <div className="w-10 h-10 rounded-lg bg-[#0a0a0f] border border-cyan-500/20 overflow-hidden flex-shrink-0">
                <div
                  className="w-full h-full"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(8, 1fr)',
                  }}
                >
                  {layer.pixels.slice(0, 8).map((row, y) =>
                    row.slice(0, 8).map((c, x) => (
                      <div
                        key={`${x}-${y}`}
                        style={{ backgroundColor: c || 'transparent' }}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* Layer Info */}
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium truncate ${layer.id === activeLayerId ? 'text-cyan-400' : 'text-gray-300'}`}>
                  {layer.name}
                </div>
                <div className="text-[10px] text-gray-500">
                  {layer.visible ? 'Visible' : 'Hidden'}
                </div>
              </div>

              {/* Layer Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleVisibility(layer.id);
                  }}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 ${
                    layer.visible
                      ? 'text-cyan-400 hover:bg-cyan-500/20'
                      : 'text-gray-500 hover:bg-gray-500/20'
                  }`}
                  title={layer.visible ? 'Hide Layer' : 'Show Layer'}
                >
                  {layer.visible ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>

                {layers.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteLayer(layer.id);
                    }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-pink-400/60 hover:text-pink-400 hover:bg-pink-500/20 transition-all duration-200"
                    title="Delete Layer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Layer Count */}
      <div className="mt-3 pt-3 border-t border-cyan-500/10">
        <div className="text-[10px] text-gray-500 text-center">
          {layers.length} layer{layers.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
};
