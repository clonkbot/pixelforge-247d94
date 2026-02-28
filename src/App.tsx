import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Canvas } from './components/Canvas';
import { Toolbar } from './components/Toolbar';
import { ColorPalette } from './components/ColorPalette';
import { LayerPanel } from './components/LayerPanel';

export type Tool = 'pencil' | 'eraser' | 'fill' | 'eyedropper' | 'line' | 'rectangle';

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  pixels: (string | null)[][];
}

const GRID_SIZE = 32;

const createEmptyGrid = (): (string | null)[][] =>
  Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));

const initialLayer: Layer = {
  id: 'layer-1',
  name: 'Layer 1',
  visible: true,
  pixels: createEmptyGrid(),
};

function App() {
  const [tool, setTool] = useState<Tool>('pencil');
  const [color, setColor] = useState('#00fff7');
  const [layers, setLayers] = useState<Layer[]>([initialLayer]);
  const [activeLayerId, setActiveLayerId] = useState('layer-1');
  const [showMobileTools, setShowMobileTools] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const activeLayer = layers.find(l => l.id === activeLayerId) || layers[0];

  const updatePixel = useCallback((x: number, y: number, newColor: string | null) => {
    setLayers(prev => prev.map(layer => {
      if (layer.id !== activeLayerId) return layer;
      const newPixels = layer.pixels.map(row => [...row]);
      newPixels[y][x] = newColor;
      return { ...layer, pixels: newPixels };
    }));
  }, [activeLayerId]);

  const floodFill = useCallback((startX: number, startY: number, fillColor: string) => {
    setLayers(prev => prev.map(layer => {
      if (layer.id !== activeLayerId) return layer;

      const newPixels = layer.pixels.map(row => [...row]);
      const targetColor = newPixels[startY][startX];

      if (targetColor === fillColor) return layer;

      const stack: [number, number][] = [[startX, startY]];
      const visited = new Set<string>();

      while (stack.length > 0) {
        const [x, y] = stack.pop()!;
        const key = `${x},${y}`;

        if (visited.has(key)) continue;
        if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) continue;
        if (newPixels[y][x] !== targetColor) continue;

        visited.add(key);
        newPixels[y][x] = fillColor;

        stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
      }

      return { ...layer, pixels: newPixels };
    }));
  }, [activeLayerId]);

  const pickColor = useCallback((x: number, y: number) => {
    const pixelColor = activeLayer.pixels[y][x];
    if (pixelColor) {
      setColor(pixelColor);
      setTool('pencil');
    }
  }, [activeLayer]);

  const addLayer = useCallback(() => {
    const newId = `layer-${Date.now()}`;
    setLayers(prev => [...prev, {
      id: newId,
      name: `Layer ${prev.length + 1}`,
      visible: true,
      pixels: createEmptyGrid(),
    }]);
    setActiveLayerId(newId);
  }, []);

  const deleteLayer = useCallback((id: string) => {
    if (layers.length <= 1) return;
    setLayers(prev => prev.filter(l => l.id !== id));
    if (activeLayerId === id) {
      setActiveLayerId(layers[0].id === id ? layers[1]?.id : layers[0].id);
    }
  }, [layers, activeLayerId]);

  const toggleLayerVisibility = useCallback((id: string) => {
    setLayers(prev => prev.map(l =>
      l.id === id ? { ...l, visible: !l.visible } : l
    ));
  }, []);

  const clearCanvas = useCallback(() => {
    setLayers(prev => prev.map(layer =>
      layer.id === activeLayerId
        ? { ...layer, pixels: createEmptyGrid() }
        : layer
    ));
  }, [activeLayerId]);

  const exportImage = useCallback(() => {
    const canvas = document.createElement('canvas');
    canvas.width = GRID_SIZE * 10;
    canvas.height = GRID_SIZE * 10;
    const ctx = canvas.getContext('2d')!;

    layers.filter(l => l.visible).forEach(layer => {
      layer.pixels.forEach((row, y) => {
        row.forEach((pixelColor, x) => {
          if (pixelColor) {
            ctx.fillStyle = pixelColor;
            ctx.fillRect(x * 10, y * 10, 10, 10);
          }
        });
      });
    });

    const link = document.createElement('a');
    link.download = 'pixel-art.png';
    link.href = canvas.toDataURL();
    link.click();
  }, [layers]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white relative overflow-hidden flex flex-col">
      {/* CRT Scanline Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,247,0.1) 2px, rgba(0,255,247,0.1) 4px)',
        }}
      />

      {/* Ambient Glow Effects */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-cyan-500/20 bg-black/40 backdrop-blur-sm">
        <div className="px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-pink-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <span className="text-lg md:text-xl font-bold">P</span>
            </div>
            <h1 className="font-display text-xl md:text-2xl font-bold tracking-tight">
              <span className="text-cyan-400">PIXEL</span>
              <span className="text-pink-400">FORGE</span>
            </h1>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={clearCanvas}
              className="px-3 md:px-4 py-2 text-xs md:text-sm font-medium rounded-lg border border-pink-500/50 text-pink-400 hover:bg-pink-500/10 transition-all duration-200 hover:shadow-lg hover:shadow-pink-500/20"
            >
              Clear
            </button>
            <button
              onClick={exportImage}
              className="px-3 md:px-4 py-2 text-xs md:text-sm font-medium rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-400 text-black hover:from-cyan-400 hover:to-cyan-300 transition-all duration-200 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-400/50"
            >
              Export
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row relative z-10 overflow-hidden">
        {/* Mobile Tool Toggle */}
        <button
          onClick={() => setShowMobileTools(!showMobileTools)}
          className="lg:hidden fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-pink-500 flex items-center justify-center shadow-lg shadow-cyan-500/30"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
        </button>

        {/* Left Sidebar - Tools */}
        <aside className={`
          ${showMobileTools ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          fixed lg:relative inset-y-0 left-0 z-30 w-72 lg:w-20
          bg-black/80 lg:bg-black/40 backdrop-blur-sm
          border-r border-cyan-500/20
          transition-transform duration-300 ease-out
          flex flex-col
          pt-16 lg:pt-0
        `}>
          <div className="lg:hidden absolute top-4 right-4">
            <button onClick={() => setShowMobileTools(false)} className="p-2 text-cyan-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <Toolbar tool={tool} setTool={setTool} />

          <div className="lg:hidden px-4 pb-4">
            <ColorPalette color={color} setColor={setColor} />
          </div>
        </aside>

        {/* Canvas Area */}
        <div className="flex-1 flex items-center justify-center p-4 md:p-8 overflow-auto">
          <Canvas
            ref={canvasRef}
            layers={layers}
            tool={tool}
            color={color}
            updatePixel={updatePixel}
            floodFill={floodFill}
            pickColor={pickColor}
            gridSize={GRID_SIZE}
          />
        </div>

        {/* Right Sidebar - Colors & Layers */}
        <aside className="hidden lg:flex w-64 bg-black/40 backdrop-blur-sm border-l border-cyan-500/20 flex-col">
          <ColorPalette color={color} setColor={setColor} />
          <LayerPanel
            layers={layers}
            activeLayerId={activeLayerId}
            setActiveLayerId={setActiveLayerId}
            addLayer={addLayer}
            deleteLayer={deleteLayer}
            toggleVisibility={toggleLayerVisibility}
          />
        </aside>
      </main>

      {/* Mobile Bottom Bar - Colors */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-black/90 backdrop-blur-sm border-t border-cyan-500/20 px-4 py-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <div
            className="w-10 h-10 rounded-lg border-2 border-cyan-400 flex-shrink-0"
            style={{ backgroundColor: color }}
          />
          {['#00fff7', '#ff2d6a', '#39ff14', '#ffd700', '#ff6b00', '#8b5cf6', '#ffffff', '#000000'].map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-10 h-10 rounded-lg flex-shrink-0 transition-all duration-200 ${color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-110' : 'hover:scale-105'}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-cyan-500/10 bg-black/20 py-3 text-center mb-16 lg:mb-0">
        <p className="text-[11px] md:text-xs text-gray-500/60 tracking-wide font-mono">
          Requested by <span className="text-gray-400/70">@brandonn2221</span> · Built by <span className="text-gray-400/70">@clonkbot</span>
        </p>
      </footer>

      {/* Click outside to close mobile menu */}
      {showMobileTools && (
        <div
          className="lg:hidden fixed inset-0 z-20 bg-black/50"
          onClick={() => setShowMobileTools(false)}
        />
      )}
    </div>
  );
}

export default App;
