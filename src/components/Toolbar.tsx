import React from 'react';
import type { Tool } from '../App';

interface ToolbarProps {
  tool: Tool;
  setTool: (tool: Tool) => void;
}

interface ToolButtonProps {
  id: Tool;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const ToolButton: React.FC<ToolButtonProps> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`
      group relative w-12 h-12 rounded-xl flex items-center justify-center
      transition-all duration-200 ease-out
      ${isActive
        ? 'bg-gradient-to-br from-cyan-500 to-cyan-400 text-black shadow-lg shadow-cyan-500/40 scale-105'
        : 'bg-[#1a1a2e] text-cyan-400/60 hover:text-cyan-400 hover:bg-[#252540] border border-cyan-500/20 hover:border-cyan-500/40'
      }
    `}
    title={label}
  >
    {icon}
    <span className={`
      absolute left-full ml-3 px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap
      bg-[#1a1a2e] border border-cyan-500/30 text-cyan-400
      opacity-0 group-hover:opacity-100 transition-opacity duration-200
      pointer-events-none lg:hidden
    `}>
      {label}
    </span>
  </button>
);

export const Toolbar: React.FC<ToolbarProps> = ({ tool, setTool }) => {
  const tools: { id: Tool; icon: React.ReactNode; label: string }[] = [
    {
      id: 'pencil',
      label: 'Pencil',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      ),
    },
    {
      id: 'eraser',
      label: 'Eraser',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
    },
    {
      id: 'fill',
      label: 'Fill Bucket',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19.228 18.732l1.768-1.768 1.767 1.768a2.5 2.5 0 11-3.535 0zM8.878 1.08l11.314 11.313a1 1 0 010 1.415l-8.485 8.485a1 1 0 01-1.414 0l-8.485-8.485a1 1 0 010-1.415l7.778-7.778-2.122-2.121L8.88 1.08zM11 6.03L3.929 13.1H18.07L11 6.03z"/>
        </svg>
      ),
    },
    {
      id: 'eyedropper',
      label: 'Eyedropper',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
    },
    {
      id: 'line',
      label: 'Line',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 20L20 4" />
        </svg>
      ),
    },
    {
      id: 'rectangle',
      label: 'Rectangle',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth={2} />
        </svg>
      ),
    },
  ];

  return (
    <div className="p-3 lg:p-4 flex lg:flex-col gap-2 lg:gap-3">
      {/* Section Label */}
      <div className="hidden lg:block text-[10px] font-bold tracking-widest text-cyan-500/50 uppercase mb-1">
        Tools
      </div>

      {tools.map(t => (
        <ToolButton
          key={t.id}
          {...t}
          isActive={tool === t.id}
          onClick={() => setTool(t.id)}
        />
      ))}
    </div>
  );
};
