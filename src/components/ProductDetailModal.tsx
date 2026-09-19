import React from 'react';
import { X, Star, ExternalLink, ShieldCheck, CheckCircle2, ShoppingBag, Sparkles, Tag, AlertTriangle } from 'lucide-react';
import { RankedProduct } from '../types/index.js';

interface ProductDetailModalProps {
  product: RankedProduct | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  if (!product) return null;

  const { matchBreakdown } = product;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in">
      <div
        id="product-detail-modal"
        className="relative w-full max-w-3xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="btn-close-modal"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left Column: Product Image */}
          <div className="relative bg-neutral-950 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-neutral-800">
            <div className="relative w-full aspect-square max-w-sm rounded-xl overflow-hidden border border-neutral-800 shadow-lg">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 left-3">
                <span className="px-3 py-1 rounded-md text-xs font-bold bg-neutral-900/90 text-white border border-neutral-700 backdrop-blur-md">
                  {product.store}
                </span>
              </div>

              <div className="absolute top-3 right-3">
                <span className="px-3 py-1 rounded-md text-xs font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 backdrop-blur-md">
                  {product.matchScore}% Match
                </span>
              </div>
            </div>

            {/* Prototype Notice */}
            <div className="mt-4 p-3 rounded-lg bg-amber-950/40 border border-amber-900/50 text-amber-300 text-xs flex items-start gap-2 max-w-sm">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Prototype Notice:</strong> This product represents realistic mock catalog data across {product.store}.
              </span>
            </div>
          </div>

          {/* Right Column: Details & Match Engine Breakdown */}
          <div className="p-6 space-y-5 flex flex-col justify-between max-h-[80vh] overflow-y-auto">
            <div className="space-y-4">
              {/* Category & Rating */}
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span>{product.category} &rsaquo; {product.subcategory}</span>
                <div className="flex items-center gap-1 text-amber-400 font-semibold">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{product.rating}</span>
                  <span className="text-neutral-500">({product.reviewCount} reviews)</span>
                </div>
              </div>

              {/* Title & Price */}
              <div>
                <h2 className="text-xl font-bold text-white leading-snug">{product.name}</h2>
                <div className="flex items-baseline gap-2.5 mt-2">
                  <span className="text-2xl font-extrabold text-white">
                    {product.currency}{product.price.toLocaleString('en-IN')}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-neutral-500 line-through">
                      {product.currency}{product.originalPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    {product.availability}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-neutral-300 leading-relaxed">
                {product.description}
              </p>

              {/* Attributes Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                <div>
                  <span className="text-neutral-500 block">Colors:</span>
                  <span className="text-neutral-200 capitalize font-medium">{product.color.join(', ')}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Material:</span>
                  <span className="text-neutral-200 capitalize font-medium">{product.material}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Style:</span>
                  <span className="text-neutral-200 capitalize font-medium">{product.style}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Store:</span>
                  <span className="text-neutral-200 font-medium">{product.store}</span>
                </div>
              </div>

              {/* Match Engine Transparency Card */}
              <div className="bg-neutral-800/60 rounded-xl p-3.5 border border-neutral-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Relevance Match Breakdown</span>
                  </div>
                  <span className="text-xs font-extrabold text-white">
                    {product.matchScore} / 100
                  </span>
                </div>

                {/* Score bars */}
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between text-neutral-300">
                    <span>Category & Silhouette Match:</span>
                    <span className="font-mono text-neutral-400">{matchBreakdown.categoryScore}/30</span>
                  </div>
                  <div className="w-full bg-neutral-700/50 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-400 h-full rounded-full"
                      style={{ width: `${(matchBreakdown.categoryScore / 30) * 100}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-neutral-300 pt-1">
                    <span>Keyword & Visual Feature Overlap:</span>
                    <span className="font-mono text-neutral-400">{matchBreakdown.keywordScore}/25</span>
                  </div>
                  <div className="w-full bg-neutral-700/50 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-400 h-full rounded-full"
                      style={{ width: `${(matchBreakdown.keywordScore / 25) * 100}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-neutral-300 pt-1">
                    <span>Color Tone Similarity:</span>
                    <span className="font-mono text-neutral-400">{matchBreakdown.colorScore}/15</span>
                  </div>
                  <div className="w-full bg-neutral-700/50 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-400 h-full rounded-full"
                      style={{ width: `${(matchBreakdown.colorScore / 15) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Match Reasons */}
                {matchBreakdown.reasons.length > 0 && (
                  <div className="pt-2 border-t border-neutral-700/60 space-y-1">
                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">
                      Why this matched:
                    </span>
                    {matchBreakdown.reasons.map((r, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[11px] text-neutral-300">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 flex items-center gap-3">
              <a
                href={product.productUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
              >
                <span>View on {product.store}</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                onClick={onClose}
                className="py-3 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs sm:text-sm font-semibold border border-neutral-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
