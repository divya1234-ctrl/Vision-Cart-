import React from 'react';
import { Star, ExternalLink, CheckCircle, Tag, Eye } from 'lucide-react';
import { RankedProduct, StoreName } from '../types/index.js';

interface ProductCardProps {
  product: RankedProduct;
  onSelect: (product: RankedProduct) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const getStoreBadgeColor = (store: StoreName) => {
    switch (store) {
      case 'Meesho':
        return 'bg-pink-900/80 text-pink-200 border-pink-700/80';
      case 'Amazon':
        return 'bg-amber-900/80 text-amber-200 border-amber-700/80';
      case 'Flipkart':
        return 'bg-blue-900/80 text-blue-200 border-blue-700/80';
      case 'Myntra':
        return 'bg-rose-900/80 text-rose-200 border-rose-700/80';
      case 'Ajio':
        return 'bg-teal-900/80 text-teal-200 border-teal-700/80';
      default:
        return 'bg-neutral-800 text-neutral-200 border-neutral-700';
    }
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'Very strong match':
        return {
          badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
          dotClass: 'bg-emerald-400',
        };
      case 'Strong match':
        return {
          badgeClass: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
          dotClass: 'bg-indigo-400',
        };
      case 'Similar':
        return {
          badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
          dotClass: 'bg-amber-400',
        };
      default:
        return {
          badgeClass: 'bg-neutral-500/15 text-neutral-400 border-neutral-500/30',
          dotClass: 'bg-neutral-400',
        };
    }
  };

  const tierStyles = getTierBadge(product.matchTier);

  return (
    <div
      id={`product-card-${product.id}`}
      className="group flex flex-col bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden hover:border-neutral-700 transition-all duration-200 hover:shadow-xl hover:shadow-black/40"
    >
      {/* Product Image Container */}
      <div className="relative w-full aspect-square bg-neutral-950 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          referrerPolicy="no-referrer"
        />

        {/* Store Badge Top-Left */}
        <div className="absolute top-3 left-3">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border backdrop-blur-md shadow-sm ${getStoreBadgeColor(
              product.store
            )}`}
          >
            {product.store}
          </span>
        </div>

        {/* Match Percentage Top-Right */}
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-neutral-950/85 text-white border border-neutral-700 backdrop-blur-md shadow-sm">
            <span className={`w-2 h-2 rounded-full ${tierStyles.dotClass}`}></span>
            <span>{product.matchScore}% match</span>
          </span>
        </div>

        {/* Mock Tag Bottom-Right */}
        <div className="absolute bottom-2 right-2">
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/60 text-neutral-400 backdrop-blur-xs">
            MOCK
          </span>
        </div>
      </div>

      {/* Product Info Block */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
            <span className="truncate max-w-[150px]">{product.subcategory}</span>
            <div className="flex items-center gap-1 text-amber-400 font-medium">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{product.rating}</span>
              <span className="text-neutral-500">({product.reviewCount})</span>
            </div>
          </div>

          {/* Product Name */}
          <h3 className="font-semibold text-sm text-neutral-100 line-clamp-2 group-hover:text-amber-400 transition-colors">
            {product.name}
          </h3>
        </div>

        {/* Price & Match Status */}
        <div className="pt-2 border-t border-neutral-800/80 space-y-2">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-extrabold text-white">
                {product.currency}{product.price.toLocaleString('en-IN')}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-neutral-500 line-through">
                  {product.currency}{product.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            <span className={`text-xs px-2 py-0.5 rounded border font-medium ${tierStyles.badgeClass}`}>
              {product.matchTier}
            </span>
          </div>

          {/* Reason hint if available */}
          {product.matchBreakdown.reasons[0] && (
            <p className="text-[11px] text-neutral-400 truncate flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>{product.matchBreakdown.reasons[0]}</span>
            </p>
          )}

          {/* View Product CTA */}
          <button
            id={`btn-view-product-${product.id}`}
            onClick={() => onSelect(product)}
            className="w-full mt-2 py-2 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 text-neutral-100 text-xs font-semibold flex items-center justify-center gap-1.5 border border-neutral-700/80 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-neutral-300" />
            <span>View Product</span>
          </button>
        </div>
      </div>
    </div>
  );
};
