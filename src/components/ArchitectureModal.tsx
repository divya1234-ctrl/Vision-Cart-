import React, { useState } from 'react';
import { X, Layers, Database, Cpu, Globe, ArrowRight, Code2, Check, Copy } from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'vector' | 'api' | 'providers'>('pipeline');
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(text);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div
        className="relative w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-800 bg-neutral-950">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">VisionCart Architecture & Extensibility</h2>
              <p className="text-xs text-neutral-400">
                Vector search roadmap, authorized store provider adapters, and Chrome Extension API
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

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-800 bg-neutral-950 px-6 gap-2 overflow-x-auto scrollbar-none">
          {[
            { id: 'pipeline', label: 'V1 Processing Flow' },
            { id: 'vector', label: 'Future Vector Search' },
            { id: 'providers', label: 'Store Provider Adapters' },
            { id: 'api', label: 'REST API & Chrome Extension' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors shrink-0 ${
                activeTab === tab.id
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6 text-neutral-300 text-xs sm:text-sm">
          {activeTab === 'pipeline' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">Current V1 Visual Search Pipeline</h3>
              <p className="text-neutral-400 text-xs">
                The application performs secure multimodal visual inference on the server side using Gemini 3.8 Flash, followed by structured multi-attribute weighted ranking.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
                {[
                  { step: '1', title: 'Image Ingestion', desc: 'Base64 image validation (<10MB), MIME check, and preview generation' },
                  { step: '2', title: 'Gemini Vision AI', desc: 'Extracts category, colors, materials, styles & multi-product objects' },
                  { step: '3', title: 'Object Resolver', desc: 'Supports multi-product selection if outfit contains multiple items' },
                  { step: '4', title: 'Relevance Engine', desc: 'Evaluates category (30%), keywords (25%), color (15%), style (10%), material (10%), description (10%)' },
                  { step: '5', title: 'Tier Ranking', desc: 'Categorizes into Best Matches (75-100%), Similar (60-74%), Alternatives (<60%)' },
                ].map((s) => (
                  <div key={s.step} className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold text-[11px] flex items-center justify-center">
                      {s.step}
                    </span>
                    <h4 className="font-bold text-white text-xs">{s.title}</h4>
                    <p className="text-[11px] text-neutral-400 leading-tight">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'vector' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">Future Vector Search Architecture</h3>
              <p className="text-neutral-400 text-xs">
                The code is structured with the <code className="text-amber-300 bg-neutral-800 px-1 py-0.5 rounded">ProductSearchService</code> abstraction interface. V1 uses <code className="text-amber-300 bg-neutral-800 px-1 py-0.5 rounded">MockProductSearchService</code>, which is designed as a drop-in predecessor for <code className="text-amber-300 bg-neutral-800 px-1 py-0.5 rounded">VectorProductSearchService</code>.
              </p>

              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3 font-mono text-xs">
                <div className="text-neutral-400">// Visual Vector Search Flow</div>
                <div className="flex flex-wrap items-center gap-2 text-neutral-200">
                  <span className="px-2 py-1 bg-neutral-800 rounded text-amber-300">User Image</span>
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-500" />
                  <span className="px-2 py-1 bg-neutral-800 rounded text-amber-300">Gemini Embedding (768d)</span>
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-500" />
                  <span className="px-2 py-1 bg-neutral-800 rounded text-amber-300">Vector DB (pgvector/Pinecone)</span>
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-500" />
                  <span className="px-2 py-1 bg-neutral-800 rounded text-amber-300">Cosine ANN Search</span>
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-500" />
                  <span className="px-2 py-1 bg-neutral-800 rounded text-amber-300">Multi-Store Reranker</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-neutral-800/50 border border-neutral-700/60 space-y-2 text-xs">
                <h4 className="font-bold text-white">Upgrade Steps to Enable Full Vector DB:</h4>
                <ul className="list-disc list-inside space-y-1 text-neutral-300">
                  <li>Generate offline vector embeddings for the entire product catalog image dataset using <code className="text-amber-300">gemini-embedding-2-preview</code>.</li>
                  <li>Index catalog vectors into a Cloud SQL pgvector table or managed Vector DB instance.</li>
                  <li>Switch the server singleton from <code className="text-amber-300">MockProductSearchService</code> to <code className="text-amber-300">VectorProductSearchService</code>.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'providers' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">Authorized Store Provider Architecture</h3>
              <p className="text-neutral-400 text-xs">
                VisionCart strictly prohibits unauthorized web scraping or bypassing anti-bot systems. The backend uses the <code className="text-amber-300 bg-neutral-800 px-1 py-0.5 rounded">EcommerceProvider</code> interface to connect with official merchant partner APIs and affiliate feeds.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { name: 'MeeshoProvider', status: 'Mock V1 (Official Partner Feed Ready)', desc: 'Meesho Supplier / Affiliate integration feed' },
                  { name: 'AmazonProvider', status: 'Mock V1 (PA-API v5 Ready)', desc: 'Amazon Product Advertising API with AWS signed credentials' },
                  { name: 'FlipkartProvider', status: 'Mock V1 (Affiliate API Ready)', desc: 'Flipkart Developer Affiliate Search & Catalog API' },
                  { name: 'MyntraProvider', status: 'Mock V1 (Partner Catalog Ready)', desc: 'Myntra B2B Partner Catalog Feed' },
                  { name: 'AjioProvider', status: 'Mock V1 (Reliance Retail Feed Ready)', desc: 'Ajio Marketplace API integration' },
                  { name: 'MockProvider', status: 'Active In V1 Prototype', desc: 'Unified 34-item multi-category mock catalog' },
                ].map((prov) => (
                  <div key={prov.name} className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                    <h4 className="font-mono font-bold text-white text-xs">{prov.name}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium inline-block">
                      {prov.status}
                    </span>
                    <p className="text-[11px] text-neutral-400 pt-1">{prov.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">Clean REST APIs for Chrome Extension & Integrations</h3>
              <p className="text-neutral-400 text-xs">
                The VisionCart backend exposes headless endpoints so a future Chrome Extension can capture product screenshots on any webpage and immediately retrieve matched products.
              </p>

              <div className="space-y-3 font-mono text-xs">
                {[
                  {
                    method: 'POST',
                    path: '/api/visual-search',
                    desc: 'End-to-end endpoint: takes base64 image, runs Gemini analysis, and returns ranked products across all stores.',
                  },
                  {
                    method: 'POST',
                    path: '/api/analyze-image',
                    desc: 'Multimodal vision analysis: extracts structured attributes and identifies multi-product items in photo.',
                  },
                  {
                    method: 'POST',
                    path: '/api/search-products',
                    desc: 'Search & rank: accepts structured analysis and filters by store or match threshold.',
                  },
                  {
                    method: 'GET',
                    path: '/api/products',
                    desc: 'Catalog retrieval: queries catalog products with optional ?store= and ?category= filters.',
                  },
                ].map((ep) => (
                  <div key={ep.path} className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            ep.method === 'POST' ? 'bg-indigo-900 text-indigo-200' : 'bg-emerald-900 text-emerald-200'
                          }`}
                        >
                          {ep.method}
                        </span>
                        <span className="font-bold text-neutral-200">{ep.path}</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(ep.path)}
                        className="text-neutral-500 hover:text-neutral-300 p-1 rounded"
                        title="Copy Path"
                      >
                        {copiedEndpoint === ep.path ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <p className="font-sans text-[11px] text-neutral-400">{ep.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold border border-neutral-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
