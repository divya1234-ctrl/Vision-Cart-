import React, { useState, useMemo } from 'react';
import { ExternalLink, ShoppingBag, ArrowRight, Sparkles, TrendingDown, Layers, ShieldCheck, Check, Search, SlidersHorizontal } from 'lucide-react';
import { AIAnalysisResult, LiveStoreLink, StorePriceBenchmark } from '../types/index.js';

interface RealStoreComparisonProps {
  analysis: AIAnalysisResult;
  liveStoreLinks?: LiveStoreLink[];
  priceBenchmark?: StorePriceBenchmark;
}

export const RealStoreComparison: React.FC<RealStoreComparisonProps> = ({
  analysis,
  liveStoreLinks,
  priceBenchmark,
}) => {
  // Initial search query extracted from analysis
  const defaultQuery = useMemo(() => {
    const parts: string[] = [];
    if (analysis.color && analysis.color.length > 0 && analysis.color[0] !== 'unknown') {
      parts.push(analysis.color[0]);
    }
    if (analysis.style && !['casual', 'regular', 'standard'].includes(analysis.style.toLowerCase())) {
      parts.push(analysis.style);
    }
    parts.push(analysis.product_type || analysis.category);
    if (analysis.gender && ['Men', 'Women'].includes(analysis.gender)) {
      parts.push(analysis.gender);
    }
    return parts.join(' ').trim();
  }, [analysis]);

  const [activeQuery, setActiveQuery] = useState(defaultQuery);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Quick filter chips to refine query
  const quickModifiers = ['Oversized', 'Cotton', 'Under ₹999', 'Under ₹500', 'Men', 'Women', 'Black', 'Casual'];

  const handleToggleModifier = (mod: string) => {
    if (activeQuery.toLowerCase().includes(mod.toLowerCase())) {
      // Remove modifier
      const regex = new RegExp(`\\b${mod}\\b`, 'gi');
      const updated = activeQuery.replace(regex, '').replace(/\s+/g, ' ').trim();
      setActiveQuery(updated);
      setSelectedTag(null);
    } else {
      // Add modifier
      const updated = `${activeQuery} ${mod}`.trim();
      setActiveQuery(updated);
      setSelectedTag(mod);
    }
  };

  // Recompute store links dynamically if user edits the query
  const stores = useMemo(() => {
    const encoded = encodeURIComponent(activeQuery || defaultQuery);

    const baseStores = [
      {
        store: 'Meesho',
        name: 'Meesho',
        searchUrl: `https://www.meesho.com/search?q=${encoded}`,
        accentColor: '#f43f5e',
        badge: 'Wholesale Direct',
        priceRange: '₹349 - ₹699',
        avgPrice: 499,
        keyAdvantage: 'Direct from manufacturers, zero middleman commission',
        shippingInfo: 'Free Delivery • Cash on Delivery',
        icon: '🛍️',
        bgGradient: 'from-pink-950/40 to-neutral-900',
        borderColor: 'border-pink-900/50 hover:border-pink-500/60',
      },
      {
        store: 'Flipkart',
        name: 'Flipkart',
        searchUrl: `https://www.flipkart.com/search?q=${encoded}`,
        accentColor: '#3b82f6',
        badge: 'F-Assured Deals',
        priceRange: '₹599 - ₹1,199',
        avgPrice: 849,
        keyAdvantage: 'Plus verified sellers, bank cashback & festive discounts',
        shippingInfo: 'Fast delivery • Assured quality check',
        icon: '⚡',
        bgGradient: 'from-blue-950/40 to-neutral-900',
        borderColor: 'border-blue-900/50 hover:border-blue-500/60',
      },
      {
        store: 'Amazon',
        name: 'Amazon India',
        searchUrl: `https://www.amazon.in/s?k=${encoded}`,
        accentColor: '#f59e0b',
        badge: 'Prime 1-Day',
        priceRange: '₹799 - ₹1,499',
        avgPrice: 1099,
        keyAdvantage: 'Fastest Prime 1-day delivery & verified buyer reviews',
        shippingInfo: 'Free 1-Day with Prime • 7-day easy returns',
        icon: '📦',
        bgGradient: 'from-amber-950/40 to-neutral-900',
        borderColor: 'border-amber-900/50 hover:border-amber-500/60',
      },
      {
        store: 'Myntra',
        name: 'Myntra',
        searchUrl: `https://www.myntra.com/search?q=${encoded}`,
        accentColor: '#ec4899',
        badge: '100% Original Brands',
        priceRange: '₹999 - ₹2,199',
        avgPrice: 1499,
        keyAdvantage: 'Curated premium fashion, top apparel brands & latest trends',
        shippingInfo: 'Try & Buy available • 14-day return',
        icon: '👗',
        bgGradient: 'from-fuchsia-950/40 to-neutral-900',
        borderColor: 'border-fuchsia-900/50 hover:border-fuchsia-500/60',
      },
      {
        store: 'Ajio',
        name: 'Ajio',
        searchUrl: `https://www.ajio.com/search/?text=${encoded}`,
        accentColor: '#06b6d4',
        badge: 'Trends & Discounts',
        priceRange: '₹699 - ₹1,699',
        avgPrice: 1049,
        keyAdvantage: 'Reliance Trends collection, indie brands & instant coupons',
        shippingInfo: 'Doorstep pickup • Instant refund',
        icon: '✨',
        bgGradient: 'from-cyan-950/40 to-neutral-900',
        borderColor: 'border-cyan-900/50 hover:border-cyan-500/60',
      },
      {
        store: 'Google Shopping',
        name: 'Google Shopping',
        searchUrl: `https://www.google.com/search?tbm=shop&q=${encoded}`,
        accentColor: '#10b981',
        badge: '100+ Stores Indexed',
        priceRange: '₹349 - ₹2,199',
        avgPrice: 999,
        keyAdvantage: 'Cross-web price comparison across hundreds of verified merchants',
        shippingInfo: 'Aggregated store results & seller ratings',
        icon: '🌐',
        bgGradient: 'from-emerald-950/40 to-neutral-900',
        borderColor: 'border-emerald-900/50 hover:border-emerald-500/60',
      },
    ];

    return baseStores;
  }, [activeQuery, defaultQuery]);

  // Open all stores simultaneously in separate tabs
  const handleOpenAllStores = () => {
    stores.forEach((s) => {
      window.open(s.searchUrl, '_blank', 'noopener,noreferrer');
    });
  };

  const estimatedLowest = 499;
  const estimatedHighest = 1499;
  const potentialSavings = estimatedHighest - estimatedLowest;
  const savingsPct = Math.round((potentialSavings / estimatedHighest) * 100);

  return (
    <div id="real-store-comparison-hub" className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 sm:p-7 space-y-6 shadow-2xl">
      {/* Top Banner: Real E-Commerce Comparison Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400 text-neutral-950 uppercase tracking-wider">
              <ShoppingBag className="w-3.5 h-3.5" />
              Live Store Search
            </span>
            <span className="text-xs text-neutral-400 hidden sm:inline">
              Real-time deep links across 6 major marketplaces
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Find & Compare Across Real E-Commerce Stores
          </h3>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Search live inventory on Meesho, Amazon, Flipkart, Myntra, and Ajio with the exact visual attributes.
          </p>
        </div>

        {/* 1-Click Multi-Tab Launcher Button */}
        <button
          id="btn-open-all-stores"
          onClick={handleOpenAllStores}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-neutral-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0 cursor-pointer"
        >
          <span>🚀</span>
          <span>Compare All 6 Stores in 1 Click</span>
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>

      {/* Query Customizer & Quick Modifiers */}
      <div className="bg-neutral-950/80 border border-neutral-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs font-bold text-neutral-300 flex items-center gap-1.5 uppercase tracking-wider">
            <Search className="w-3.5 h-3.5 text-amber-400" />
            Active Visual Search Query:
          </label>
          <span className="text-[11px] text-neutral-400">
            Edit text or click pills to tune real store searches
          </span>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="input-real-search-query"
            type="text"
            value={activeQuery}
            onChange={(e) => setActiveQuery(e.target.value)}
            placeholder="e.g. Black oversized cotton graphic hoodie"
            className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-3.5 py-2 text-sm text-white font-medium focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
          />
          <button
            onClick={() => setActiveQuery(defaultQuery)}
            className="px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-300 transition-colors shrink-0"
          >
            Reset
          </button>
        </div>

        {/* Quick Filter Modifiers */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-neutral-400 mr-1 flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3" />
            Add tag:
          </span>
          {quickModifiers.map((mod) => {
            const isSelected = activeQuery.toLowerCase().includes(mod.toLowerCase());
            return (
              <button
                key={mod}
                onClick={() => handleToggleModifier(mod)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                  isSelected
                    ? 'bg-amber-400 text-neutral-950 font-bold border border-amber-400'
                    : 'bg-neutral-800/80 text-neutral-300 hover:bg-neutral-700 border border-neutral-700'
                }`}
              >
                {isSelected ? `✓ ${mod}` : `+ ${mod}`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Savings Highlight Alert */}
      <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>⚡ Price Discrepancy Opportunity</span>
            </div>
            <p className="text-sm font-semibold text-neutral-200 mt-0.5">
              Save up to <span className="text-emerald-400 font-extrabold">{savingsPct}% (~₹{potentialSavings})</span> by comparing Meesho/Flipkart wholesale vs. premium fashion stores!
            </p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[11px] text-neutral-400">Lowest estimated:</div>
          <div className="text-lg font-black text-emerald-400">₹{estimatedLowest} on Meesho</div>
        </div>
      </div>

      {/* Real Store Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {stores.map((s) => (
          <div
            key={s.store}
            className={`bg-gradient-to-b ${s.bgGradient} border ${s.borderColor} rounded-xl p-4 flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 shadow-lg group`}
          >
            <div>
              {/* Store Header */}
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{s.icon}</span>
                  <div>
                    <h4 className="font-extrabold text-white text-base leading-tight">
                      {s.name}
                    </h4>
                    <span className="text-[10px] font-semibold text-neutral-400">
                      {s.badge}
                    </span>
                  </div>
                </div>

                <span className="text-xs font-black text-white px-2 py-0.5 rounded bg-neutral-900/80 border border-neutral-700">
                  {s.priceRange}
                </span>
              </div>

              {/* Store Highlights */}
              <p className="text-xs text-neutral-300 line-clamp-2 mb-2 font-normal">
                {s.keyAdvantage}
              </p>

              <div className="text-[11px] text-neutral-400 flex items-center gap-1 mb-4">
                <ShieldCheck className="w-3 h-3 text-neutral-400 shrink-0" />
                <span>{s.shippingInfo}</span>
              </div>
            </div>

            {/* Direct Link Action Button */}
            <a
              id={`btn-live-store-${s.store.toLowerCase().replace(/\s+/g, '-')}`}
              href={s.searchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-neutral-700 group-hover:border-neutral-500"
            >
              <span>Search on {s.name}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};
