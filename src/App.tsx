import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.js';
import { HeroUploader } from './components/HeroUploader.js';
import { DemoPresetsBar } from './components/DemoPresetsBar.js';
import { AnalyzingOverlay } from './components/AnalyzingOverlay.js';
import { AnalysisBanner } from './components/AnalysisBanner.js';
import { ProductResults } from './components/ProductResults.js';
import { ProductDetailModal } from './components/ProductDetailModal.js';
import { CameraModal } from './components/CameraModal.js';
import { ArchitectureModal } from './components/ArchitectureModal.js';
import { ExtensionDownloadModal } from './components/ExtensionDownloadModal.js';
import { StoreSimulator } from './components/StoreSimulator.js';
import { RealStoreComparison } from './components/RealStoreComparison.js';
import { performVisualSearch, getSystemHealth } from './services/api.js';
import { AIAnalysisResult, DetectedObject, RankedProduct, LiveStoreLink, StorePriceBenchmark } from './types/index.js';
import { DemoPreset } from './data/demoPresets.js';
import { urlToBase64 } from './utils/imageHelper.js';
import { AlertCircle, ArrowLeft, RefreshCw, ShoppingCart, Sparkles, Chrome, Download, MonitorSmartphone, Upload } from 'lucide-react';

export default function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isReanalyzingObject, setIsReanalyzingObject] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [rankedProducts, setRankedProducts] = useState<RankedProduct[]>([]);
  const [liveStoreLinks, setLiveStoreLinks] = useState<LiveStoreLink[] | undefined>(undefined);
  const [priceBenchmark, setPriceBenchmark] = useState<StorePriceBenchmark | undefined>(undefined);
  const [selectedObject, setSelectedObject] = useState<DetectedObject | null>(null);
  const [selectedProductDetail, setSelectedProductDetail] = useState<RankedProduct | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [isArchitectureModalOpen, setIsArchitectureModalOpen] = useState<boolean>(false);
  const [isExtensionModalOpen, setIsExtensionModalOpen] = useState<boolean>(false);
  const [isSimulatorMode, setIsSimulatorMode] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [executionTimeMs, setExecutionTimeMs] = useState<number>(0);
  const [geminiActive, setGeminiActive] = useState<boolean>(true);

  // Check backend health on mount
  useEffect(() => {
    getSystemHealth()
      .then((health) => {
        setGeminiActive(health.geminiEnabled);
      })
      .catch(() => {
        setGeminiActive(false);
      });
  }, []);

  const triggerSearch = async (
    image: string,
    imageMime: string,
    focusObjectName?: string
  ) => {
    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const response = await performVisualSearch({
        image,
        mimeType: imageMime,
        focusObjectName,
      });

      setAnalysisResult(response.analysis);
      setRankedProducts(response.products);
      setLiveStoreLinks(response.liveStoreLinks);
      setPriceBenchmark(response.priceBenchmark);
      setExecutionTimeMs(response.executionTimeMs);

      if (response.analysis.detected_objects && response.analysis.detected_objects.length > 0) {
        if (focusObjectName) {
          const matched = response.analysis.detected_objects.find(
            (o) => o.name.toLowerCase() === focusObjectName.toLowerCase()
          );
          setSelectedObject(matched || response.analysis.detected_objects[0]);
        } else {
          setSelectedObject(response.analysis.detected_objects[0]);
        }
      }
    } catch (err: any) {
      console.error('Visual search failed:', err);
      setErrorMessage(
        err?.message || 'Visual search could not be completed. Please try another image.'
      );
    } finally {
      setIsAnalyzing(false);
      setIsReanalyzingObject(false);
    }
  };

  const handleImageSelected = (base64: string, type: string) => {
    setSelectedImage(base64);
    setMimeType(type);
    setErrorMessage(null);
    setAnalysisResult(null);
    setRankedProducts([]);
    // Immediately start visual search for seamless user experience
    triggerSearch(base64, type);
  };

  const handleManualSearch = () => {
    if (selectedImage) {
      triggerSearch(selectedImage, mimeType);
    }
  };

  const handleSelectPreset = async (preset: DemoPreset) => {
    setErrorMessage(null);
    setIsAnalyzing(true);
    try {
      const { base64, mimeType: presetMime } = await urlToBase64(preset.imageUrl);
      setSelectedImage(base64);
      setMimeType(presetMime);
      await triggerSearch(base64, presetMime);
    } catch (err: any) {
      console.error('Failed to load demo preset:', err);
      setErrorMessage('Could not load sample image. Please try another one.');
      setIsAnalyzing(false);
    }
  };

  const handleSelectObject = (obj: DetectedObject) => {
    if (!selectedImage) return;
    setSelectedObject(obj);
    setIsReanalyzingObject(true);
    triggerSearch(selectedImage, mimeType, obj.name);
  };

  const handleReset = () => {
    setSelectedImage(null);
    setAnalysisResult(null);
    setRankedProducts([]);
    setLiveStoreLinks(undefined);
    setPriceBenchmark(undefined);
    setSelectedObject(null);
    setErrorMessage(null);
    setExecutionTimeMs(0);
  };

  const handleCameraCapture = (dataUrl: string) => {
    setIsCameraOpen(false);
    handleImageSelected(dataUrl, 'image/jpeg');
  };

  const hasResults = Boolean(analysisResult && rankedProducts.length > 0);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-amber-400 selection:text-neutral-950">
      {/* Top Navigation */}
      <Navbar
        onReset={handleReset}
        onOpenArchitecture={() => setIsArchitectureModalOpen(true)}
        onOpenExtensionModal={() => setIsExtensionModalOpen(true)}
        onToggleSimulator={() => setIsSimulatorMode(!isSimulatorMode)}
        isSimulatorMode={isSimulatorMode}
        geminiActive={geminiActive}
        hasActiveSearch={hasResults || Boolean(selectedImage)}
        onImageSelected={handleImageSelected}
        onOpenCamera={() => setIsCameraOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Global Error Notice */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-950/70 border border-red-800 text-red-200 text-xs sm:text-sm flex items-start gap-3 max-w-2xl mx-auto animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-white">Search Notice</p>
              <p className="mt-0.5">{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs underline text-red-300 hover:text-white"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Simulator View vs Web App View */}
        {isSimulatorMode ? (
          <StoreSimulator
            onBackToApp={() => setIsSimulatorMode(false)}
            onOpenDownloadModal={() => setIsExtensionModalOpen(true)}
            onImageSelected={handleImageSelected}
          />
        ) : (
          <>
            {/* Live E-Commerce Multi-Store Price Engine Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-md">
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">
                      Cross-Store Visual Shopping Assistant
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      5 Stores Connected
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Instantly finds identical products & wholesale alternatives across <span className="text-pink-400 font-medium">Meesho</span>, <span className="text-amber-400 font-medium">Amazon</span>, <span className="text-blue-400 font-medium">Flipkart</span>, <span className="text-rose-400 font-medium">Myntra</span>, and <span className="text-cyan-400 font-medium">Ajio</span>.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  id="header-btn-upload-image"
                  onClick={() => {
                    const el = document.getElementById('product-image-file-input') as HTMLInputElement | null;
                    if (el) el.click();
                    else {
                      const navEl = document.querySelector('header input[type="file"]') as HTMLInputElement | null;
                      if (navEl) navEl.click();
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm transition-transform active:scale-95 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Image</span>
                </button>

                <button
                  onClick={() => setIsSimulatorMode(true)}
                  className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold border border-neutral-700 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MonitorSmartphone className="w-3.5 h-3.5 text-amber-400" />
                  <span>Test Store Demo</span>
                </button>
              </div>
            </div>

            {/* State 1: Loading State (Analyzing...) */}
            {isAnalyzing ? (
              <AnalyzingOverlay imagePreview={selectedImage || undefined} />
            ) : !hasResults ? (
              /* State 2: Initial Upload Screen */
              <div className="space-y-12 py-4">
                <HeroUploader
                  onImageSelected={handleImageSelected}
                  onOpenCamera={() => setIsCameraOpen(true)}
                  isAnalyzing={isAnalyzing}
                  selectedPreview={selectedImage}
                  onClearImage={handleReset}
                  onSearch={handleManualSearch}
                />

                <DemoPresetsBar
                  onSelectPreset={handleSelectPreset}
                  disabled={isAnalyzing}
                />
              </div>
            ) : (
              /* State 3: Results Screen */
              <div className="space-y-8 animate-in fade-in duration-300">
                {/* Top Analysis Banner with Multi-Product Selectors */}
                {analysisResult && (
                  <AnalysisBanner
                    imagePreview={selectedImage!}
                    analysis={analysisResult}
                    selectedObjectId={selectedObject?.id}
                    onSelectObject={handleSelectObject}
                    onChangeImage={handleReset}
                    isReanalyzing={isReanalyzingObject}
                  />
                )}

                {/* Real-World Live Store Search & Price Comparison Hub */}
                {analysisResult && (
                  <RealStoreComparison
                    analysis={analysisResult}
                    liveStoreLinks={liveStoreLinks}
                    priceBenchmark={priceBenchmark}
                  />
                )}

                {/* Categorized Product Results (Best Matches, Similar, Alternatives) */}
                <ProductResults
                  products={rankedProducts}
                  executionTimeMs={executionTimeMs}
                  onSelectProduct={(p) => setSelectedProductDetail(p)}
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-800/80 bg-neutral-900/60 py-6 mt-12 text-center text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-400">VISIONCART</span>
            <span>—</span>
            <span>AI Multimodal Visual Shopping Extension & Engine</span>
          </div>

          <div className="flex items-center gap-4 text-neutral-400">
            <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>Meesho • Amazon • Flipkart • Myntra • Ajio</span>
            </span>
            <span>&bull;</span>
            <button
              onClick={() => setIsSimulatorMode(!isSimulatorMode)}
              className="hover:text-amber-400 underline transition-colors"
            >
              {isSimulatorMode ? 'Exit Shopping Demo' : 'Live Shopping Demo'}
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ExtensionDownloadModal
        isOpen={isExtensionModalOpen}
        onClose={() => setIsExtensionModalOpen(false)}
        onOpenSimulator={() => {
          setIsExtensionModalOpen(false);
          setIsSimulatorMode(true);
        }}
      />

      <ProductDetailModal
        product={selectedProductDetail}
        onClose={() => setSelectedProductDetail(null)}
      />

      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />

      <ArchitectureModal
        isOpen={isArchitectureModalOpen}
        onClose={() => setIsArchitectureModalOpen(false)}
      />
    </div>
  );
}
