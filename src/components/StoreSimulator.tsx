import React, { useState, useRef } from 'react';
import { Store, Camera, Sparkles, ExternalLink, X, ArrowLeft, Check, Layers, RefreshCw, ShoppingCart, Star, Heart, Upload, Image as ImageIcon } from 'lucide-react';
import { AIAnalysisResult, RankedProduct, StoreName } from '../types/index.js';
import { performVisualSearch } from '../services/api.js';

interface StoreSimulatorProps {
  onBackToApp: () => void;
  onOpenDownloadModal: () => void;
  onImageSelected?: (base64: string, mimeType: string) => void;
}

interface SimulatedItem {
  id: string;
  title: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  imageUrl: string;
  category: string;
}

const STORE_CONFIGS: Record<StoreName, {
  name: StoreName;
  navColor: string;
  accentColor: string;
  tagline: string;
  items: SimulatedItem[];
}> = {
  Amazon: {
    name: 'Amazon',
    navColor: 'bg-neutral-900 border-b border-neutral-800',
    accentColor: 'text-amber-400',
    tagline: 'Amazon.in Marketplace',
    items: [
      {
        id: 'amz_1',
        title: 'Symbol Premium Heavyweight Black Pullover Hoodie',
        price: 899,
        originalPrice: 1999,
        rating: 4.5,
        reviews: 3200,
        imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
        category: 'Fashion',
      },
      {
        id: 'amz_2',
        title: 'Noise ColorFit Ultra Smartwatch with 1.75" HD Display',
        price: 1799,
        originalPrice: 4999,
        rating: 4.3,
        reviews: 8400,
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
        category: 'Electronics',
      },
      {
        id: 'amz_3',
        title: 'Vincent Chase Polarized Golden Metal Aviator Sunglasses',
        price: 799,
        originalPrice: 1999,
        rating: 4.4,
        reviews: 1540,
        imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80',
        category: 'Accessories',
      },
    ],
  },
  Meesho: {
    name: 'Meesho',
    navColor: 'bg-pink-950/80 border-b border-pink-900',
    accentColor: 'text-pink-400',
    tagline: 'Meesho Reseller & Lowest Prices Store',
    items: [
      {
        id: 'msh_1',
        title: 'Streetwear Black Oversized Cotton Fleece Hoodie',
        price: 499,
        originalPrice: 1299,
        rating: 4.6,
        reviews: 2180,
        imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
        category: 'Fashion',
      },
      {
        id: 'msh_2',
        title: 'Trendy Tan Faux Leather Structured Handbag',
        price: 349,
        originalPrice: 899,
        rating: 4.4,
        reviews: 1420,
        imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
        category: 'Bags',
      },
      {
        id: 'msh_3',
        title: 'Comfortable White Casual Everyday Sneakers',
        price: 399,
        originalPrice: 999,
        rating: 4.2,
        reviews: 980,
        imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80',
        category: 'Footwear',
      },
    ],
  },
  Flipkart: {
    name: 'Flipkart',
    navColor: 'bg-blue-950/90 border-b border-blue-900',
    accentColor: 'text-blue-400',
    tagline: 'Flipkart Big Billion Deals',
    items: [
      {
        id: 'fk_1',
        title: 'Metronaut Men Solid Relaxed Black Hooded Sweatshirt',
        price: 699,
        originalPrice: 1699,
        rating: 4.3,
        reviews: 4100,
        imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
        category: 'Fashion',
      },
      {
        id: 'fk_2',
        title: 'Fire-Boltt Ninja Call Pro Plus Smartwatch',
        price: 1299,
        originalPrice: 3499,
        rating: 4.2,
        reviews: 6200,
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
        category: 'Electronics',
      },
      {
        id: 'fk_3',
        title: 'Asian White Low-Top Lightweight Casual Shoes',
        price: 649,
        originalPrice: 1499,
        rating: 4.1,
        reviews: 2890,
        imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80',
        category: 'Footwear',
      },
    ],
  },
  Myntra: {
    name: 'Myntra',
    navColor: 'bg-neutral-900 border-b border-neutral-800',
    accentColor: 'text-rose-400',
    tagline: 'Myntra Fashion Forward',
    items: [
      {
        id: 'myn_1',
        title: 'Roadster Pure Cotton Drop-Shoulder Black Boxy Hoodie',
        price: 949,
        originalPrice: 2199,
        rating: 4.5,
        reviews: 1980,
        imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
        category: 'Fashion',
      },
      {
        id: 'myn_2',
        title: 'Baggit Structured Tan Shoulder Tote Bag',
        price: 1199,
        originalPrice: 2890,
        rating: 4.6,
        reviews: 870,
        imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
        category: 'Accessories',
      },
      {
        id: 'myn_3',
        title: 'Highlander Streetwear Outfit Look (Multi-Product)',
        price: 2499,
        originalPrice: 4999,
        rating: 4.7,
        reviews: 540,
        imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
        category: 'Fashion',
      },
    ],
  },
  Ajio: {
    name: 'Ajio',
    navColor: 'bg-neutral-950 border-b border-teal-900/50',
    accentColor: 'text-teal-400',
    tagline: 'Ajio Premium Trends',
    items: [
      {
        id: 'aj_1',
        title: 'Netplay Fleece Zip-Neck Black Heavy Hoodie',
        price: 849,
        originalPrice: 1899,
        rating: 4.4,
        reviews: 730,
        imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
        category: 'Fashion',
      },
      {
        id: 'aj_2',
        title: 'Puma Rebound Joy White Unisex Sneakers',
        price: 2199,
        originalPrice: 4499,
        rating: 4.6,
        reviews: 1650,
        imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80',
        category: 'Footwear',
      },
      {
        id: 'aj_3',
        title: 'Fossil Gen 6 Smartwatch with Stainless Steel Mesh',
        price: 5999,
        originalPrice: 12999,
        rating: 4.5,
        reviews: 420,
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
        category: 'Electronics',
      },
    ],
  },
};

export const StoreSimulator: React.FC<StoreSimulatorProps> = ({
  onBackToApp,
  onOpenDownloadModal,
  onImageSelected,
}) => {
  const [currentStore, setCurrentStore] = useState<StoreName>('Amazon');
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);

  // In-page drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [rankedProducts, setRankedProducts] = useState<RankedProduct[]>([]);
  const [drawerStoreFilter, setDrawerStoreFilter] = useState<StoreName | 'All'>('All');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        if (dataUrl) {
          handleTriggerVisualSearch(dataUrl);
          if (onImageSelected) {
            onImageSelected(dataUrl, file.type);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const storeConfig = STORE_CONFIGS[currentStore];

  const handleTriggerVisualSearch = async (imageUrl: string, focusObjectName?: string) => {
    setSelectedImage(imageUrl);
    setDrawerOpen(true);
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setRankedProducts([]);

    try {
      const resp = await performVisualSearch({
        image: imageUrl,
        focusObjectName,
      });
      setAnalysisResult(resp.analysis);
      setRankedProducts(resp.products);
    } catch (err) {
      console.error('Simulator visual search failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const queryTerm = analysisResult
    ? encodeURIComponent(
        `${analysisResult.color?.join(' ') || ''} ${analysisResult.style || ''} ${
          analysisResult.product_type || analysisResult.category
        }`.trim()
      )
    : '';

  const searchEverywhereLinks = [
    { name: 'Amazon', url: `https://www.amazon.in/s?k=${queryTerm}`, color: '#f59e0b', icon: '📦' },
    { name: 'Meesho', url: `https://www.meesho.com/search?q=${queryTerm}`, color: '#ec4899', icon: '🛍️' },
    { name: 'Flipkart', url: `https://www.flipkart.com/search?q=${queryTerm}`, color: '#3b82f6', icon: '⚡' },
    { name: 'Myntra', url: `https://www.myntra.com/${queryTerm}`, color: '#f43f5e', icon: '👗' },
    { name: 'Ajio', url: `https://www.ajio.com/search/?text=${queryTerm}`, color: '#06b6d4', icon: '✨' },
    { name: 'Google Shopping', url: `https://www.google.com/search?tbm=shop&q=${queryTerm}`, color: '#10b981', icon: '🌐' },
  ];

  const filteredProducts = rankedProducts.filter(
    (p) => drawerStoreFilter === 'All' || p.store === drawerStoreFilter
  );

  return (
    <div className="relative min-h-[85vh] bg-neutral-950 rounded-2xl border border-neutral-800 overflow-hidden shadow-2xl flex flex-col">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Top Banner: Simulator Mode Controls */}
      <div className="bg-neutral-900 border-b border-neutral-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={onBackToApp}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white flex items-center gap-1 font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Web App</span>
          </button>
          <span className="text-neutral-500">|</span>
          <span className="font-bold text-amber-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Live Extension Simulator</span>
          </span>
        </div>

        {/* Store Tabs */}
        <div className="flex items-center gap-1.5">
          <span className="text-neutral-400 mr-1">Simulate Store:</span>
          {(['Amazon', 'Meesho', 'Flipkart', 'Myntra', 'Ajio'] as StoreName[]).map((st) => (
            <button
              key={st}
              onClick={() => setCurrentStore(st)}
              className={`px-3 py-1 rounded-md font-semibold transition-all ${
                currentStore === st
                  ? 'bg-amber-400 text-neutral-950 shadow-sm'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Direct Upload Button from Simulator */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Your Image</span>
          </button>
        </div>
      </div>

      {/* Simulated Storefront Body */}
      <div className="flex-1 bg-neutral-900/30 overflow-y-auto">
        {/* Simulated Store Header */}
        <div className={`${storeConfig.navColor} px-6 py-4 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <span className={`text-xl font-extrabold tracking-tight ${storeConfig.accentColor}`}>
              {storeConfig.name}
            </span>
            <span className="text-xs text-neutral-400 hidden sm:inline">&bull; {storeConfig.tagline}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-56 sm:w-80">
              <input
                type="text"
                readOnly
                placeholder="Search products or click camera to upload photo..."
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-3 pr-9 py-1.5 text-xs text-neutral-300 cursor-pointer hover:border-amber-400 focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-neutral-700 text-amber-400 transition-colors"
                title="Upload image to search"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <ShoppingCart className="w-5 h-5 text-neutral-400" />
          </div>
        </div>

        {/* Tip Banner with Upload CTA */}
        <div className="bg-amber-950/40 border-b border-amber-900/40 px-6 py-2.5 text-xs text-amber-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Try Visual Search:</strong> Hover over any item image below, or click <em>"Upload Image"</em> to test with your own photo!
            </span>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-xs font-bold text-neutral-950 bg-amber-400 hover:bg-amber-300 px-3 py-1 rounded-md transition-colors"
          >
            Upload Image Now
          </button>
        </div>

        {/* Simulated Product Listing Grid */}
        <div className="p-6 max-w-6xl mx-auto space-y-6">
          {/* Custom Upload Card */}
          <div className="p-4.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-neutral-900 to-amber-500/5 border border-amber-500/25 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Have a photo of clothes, shoes, or gadgets?</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Upload it right here to search across Meesho (wholesale), Amazon, Flipkart, Myntra & Ajio simultaneously!
                </p>
              </div>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-extrabold flex items-center justify-center gap-2 shadow-md transition-transform active:scale-95 cursor-pointer shrink-0"
            >
              <ImageIcon className="w-4 h-4" />
              <span>Upload Image File</span>
            </button>
          </div>

          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-300">
              Trending on {storeConfig.name} Today
            </h2>
            <span className="text-xs text-neutral-500">Hover over any photo to test extension</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {storeConfig.items.map((item) => {
              const isHovered = hoveredItemId === item.id;

              return (
                <div
                  key={item.id}
                  onMouseEnter={() => setHoveredItemId(item.id)}
                  onMouseLeave={() => setHoveredItemId(null)}
                  className="relative group bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden hover:border-neutral-700 transition-all duration-200 shadow-md"
                >
                  {/* Product Image + Floating VisionCart Button */}
                  <div className="relative aspect-square bg-neutral-950 overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* INJECTED EXTENSION FLOATING BUTTON (The exact hover feature!) */}
                    <button
                      onClick={() => handleTriggerVisualSearch(item.imageUrl)}
                      className={`absolute top-3 right-3 z-20 px-3 py-1.5 rounded-full bg-neutral-950/90 hover:bg-amber-400 text-white hover:text-neutral-950 border border-amber-500/50 text-xs font-bold shadow-xl flex items-center gap-1.5 transition-all duration-200 backdrop-blur-md ${
                        isHovered ? 'opacity-100 scale-100' : 'opacity-85 sm:opacity-0 sm:scale-95'
                      }`}
                      title="Search with VisionCart"
                    >
                      <Camera className="w-3.5 h-3.5 text-amber-400 group-hover:text-neutral-950" />
                      <span>VisionCart</span>
                    </button>

                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] text-neutral-300">
                      {item.category}
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center gap-1 text-xs text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span className="font-semibold">{item.rating}</span>
                      <span className="text-neutral-500">({item.reviews.toLocaleString()})</span>
                    </div>

                    <h3 className="text-sm font-semibold text-white line-clamp-2">
                      {item.title}
                    </h3>

                    <div className="flex items-baseline gap-2 pt-1">
                      <span className="text-lg font-extrabold text-white">
                        ₹{item.price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-neutral-500 line-through">
                        ₹{item.originalPrice.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-emerald-400 font-semibold">
                        {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% off
                      </span>
                    </div>

                    <button
                      onClick={() => handleTriggerVisualSearch(item.imageUrl)}
                      className="w-full mt-2 py-2 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-neutral-700 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Find Everywhere with VisionCart</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================== */}
      {/* IN-PAGE SLIDING DRAWER (Exact behavior of content.js) */}
      {/* ========================================================== */}
      {drawerOpen && (
        <div className="absolute inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in"
          ></div>

          {/* Sliding Panel */}
          <div className="relative w-full max-w-md bg-neutral-900 border-l border-neutral-800 shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-250">
            {/* Drawer Header */}
            <div className="p-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-amber-400">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-extrabold text-sm text-white">
                    VISION<span className="text-amber-400">CART</span>
                  </div>
                  <div className="text-[10px] text-neutral-400">Extension In-Page Search</div>
                </div>
              </div>

              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Product Thumbnail & AI Status */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                {selectedImage && (
                  <img
                    src={selectedImage}
                    alt="Captured thumbnail"
                    className="w-16 h-16 rounded-lg object-cover bg-neutral-900 border border-neutral-700 shrink-0"
                  />
                )}
                <div className="min-w-0 flex-1">
                  {isAnalyzing ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                        <Sparkles className="w-3.5 h-3.5 animate-spin" />
                        <span>Analyzing with Gemini AI...</span>
                      </div>
                      <p className="text-[11px] text-neutral-400">
                        Extracting visual attributes and searching catalogs...
                      </p>
                    </div>
                  ) : analysisResult ? (
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                        AI Identified
                      </span>
                      <h4 className="text-xs font-bold text-white truncate capitalize mt-0.5">
                        {analysisResult.product_type || analysisResult.category}
                      </h4>
                      <p className="text-[10px] text-neutral-400 line-clamp-1">
                        {analysisResult.description}
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Multi-Product Object Pills if detected */}
              {analysisResult && (analysisResult.is_multi_product || analysisResult.detected_objects.length > 1) && (
                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                    👗 Multiple items in photo:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {analysisResult.detected_objects.map((obj) => (
                      <button
                        key={obj.id}
                        onClick={() => handleTriggerVisualSearch(selectedImage!, obj.name)}
                        className="px-2.5 py-1 rounded-md bg-neutral-800 hover:bg-amber-400 hover:text-neutral-950 text-neutral-200 text-xs font-medium border border-neutral-700 transition-colors"
                      >
                        {obj.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* "SEARCH EVERYWHERE" DIRECT STORE BUTTONS */}
              {analysisResult && (
                <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                      <span>🔍</span>
                      <span>Search Everywhere for this item:</span>
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                      Live Stores
                    </span>
                  </div>

                  {/* 1-Click Multi-Store Launcher */}
                  <button
                    onClick={() => {
                      searchEverywhereLinks
                        .filter((s) => s.name !== 'Google Shopping')
                        .forEach((s) => window.open(s.url, '_blank'));
                    }}
                    className="w-full py-2.5 px-3 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/10 transition-all hover:scale-[1.01]"
                  >
                    <span>🚀</span>
                    <span>Compare All 5 Stores in 1 Click</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    {searchEverywhereLinks.map((store) => (
                      <a
                        key={store.name}
                        href={store.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-xs font-semibold border border-neutral-800 transition-all hover:scale-[1.01]"
                        style={{ borderLeft: `3px solid ${store.color}` }}
                      >
                        <span className="truncate">
                          {store.icon} {store.name}
                        </span>
                        <ExternalLink className="w-3 h-3 text-neutral-400 shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Catalog Matches Breakdown */}
              {rankedProducts.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Matched Products ({rankedProducts.length})
                    </span>

                    {/* Quick store filter */}
                    <select
                      value={drawerStoreFilter}
                      onChange={(e: any) => setDrawerStoreFilter(e.target.value)}
                      className="bg-neutral-800 text-neutral-300 text-[11px] rounded px-2 py-0.5 border border-neutral-700 focus:outline-none"
                    >
                      <option value="All">All Stores</option>
                      <option value="Meesho">Meesho</option>
                      <option value="Amazon">Amazon</option>
                      <option value="Flipkart">Flipkart</option>
                      <option value="Myntra">Myntra</option>
                      <option value="Ajio">Ajio</option>
                    </select>
                  </div>

                  <div className="space-y-2.5">
                    {filteredProducts.map((prod) => (
                      <div
                        key={prod.id}
                        className="flex items-center gap-3 p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 transition-colors"
                      >
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-14 h-14 rounded-lg object-cover bg-neutral-900 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300">
                              {prod.store}
                            </span>
                            <span className="text-xs font-extrabold text-emerald-400">
                              {prod.matchScore}%
                            </span>
                          </div>
                          <h5 className="text-xs font-semibold text-white truncate mt-0.5">
                            {prod.name}
                          </h5>
                          <div className="flex items-baseline justify-between mt-1">
                            <span className="text-xs font-extrabold text-white">
                              {prod.currency}{prod.price.toLocaleString('en-IN')}
                            </span>
                            <a
                              href={prod.productUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] font-semibold text-amber-400 hover:underline flex items-center gap-0.5"
                            >
                              <span>View on {prod.store}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
