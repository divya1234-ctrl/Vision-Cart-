import React, { useRef } from 'react';
import { Camera, Sparkles, Layers, RefreshCw, AlertCircle, Chrome, MonitorSmartphone, Download, Upload } from 'lucide-react';

interface NavbarProps {
  onReset: () => void;
  onOpenArchitecture: () => void;
  onOpenExtensionModal: () => void;
  onToggleSimulator: () => void;
  isSimulatorMode: boolean;
  geminiActive: boolean;
  hasActiveSearch: boolean;
  onImageSelected?: (base64: string, mimeType: string) => void;
  onOpenCamera?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onReset,
  onOpenArchitecture,
  onOpenExtensionModal,
  onToggleSimulator,
  isSimulatorMode,
  geminiActive,
  hasActiveSearch,
  onImageSelected,
  onOpenCamera,
}) => {
  const navFileInputRef = useRef<HTMLInputElement>(null);

  const handleNavFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        if (result && onImageSelected) {
          onImageSelected(result, file.type);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-neutral-900/95 backdrop-blur-md border-b border-neutral-800 text-white">
      <input
        ref={navFileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleNavFileChange}
        className="hidden"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div
          id="brand-logo"
          onClick={onReset}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-amber-500 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
            <div className="w-full h-full bg-neutral-950 rounded-[10px] flex items-center justify-center">
              <Camera className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-white font-sans">
                VISION<span className="text-amber-400">CART</span>
              </span>
              <span className="text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700">
                Extension
              </span>
            </div>
            <p className="text-xs text-neutral-400 hidden sm:block">Find products from a picture.</p>
          </div>
        </div>

        {/* Center / Status */}
        <div className="hidden lg:flex items-center gap-3">
          <button
            onClick={onToggleSimulator}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
              isSimulatorMode
                ? 'bg-amber-400 text-neutral-950 border-amber-300 shadow-sm'
                : 'bg-neutral-800/80 hover:bg-neutral-700/80 text-neutral-300 border-neutral-700'
            }`}
          >
            <MonitorSmartphone className="w-3.5 h-3.5" />
            <span>{isSimulatorMode ? 'Store Simulator Active' : 'Live Store Simulator'}</span>
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-800/80 border border-neutral-700/80 text-xs text-neutral-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Gemini Vision AI</span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 ml-1"></span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Always Available Upload Button in Navbar */}
          <button
            id="nav-btn-upload-image"
            onClick={() => navFileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs sm:text-sm font-bold shadow-md shadow-amber-400/20 transition-transform active:scale-95 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Image</span>
          </button>

          <button
            onClick={onToggleSimulator}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
              isSimulatorMode
                ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700'
                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700'
            }`}
          >
            <MonitorSmartphone className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">{isSimulatorMode ? 'Exit Simulator' : 'Test on E-Commerce'}</span>
            <span className="sm:hidden">{isSimulatorMode ? 'Exit' : 'Demo'}</span>
          </button>

          {hasActiveSearch && (
            <button
              id="btn-nav-new-search"
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 text-xs font-semibold transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
