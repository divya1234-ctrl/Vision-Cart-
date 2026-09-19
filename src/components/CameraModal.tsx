import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, AlertCircle } from 'lucide-react';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (base64Image: string) => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // prefer back camera on phones
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError(
        'Unable to access camera. Please allow camera permissions or upload an image file instead.'
      );
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        stopCamera();
        onCapture(dataUrl);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Snap Product Photo</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {cameraError ? (
          <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Camera Access Error</p>
              <p className="mt-0.5">{cameraError}</p>
            </div>
          </div>
        ) : (
          <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-neutral-800 flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {/* Viewfinder target guides */}
            <div className="absolute inset-8 border border-white/30 rounded-xl pointer-events-none flex items-center justify-center">
              <div className="w-3 h-3 border-t-2 border-l-2 border-amber-400 absolute top-0 left-0"></div>
              <div className="w-3 h-3 border-t-2 border-r-2 border-amber-400 absolute top-0 right-0"></div>
              <div className="w-3 h-3 border-b-2 border-l-2 border-amber-400 absolute bottom-0 left-0"></div>
              <div className="w-3 h-3 border-b-2 border-r-2 border-amber-400 absolute bottom-0 right-0"></div>
              <span className="text-[10px] text-white/60 uppercase tracking-wider font-semibold">
                Align Product Here
              </span>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold"
          >
            Cancel
          </button>

          {!cameraError && (
            <button
              type="button"
              id="btn-capture-photo"
              onClick={handleCapture}
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-400/20"
            >
              <Camera className="w-4 h-4" />
              <span>Capture & Search</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
