import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { DEMO_PRESETS, DemoPreset } from '../data/demoPresets.js';

interface DemoPresetsBarProps {
  onSelectPreset: (preset: DemoPreset) => void;
  disabled?: boolean;
}

export const DemoPresetsBar: React.FC<DemoPresetsBarProps> = ({ onSelectPreset, disabled }) => {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h2 className="text-xs sm:text-sm font-bold text-neutral-300 uppercase tracking-wider">
            Demo Mode: Try Sample Products
          </h2>
        </div>
        <span className="text-xs text-neutral-500 hidden sm:inline">
          Click any preset to test the complete visual search flow immediately
        </span>
      </div>

      {/* Grid of sample cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {DEMO_PRESETS.map((preset) => (
          <button
            key={preset.id}
            id={`btn-preset-${preset.id}`}
            onClick={() => onSelectPreset(preset)}
            disabled={disabled}
            className="group text-left bg-neutral-900 border border-neutral-800 hover:border-amber-500/50 rounded-xl p-2.5 transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/5 flex flex-col justify-between disabled:opacity-50"
          >
            <div className="relative aspect-square rounded-lg overflow-hidden bg-neutral-950 mb-2">
              <img
                src={preset.imageUrl}
                alt={preset.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              <span className="absolute top-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/70 text-amber-300 backdrop-blur-xs">
                {preset.tag}
              </span>
            </div>

            <div>
              <p className="text-xs font-semibold text-white truncate group-hover:text-amber-400 transition-colors">
                {preset.title}
              </p>
              <p className="text-[10px] text-neutral-400 truncate">
                {preset.subtitle}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
