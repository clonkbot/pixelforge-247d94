import React, { forwardRef, useRef, useState, useCallback, useEffect } from 'react';
import type { Layer, Tool } from '../App';

interface CanvasProps {
  layers: Layer[];
  tool: Tool;
  color: string;
  updatePixel: (x: number, y: number, color: string | null) => void;
  floodFill: (x: number, y: number, color: string) => void;
  pickColor: (x: number, y: number) => void;
  gridSize: number;
}

export const Canvas = forwardRef<HTMLCanvasElement, CanvasProps>(({
  layers,
  tool,
  color,
  updatePixel,
  floodFill,
  pickColor,
  gridSize,
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lineStart, setLineStart] = useState<{ x: number; y: number } | null>(null);
  const [rectStart, setRectStart] = useState<{ x: number; y: number } | null>(null);
  const [previewPos, setPreviewPos] = useState<{ x: number; y: number } | null>(null);

  const getCellFromEvent = useCallback((e: React.MouseEvent | React.TouchEvent): { x: number; y: number } | null => {
    const container = containerRef.current;
    if (!container) return null;

    const rect = container.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0]?.clientX ?? e.changedTouches[0]?.clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0]?.clientY ?? e.changedTouches[0]?.clientY : e.clientY;

    const x = Math.floor((clientX - rect.left) / (rect.width / gridSize));
    const y = Math.floor((clientY - rect.top) / (rect.height / gridSize));

    if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) return null;
    return { x, y };
  }, [gridSize]);

  const handleStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const cell = getCellFromEvent(e);
    if (!cell) return;

    setIsDrawing(true);

    if (tool === 'pencil') {
      updatePixel(cell.x, cell.y, color);
    } else if (tool === 'eraser') {
      updatePixel(cell.x, cell.y, null);
    } else if (tool === 'fill') {
      floodFill(cell.x, cell.y, color);
    } else if (tool === 'eyedropper') {
      pickColor(cell.x, cell.y);
    } else if (tool === 'line') {
      setLineStart(cell);
      setPreviewPos(cell);
    } else if (tool === 'rectangle') {
      setRectStart(cell);
      setPreviewPos(cell);
    }
  }, [tool, color, getCellFromEvent, updatePixel, floodFill, pickColor]);

  const handleMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const cell = getCellFromEvent(e);
    if (!cell) return;

    if (isDrawing) {
      if (tool === 'pencil') {
        updatePixel(cell.x, cell.y, color);
      } else if (tool === 'eraser') {
        updatePixel(cell.x, cell.y, null);
      } else if (tool === 'line' || tool === 'rectangle') {
        setPreviewPos(cell);
      }
    }
  }, [isDrawing, tool, color, getCellFromEvent, updatePixel]);

  const handleEnd = useCallback(() => {
    if (tool === 'line' && lineStart && previewPos) {
      // Draw line using Bresenham's algorithm
      const dx = Math.abs(previewPos.x - lineStart.x);
      const dy = Math.abs(previewPos.y - lineStart.y);
      const sx = lineStart.x < previewPos.x ? 1 : -1;
      const sy = lineStart.y < previewPos.y ? 1 : -1;
      let err = dx - dy;
      let x = lineStart.x;
      let y = lineStart.y;

      while (true) {
        updatePixel(x, y, color);
        if (x === previewPos.x && y === previewPos.y) break;
        const e2 = 2 * err;
        if (e2 > -dy) { err -= dy; x += sx; }
        if (e2 < dx) { err += dx; y += sy; }
      }
    } else if (tool === 'rectangle' && rectStart && previewPos) {
      // Draw rectangle
      const minX = Math.min(rectStart.x, previewPos.x);
      const maxX = Math.max(rectStart.x, previewPos.x);
      const minY = Math.min(rectStart.y, previewPos.y);
      const maxY = Math.max(rectStart.y, previewPos.y);

      for (let x = minX; x <= maxX; x++) {
        updatePixel(x, minY, color);
        updatePixel(x, maxY, color);
      }
      for (let y = minY; y <= maxY; y++) {
        updatePixel(minX, y, color);
        updatePixel(maxX, y, color);
      }
    }

    setIsDrawing(false);
    setLineStart(null);
    setRectStart(null);
    setPreviewPos(null);
  }, [tool, lineStart, rectStart, previewPos, color, updatePixel]);

  // Flatten visible layers for rendering
  const flattenedPixels: (string | null)[][] = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null));
  layers.filter(l => l.visible).forEach(layer => {
    layer.pixels.forEach((row, y) => {
      row.forEach((pixelColor, x) => {
        if (pixelColor) {
          flattenedPixels[y][x] = pixelColor;
        }
      });
    });
  });

  // Calculate preview pixels for line/rectangle
  const previewPixels: Set<string> = new Set();
  if (isDrawing && previewPos) {
    if (tool === 'line' && lineStart) {
      const dx = Math.abs(previewPos.x - lineStart.x);
      const dy = Math.abs(previewPos.y - lineStart.y);
      const sx = lineStart.x < previewPos.x ? 1 : -1;
      const sy = lineStart.y < previewPos.y ? 1 : -1;
      let err = dx - dy;
      let x = lineStart.x;
      let y = lineStart.y;
      while (true) {
        previewPixels.add(`${x},${y}`);
        if (x === previewPos.x && y === previewPos.y) break;
        const e2 = 2 * err;
        if (e2 > -dy) { err -= dy; x += sx; }
        if (e2 < dx) { err += dx; y += sy; }
      }
    } else if (tool === 'rectangle' && rectStart) {
      const minX = Math.min(rectStart.x, previewPos.x);
      const maxX = Math.max(rectStart.x, previewPos.x);
      const minY = Math.min(rectStart.y, previewPos.y);
      const maxY = Math.max(rectStart.y, previewPos.y);
      for (let x = minX; x <= maxX; x++) {
        previewPixels.add(`${x},${minY}`);
        previewPixels.add(`${x},${maxY}`);
      }
      for (let y = minY; y <= maxY; y++) {
        previewPixels.add(`${minX},${y}`);
        previewPixels.add(`${maxX},${y}`);
      }
    }
  }

  return (
    <div className="relative">
      {/* Outer Glow Frame */}
      <div className="absolute -inset-2 md:-inset-4 bg-gradient-to-br from-cyan-500/20 via-transparent to-pink-500/20 rounded-xl blur-xl" />

      {/* Inner Frame */}
      <div className="relative bg-[#12121a] p-2 md:p-3 rounded-xl border border-cyan-500/30 shadow-2xl shadow-cyan-500/10">
        {/* Canvas Grid */}
        <div
          ref={containerRef}
          className="relative grid bg-[#1a1a2e] rounded-lg overflow-hidden touch-none select-none"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            width: 'min(80vw, 80vh, 512px)',
            height: 'min(80vw, 80vh, 512px)',
          }}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
        >
          {flattenedPixels.map((row, y) =>
            row.map((pixelColor, x) => {
              const isPreview = previewPixels.has(`${x},${y}`);
              return (
                <div
                  key={`${x}-${y}`}
                  className="aspect-square transition-colors duration-75"
                  style={{
                    backgroundColor: isPreview ? color : (pixelColor || 'transparent'),
                    opacity: isPreview && !pixelColor ? 0.6 : 1,
                    boxShadow: pixelColor ? `0 0 4px ${pixelColor}40` : 'none',
                  }}
                />
              );
            })
          )}

          {/* Grid Overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(0,255,247,0.1) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(0,255,247,0.1) 1px, transparent 1px)
              `,
              backgroundSize: `${100 / gridSize}% ${100 / gridSize}%`,
            }}
          />
        </div>

        {/* Corner Decorations */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400 rounded-tl-lg" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400 rounded-tr-lg" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-pink-400 rounded-bl-lg" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-pink-400 rounded-br-lg" />
      </div>
    </div>
  );
});

Canvas.displayName = 'Canvas';
