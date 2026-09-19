import React from 'react';
import { Sparkles, RefreshCw, Check, Layers, Tag, Eye } from 'lucide-react';
import { AIAnalysisResult, DetectedObject } from '../types/index.js';

interface AnalysisBannerProps {
  imagePreview: string;
  analysis: AIAnalysisResult;
  selectedObjectId?: string;
  onSelectObject: (obj: DetectedObject) => void;
  onChangeImage: () => void;
  isReanalyzing?: boolean;
}

export const AnalysisBanner: React.FC<AnalysisBannerProps> = ({
  imagePreview,
  analysis,
  selectedObjectId,
  onSelectObject,
  onChangeImage,
  isReanalyzing = false,
}) => {
  const hasMultiple = analysis.is_multi_product || analysis.detected_objects.length > 1;

  return (
    <div id="analysis-banner" className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 sm:p-6 shadow-xl">
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 justify-between">
        {/* Left: Image Preview & Primary Detected Title */}
        <div className="flex items-start sm:items-center gap-4 w-full lg:w-auto">
          <div className="relative shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border border-neutral-700 bg-neutral-950">
            <img
              src={imagePreview}
              alt="Uploaded product"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <button
              id="btn-change-image"
              onClick={onChangeImage}
              className="absolute bottom-1 right-1 p-1 rounded bg-black/80 hover:bg-black text-white text-[10px] flex items-center gap-0.5 border border-neutral-700"
              title="Change Image"
            >
              <RefreshCw className="w-2.5 h-2.5" />
            </button>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                <Sparkles className="w-3 h-3" />
                Detected by Gemini Vision
              </span>
              {analysis.brand && analysis.brand !== 'unknown' && (
                <span className="text-[11px] font-medium text-neutral-300 bg-neutral-800 px-2 py-0.5 rounded-full border border-neutral-700">
                  Brand: {analysis.brand}
                </span>
              )}
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-white truncate capitalize">
              {analysis.product_type || analysis.category}
            </h2>

            <p className="text-xs text-neutral-400 line-clamp-2 mt-0.5 max-w-xl">
              {analysis.description}
            </p>

            {/* Quick Tag Pills */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[11px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                {analysis.category}
              </span>
              {analysis.color?.map((c) => (
                <span
                  key={c}
                  className="text-[11px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700 capitalize flex items-center gap-1"
                >
                  <span
                    className="w-2 h-2 rounded-full border border-neutral-600 inline-block"
                    style={{
                      backgroundColor:
                        c.toLowerCase() === 'white'
                          ? '#ffffff'
                          : c.toLowerCase() === 'black'
                          ? '#000000'
                          : c.toLowerCase() === 'gold'
                          ? '#eab308'
                          : c.toLowerCase() === 'red'
                          ? '#ef4444'
                          : c.toLowerCase() === 'blue'
                          ? '#3b82f6'
                          : '#a8a29e',
                    }}
                  />
                  {c}
                </span>
              ))}
              {analysis.style && (
                <span className="text-[11px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700 capitalize">
                  {analysis.style}
                </span>
              )}
              {analysis.material && (
                <span className="text-[11px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700 capitalize">
                  {analysis.material}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Change Image CTA */}
        <div className="shrink-0 flex items-center gap-3">
          <button
            id="btn-change-image-secondary"
            onClick={onChangeImage}
            className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold border border-neutral-700 flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Upload Another Photo</span>
          </button>
        </div>
      </div>

      {/* Multi-Product Object Selector (User Prompt Requirement) */}
      {hasMultiple && (
        <div className="mt-5 pt-4 border-t border-neutral-800">
          <div className="flex items-center gap-2 mb-2.5">
            <Layers className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">
              Multiple Products Detected in Image
            </span>
            <span className="text-xs text-neutral-400">
              — Select an item to focus visual search:
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {analysis.detected_objects.map((obj) => {
              const isSelected = selectedObjectId === obj.id || (!selectedObjectId && obj === analysis.detected_objects[0]);
              return (
                <button
                  key={obj.id}
                  id={`btn-select-object-${obj.id}`}
                  onClick={() => onSelectObject(obj)}
                  disabled={isReanalyzing}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 border transition-all duration-150 ${
                    isSelected
                      ? 'bg-amber-400 text-neutral-950 border-amber-300 shadow-md shadow-amber-400/20 scale-[1.02]'
                      : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  <span>{obj.name}</span>
                  {obj.color && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded capitalize ${
                        isSelected ? 'bg-amber-500/40 text-neutral-900' : 'bg-neutral-900 text-neutral-400'
                      }`}
                    >
                      {obj.color}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
