import React, { useMemo, useState } from 'react';
import { Filter, ArrowUpDown, Store, Search, Sparkles, Layers, SlidersHorizontal } from 'lucide-react';
import { MatchTier, RankedProduct, StoreName } from '../types/index.js';
import { ProductCard } from './ProductCard.js';

interface ProductResultsProps {
  products: RankedProduct[];
  executionTimeMs?: number;
  onSelectProduct: (product: RankedProduct) => void;
}

export const ProductResults: React.FC<ProductResultsProps> = ({
  products,
  executionTimeMs,
  onSelectProduct,
}) => {
  const [selectedStore, setSelectedStore] = useState<StoreName | 'All'>('All');
  const [selectedTier, setSelectedTier] = useState<MatchTier | 'All'>('All');
  const [sortBy, setSortBy] = useState<'match' | 'price-asc' | 'price-desc' | 'rating'>('match');
  const [textFilter, setTextFilter] = useState('');

  const stores: (StoreName | 'All')[] = ['All', 'Meesho', 'Amazon', 'Flipkart', 'Myntra', 'Ajio'];
  const tiers: (MatchTier | 'All')[] = ['All', 'Very strong match', 'Strong match', 'Similar', 'Alternative'];

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (selectedStore !== 'All') {
      list = list.filter((p) => p.store === selectedStore);
    }

    if (selectedTier !== 'All') {
      list = list.filter((p) => p.matchTier === selectedTier);
    }

    if (textFilter.trim()) {
      const q = textFilter.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.store.toLowerCase().includes(q) ||
          p.subcategory.toLowerCase().includes(q) ||
          p.searchKeywords.some((k) => k.toLowerCase().includes(q))
      );
    }

    list.sort((a, b) => {
      if (sortBy === 'match') {
        return b.matchScore - a.matchScore;
      }
      if (sortBy === 'price-asc') {
        return a.price - b.price;
      }
      if (sortBy === 'price-desc') {
        return b.price - a.price;
      }
      if (sortBy === 'rating') {
        return b.rating - a.rating;
      }
      return 0;
    });

    return list;
  }, [products, selectedStore, selectedTier, sortBy, textFilter]);

  // Group into prompt-specified sections:
  // BEST MATCHES (Very strong match + Strong match, or 75%+)
  // SIMILAR PRODUCTS (Similar, 60-74%)
  // ALTERNATIVE PRODUCTS (Alternative, <60%)
  const bestMatches = useMemo(
    () => filteredProducts.filter((p) => p.matchScore >= 75),
    [filteredProducts]
  );

  const similarMatches = useMemo(
    () => filteredProducts.filter((p) => p.matchScore >= 60 && p.matchScore < 75),
    [filteredProducts]
  );

  const alternativeMatches = useMemo(
    () => filteredProducts.filter((p) => p.matchScore < 60),
    [filteredProducts]
  );

  return (
    <div className="space-y-8">
      {/* Controls Bar: Stores, Tiers, Sorting & Text Filter */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Store Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mr-1 shrink-0 flex items-center gap-1">
              <Store className="w-3.5 h-3.5" />
              Store:
            </span>
            {stores.map((s) => (
              <button
                key={s}
                id={`filter-store-${s.toLowerCase()}`}
                onClick={() => setSelectedStore(s)}
                className={`px-3 py-1 rounded-lg text-xs font-medium shrink-0 transition-colors ${
                  selectedStore === s
                    ? 'bg-neutral-100 text-neutral-950 font-bold'
                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Quick Stats & Sort */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <span className="text-xs text-neutral-400">
              {filteredProducts.length} results
              {executionTimeMs ? ` (${(executionTimeMs / 1000).toFixed(2)}s)` : ''}
            </span>

            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
              <select
                id="select-sort-by"
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                aria-label="Sort products"
                className="bg-neutral-800 text-neutral-200 text-xs rounded-lg px-2.5 py-1.5 border border-neutral-700 focus:outline-none focus:border-amber-400"
              >
                <option value="match">Highest Match %</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Customer Rating</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tier Sub-Filter and Search Input */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-neutral-800/80">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mr-1 shrink-0 flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Tier:
            </span>
            {tiers.map((t) => (
              <button
                key={t}
                id={`filter-tier-${t.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => setSelectedTier(t)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium shrink-0 transition-colors ${
                  selectedTier === t
                    ? 'bg-amber-400 text-neutral-950 font-bold'
                    : 'bg-neutral-800/80 text-neutral-400 hover:bg-neutral-700'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Refine in results..."
              value={textFilter}
              onChange={(e) => setTextFilter(e.target.value)}
              className="w-full sm:w-48 pl-8 pr-3 py-1 bg-neutral-800/80 border border-neutral-700 rounded-md text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>
      </div>

      {/* No results fallback */}
      {filteredProducts.length === 0 && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-12 text-center max-w-lg mx-auto">
          <Search className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No products found</h3>
          <p className="text-xs text-neutral-400 mt-1 max-w-xs mx-auto">
            No items in the catalog matched the current filters for {selectedStore !== 'All' ? selectedStore : 'the selected criteria'}.
          </p>
          <button
            onClick={() => {
              setSelectedStore('All');
              setSelectedTier('All');
              setTextFilter('');
            }}
            className="mt-4 px-4 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* SECTION 1: BEST MATCHES (Prompt: BEST MATCHES) */}
      {bestMatches.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-white uppercase">
                Best Matches
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800 text-emerald-400 font-semibold">
                {bestMatches.length} items
              </span>
            </div>
            <p className="text-xs text-neutral-400 hidden sm:block">
              Exact & high-fidelity category, color, and style matches (75% - 100%)
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {bestMatches.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={onSelectProduct}
              />
            ))}
          </div>
        </section>
      )}

      {/* SECTION 2: SIMILAR PRODUCTS (Prompt: SIMILAR PRODUCTS) */}
      {similarMatches.length > 0 && (
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-white uppercase">
                Similar Products
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-950/60 border border-amber-800 text-amber-400 font-semibold">
                {similarMatches.length} items
              </span>
            </div>
            <p className="text-xs text-neutral-400 hidden sm:block">
              Visually & functionally comparable silhouettes (60% - 74%)
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {similarMatches.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={onSelectProduct}
              />
            ))}
          </div>
        </section>
      )}

      {/* SECTION 3: ALTERNATIVE PRODUCTS (Prompt: Alternative products) */}
      {alternativeMatches.length > 0 && (
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-500"></span>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-neutral-300 uppercase">
                Alternative Products
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-400 font-semibold">
                {alternativeMatches.length} items
              </span>
            </div>
            <p className="text-xs text-neutral-500 hidden sm:block">
              Broader cross-category or stylistic alternatives (&lt;60%)
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {alternativeMatches.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={onSelectProduct}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
