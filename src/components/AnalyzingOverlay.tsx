import React, { useEffect, useState } from 'react';
import { Sparkles, Search, Layers, CheckCircle2, Loader2 } from 'lucide-react';

interface AnalyzingOverlayProps {
  imagePreview?: string;
}

export const AnalyzingOverlay: React.FC<AnalyzingOverlayProps> = ({ imagePreview }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { title: 'Uploading & validating image', desc: 'Secure payload checking' },
    { title: 'Analyzing with Gemini Vision AI', desc: 'Detecting category, colors, materials & styles' },
    { title: 'Multi-object scanning', desc: 'Checking for multi-product composition' },
    { title: 'Querying catalog across 5 stores', desc: 'Searching Meesho, Amazon, Flipkart, Myntra, Ajio' },
    { title: 'Calculating relevance scores', desc: 'Ranking by exact match, visual similarity & alternatives' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-xl mx-auto py-12 px-4 text-center">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl space-y-6">
        {/* Animated Scanner Visual */}
        <div className="relative w-36 h-36 mx-auto rounded-2xl overflow-hidden border-2 border-amber-500/50 shadow-lg shadow-amber-500/10 bg-neutral-950">
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Scanning"
              className="w-full h-full object-cover filter brightness-90"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-neutral-900">
              <Sparkles className="w-10 h-10 text-amber-400" />
            </div>
          )}

          {/* Glowing laser scanline */}
          <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-bounce shadow-[0_0_15px_#f59e0b]"></div>
          <div className="absolute inset-0 bg-amber-500/10 mix-blend-overlay"></div>
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
            <span>Analyzing image...</span>
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Gemini Multimodal Vision is examining product visual features.
          </p>
        </div>

        {/* Step Progress Checklist */}
        <div className="space-y-2.5 text-left max-w-md mx-auto pt-2">
          {steps.map((step, idx) => {
            const isDone = idx < currentStep;
            const isCurrent = idx === currentStep;

            return (
              <div
                key={idx}
                className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all duration-300 ${
                  isCurrent
                    ? 'bg-neutral-800/90 border-amber-500/40 text-amber-300'
                    : isDone
                    ? 'bg-neutral-900/50 border-neutral-800 text-neutral-400'
                    : 'opacity-40 border-transparent text-neutral-600'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-neutral-700 shrink-0" />
                )}

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold leading-tight truncate">{step.title}</p>
                  <p className="text-[10px] text-neutral-500 leading-tight truncate">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
