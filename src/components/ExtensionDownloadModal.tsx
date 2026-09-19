import React, { useState } from 'react';
import {
  X,
  Download,
  Chrome,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  ArrowRight,
  Sparkles,
  MonitorSmartphone,
  GitBranch,
  Server,
  Terminal,
  ShieldCheck,
  Key
} from 'lucide-react';

interface ExtensionDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSimulator: () => void;
}

export const ExtensionDownloadModal: React.FC<ExtensionDownloadModalProps> = ({
  isOpen,
  onClose,
  onOpenSimulator,
}) => {
  const [activeTab, setActiveTab] = useState<'extension' | 'github'>('extension');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedGit, setCopiedGit] = useState(false);
  const currentOrigin = window.location.origin;

  if (!isOpen) return null;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(currentOrigin);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const gitCommands = `git init
git add .
git commit -m "Deploy VisionCart"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/visioncart.git
git push -u origin main`;

  const handleCopyGit = () => {
    navigator.clipboard.writeText(gitCommands);
    setCopiedGit(true);
    setTimeout(() => setCopiedGit(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div
        className="relative w-full max-w-3xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-800 bg-neutral-950">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Chrome className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">VisionCart Chrome Extension</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Manifest V3 Ready
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Visual search across Meesho, Amazon, Flipkart, Myntra, and Ajio
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/80 px-6 pt-2 gap-3">
          <button
            onClick={() => setActiveTab('extension')}
            className={`pb-3 text-xs font-bold transition-colors flex items-center gap-2 border-b-2 ${
              activeTab === 'extension'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Chrome className="w-4 h-4" />
            <span>1. Chrome Extension & Meesho Setup</span>
          </button>

          <button
            onClick={() => setActiveTab('github')}
            className={`pb-3 text-xs font-bold transition-colors flex items-center gap-2 border-b-2 ${
              activeTab === 'github'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <GitBranch className="w-4 h-4" />
            <span>2. Deploy to GitHub & Free Cloud Hosting</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[72vh] overflow-y-auto">
          {activeTab === 'extension' ? (
            <>
              {/* Top Banner with 2 Primary Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a
                  href="/api/download-extension"
                  download="visioncart-chrome-extension.zip"
                  className="flex items-center justify-center gap-3 p-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all text-center group"
                >
                  <Download className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
                  <span>Download Extension (.zip)</span>
                </a>

                <button
                  onClick={() => {
                    onClose();
                    onOpenSimulator();
                  }}
                  className="flex items-center justify-center gap-2.5 p-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-100 font-semibold text-sm border border-neutral-700 transition-colors"
                >
                  <MonitorSmartphone className="w-5 h-5 text-amber-400" />
                  <span>Try Live Store Simulator</span>
                </button>
              </div>

              {/* Serverless or Connected Mode Notice */}
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                  <Key className="w-4 h-4" />
                  <span>Works in 2 Flexible Ways:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-300">
                  <div className="p-2.5 rounded-lg bg-neutral-950/80 border border-neutral-800">
                    <strong className="text-amber-300 block mb-1">A. Auto-Connected Mode:</strong>
                    The downloaded zip is already pre-configured to communicate with your current backend URL.
                  </div>
                  <div className="p-2.5 rounded-lg bg-neutral-950/80 border border-neutral-800">
                    <strong className="text-emerald-400 block mb-1">B. 100% Serverless Mode:</strong>
                    Paste your free Gemini API key into the extension popup. It works on Meesho standalone with zero server running!
                  </div>
                </div>
              </div>

              {/* Step-by-Step Installation Guide */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  How to Load into Chrome in 30 Seconds:
                </h3>

                <div className="space-y-2.5">
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0">
                      1
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold text-white">Extract the Downloaded ZIP</p>
                      <p className="text-neutral-400 mt-0.5">
                        Extract <code className="bg-neutral-800 text-neutral-300 px-1 py-0.5 rounded font-mono">visioncart-chrome-extension.zip</code> to a folder on your computer.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0">
                      2
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold text-white">Open chrome://extensions</p>
                      <p className="text-neutral-400 mt-0.5">
                        In Chrome, Edge, or Brave, visit <code className="bg-neutral-800 text-amber-300 px-1.5 py-0.5 rounded font-mono">chrome://extensions</code>. Switch on <strong>Developer mode</strong> in the top-right corner.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0">
                      3
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold text-white">Click "Load Unpacked"</p>
                      <p className="text-neutral-400 mt-0.5">
                        Click <strong>Load unpacked</strong> and select the extracted folder. VisionCart is now permanently installed in your browser!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Using on Meesho */}
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2.5">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <span className="text-base">🛍️</span>
                  <span>How to Use on Meesho & Other E-Commerce Sites:</span>
                </h4>
                <ol className="list-decimal list-inside space-y-1.5 text-xs text-neutral-300">
                  <li>Go to <a href="https://www.meesho.com" target="_blank" rel="noreferrer" className="text-amber-400 hover:underline">Meesho.com</a> (or Amazon, Flipkart, Myntra, Ajio).</li>
                  <li><strong>Hover</strong> over any dress, shoe, saree, or watch photo.</li>
                  <li>Click the golden floating <strong>VisionCart</strong> button that appears.</li>
                  <li>The sliding panel extracts visual traits and gives you 1-click price comparison links across all stores!</li>
                </ol>
              </div>

              {/* Connected Backend URL */}
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-300">Current Server URL:</span>
                  <button
                    onClick={handleCopyUrl}
                    className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
                  >
                    {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedUrl ? 'Copied!' : 'Copy URL'}</span>
                  </button>
                </div>
                <div className="p-2 rounded bg-neutral-900 border border-neutral-800 font-mono text-xs text-neutral-400 select-all truncate">
                  {currentOrigin}
                </div>
              </div>
            </>
          ) : (
            /* Tab 2: GitHub & Cloud Deployment Guide */
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-amber-400" />
                    <span>Step 1: Push Code to your GitHub Repository</span>
                  </h3>
                  <button
                    onClick={handleCopyGit}
                    className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
                  >
                    {copiedGit ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedGit ? 'Copied Commands' : 'Copy Commands'}</span>
                  </button>
                </div>

                <p className="text-xs text-neutral-400">
                  You can use Google AI Studio's top menu <strong>Export to GitHub</strong>, or clone and push directly:
                </p>

                <pre className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-neutral-300 overflow-x-auto">
                  {gitCommands}
                </pre>
              </div>

              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Server className="w-4 h-4 text-amber-400" />
                  <span>Step 2: Deploy Backend to Free Hosting (Render / Railway / Cloud Run)</span>
                </h3>

                <p className="text-xs text-neutral-400">
                  Deploying to <strong>Render.com</strong> takes 2 minutes and is 100% free:
                </p>

                <ol className="list-decimal list-inside space-y-2 text-xs text-neutral-300">
                  <li>Create a free account on <a href="https://render.com" target="_blank" rel="noreferrer" className="text-amber-400 hover:underline">Render.com</a>.</li>
                  <li>Click <strong>New +</strong> → <strong>Web Service</strong> and select your GitHub repo.</li>
                  <li>Set <strong>Build Command</strong>: <code className="bg-neutral-800 text-amber-300 px-1 py-0.5 rounded font-mono">npm install && npm run build</code></li>
                  <li>Set <strong>Start Command</strong>: <code className="bg-neutral-800 text-amber-300 px-1 py-0.5 rounded font-mono">npm start</code></li>
                  <li>Add Environment Variable: <code className="bg-neutral-800 text-amber-300 px-1 py-0.5 rounded font-mono">GEMINI_API_KEY</code> with your key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-amber-400 hover:underline">Google AI Studio</a>.</li>
                  <li>Click <strong>Deploy Web Service</strong>.</li>
                </ol>
              </div>

              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2.5">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Step 3: Point Extension to Your Deployed URL</span>
                </h3>
                <p className="text-xs text-neutral-300">
                  Once your backend is live (e.g. <code className="bg-neutral-800 text-neutral-300 px-1 py-0.5 rounded font-mono">https://visioncart.onrender.com</code>), click the VisionCart extension icon in Chrome toolbar, paste the URL into <strong>Backend Server URL</strong>, and click <strong>Save</strong>.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onOpenSimulator();
            }}
            className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-medium"
          >
            <span>Launch In-App Store Simulator</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold border border-neutral-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

