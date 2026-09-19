import React, { useRef, useState } from 'react';
import { Upload, Camera, Sparkles, Image as ImageIcon, AlertCircle, X } from 'lucide-react';

interface HeroUploaderProps {
  onImageSelected: (base64: string, mimeType: string) => void;
  onOpenCamera: () => void;
  isAnalyzing: boolean;
  selectedPreview?: string | null;
  onClearImage?: () => void;
  onSearch?: () => void;
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export const HeroUploader: React.FC<HeroUploaderProps> = ({
  onImageSelected,
  onOpenCamera,
  isAnalyzing,
  selectedPreview,
  onClearImage,
  onSearch,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileProcess = (file: File) => {
    setErrorMessage(null);

    // 1. Validate file type
    if (!ACCEPTED_TYPES.includes(file.type.toLowerCase())) {
      setErrorMessage(
        `Unsupported file type (${file.type || 'unknown'}). Please upload a JPEG, PNG, WEBP, or GIF image.`
      );
      return;
    }

    // 2. Validate file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setErrorMessage(`File is too large (${sizeMB}MB). Maximum allowed image size is 10MB.`);
      return;
    }

    // 3. Read as Base64 data URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        onImageSelected(result, file.type);
      }
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read the image file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileProcess(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto text-center space-y-6">
      {/* Title & Tagline */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Multimodal Visual Search</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Find Any Product <span className="text-amber-400">by Image</span>
        </h1>
        <p className="text-sm sm:text-base text-neutral-400 max-w-lg mx-auto">
          Upload a photo of clothes, shoes, bags, watches, or tech. VisionCart identifies the item and discovers matches across stores.
        </p>
      </div>

      {/* Validation Error Banner */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-800 text-red-200 text-xs sm:text-sm flex items-start gap-2.5 text-left animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">{errorMessage}</div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-400 hover:text-red-200 p-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload Zone / Preview Card */}
      {!selectedPreview ? (
        <div
          id="dropzone-uploader"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 cursor-pointer transition-all duration-200 group bg-neutral-900/60 ${
            isDragging
              ? 'border-amber-400 bg-amber-400/5 scale-[1.01]'
              : 'border-neutral-700 hover:border-neutral-500 hover:bg-neutral-900'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleInputChange}
            className="hidden"
            id="product-image-file-input"
          />

          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-neutral-800 group-hover:bg-neutral-700 flex items-center justify-center border border-neutral-700 text-amber-400 transition-colors shadow-lg">
              <Upload className="w-8 h-8 group-hover:-translate-y-0.5 transition-transform" />
            </div>

            <div className="space-y-1">
              <p className="text-base font-semibold text-white">
                Upload a product image or drag & drop here
              </p>
              <p className="text-xs text-neutral-400">
                Supports JPEG, PNG, WEBP, GIF (up to 10MB)
              </p>
            </div>

            {/* Action Buttons inside Zone */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                id="btn-upload-image"
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs sm:text-sm shadow-md shadow-amber-500/20 flex items-center gap-2 transition-transform active:scale-95"
              >
                <ImageIcon className="w-4 h-4" />
                <span>Upload Image</span>
              </button>

              <button
                type="button"
                id="btn-open-camera"
                onClick={onOpenCamera}
                className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-xs sm:text-sm border border-neutral-700 flex items-center gap-2 transition-colors"
              >
                <Camera className="w-4 h-4 text-neutral-300" />
                <span>Take Photo</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Image Preview State (Prompt requirement: After upload preview) */
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl space-y-5 text-left">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Your Image Selected
            </span>
            <button
              id="btn-clear-preview"
              onClick={onClearImage}
              className="text-xs text-neutral-400 hover:text-white flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Remove</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-5">
            <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-xl overflow-hidden border-2 border-neutral-700 bg-neutral-950 shrink-0">
              <img
                src={selectedPreview}
                alt="Selected preview"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 space-y-3 text-center sm:text-left">
              <div>
                <h3 className="text-lg font-bold text-white">Ready for Vision Search</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  VisionCart will analyze visual attributes (fabric, color, silhouette) and search our 5-store catalog for exact & similar matches.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  id="btn-trigger-search"
                  onClick={onSearch}
                  disabled={isAnalyzing}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-sm shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Search Product</span>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full sm:w-auto px-4 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-xs border border-neutral-700 transition-colors"
                >
                  Choose Different Image
                </button>
              </div>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleInputChange}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
};
