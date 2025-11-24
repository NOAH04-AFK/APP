import React, { useRef, useState, useCallback } from 'react';
import { Camera, X, Zap, AlertTriangle } from 'lucide-react';
import { identifyComponentFromImage } from '../services/geminiService';
import { PCComponent, ComponentType } from '../types';

interface ScannerProps {
  onComponentFound: (component: PCComponent) => void;
  onClose: () => void;
}

export const Scanner: React.FC<ScannerProps> = ({ onComponentFound, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
      }
    } catch (err: any) {
      console.error("Error accessing camera:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError("Permiso de cámara denegado. Por favor habilítalo en la configuración de tu navegador.");
      } else {
        setError("No se pudo acceder a la cámara. Asegúrate de estar en un dispositivo con cámara.");
      }
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setIsStreaming(false);
    }
  }, []);

  React.useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current || analyzing) return;

    setAnalyzing(true);
    const context = canvasRef.current.getContext('2d');
    if (context) {
      // Downscale image for better performance and API limits
      const width = Math.min(640, videoRef.current.videoWidth);
      const height = (videoRef.current.videoHeight / videoRef.current.videoWidth) * width;
      
      canvasRef.current.width = width;
      canvasRef.current.height = height;
      context.drawImage(videoRef.current, 0, 0, width, height);

      const base64Data = canvasRef.current.toDataURL('image/jpeg', 0.7).split(',')[1];
      
      const result = await identifyComponentFromImage(base64Data);
      
      if (result && result.name) {
        const newComponent: PCComponent = {
          id: Date.now().toString(),
          name: result.name,
          type: result.type as ComponentType || ComponentType.CASE, 
          price: 0, 
          specs: result.specs,
          image: `https://placehold.co/100x100?text=${result.name.substring(0,3)}`
        };
        onComponentFound(newComponent);
      } else {
        alert("No se pudo identificar el componente. Intenta mejor iluminación.");
      }
    }
    setAnalyzing(false);
  };

  if (error) {
    return (
      <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="text-red-500" size={32} />
        </div>
        <h3 className="text-white text-xl font-bold mb-2">Error de Cámara</h3>
        <p className="text-gray-400 mb-6">{error}</p>
        <button 
          onClick={onClose}
          className="bg-slate-700 text-white px-6 py-2 rounded-lg hover:bg-slate-600 transition"
        >
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="relative flex-1 bg-slate-900 overflow-hidden">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className="w-full h-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Scanner HUD */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 border-2 border-cyan-500/30 m-8 rounded-2xl"></div>
          
          {/* Scanning Line */}
          {analyzing && (
            <div className="absolute left-8 right-8 top-8 h-1 bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.8)] animate-[scan_2s_ease-in-out_infinite]" />
          )}

          <div className="absolute top-0 right-0 p-4 pointer-events-auto">
            <button 
              onClick={onClose}
              className="bg-black/40 backdrop-blur-md p-2 rounded-full text-white hover:bg-black/60 transition"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {analyzing && (
           <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-10">
             <div className="text-cyan-400 font-bold text-xl flex flex-col items-center">
               <Zap className="mb-4 w-10 h-10 animate-bounce" />
               <span className="animate-pulse">Analizando Hardware...</span>
             </div>
           </div>
        )}
      </div>

      <div className="h-32 bg-slate-900 flex items-center justify-center relative">
        <div className="absolute -top-6 left-0 right-0 h-6 bg-gradient-to-t from-slate-900 to-transparent"></div>
        <button 
          onClick={captureAndAnalyze}
          disabled={analyzing}
          className="group relative w-20 h-20 flex items-center justify-center active:scale-95 transition-transform"
        >
          <div className="absolute inset-0 bg-cyan-500/20 rounded-full scale-110 group-hover:scale-125 transition-transform duration-500"></div>
          <div className="absolute inset-0 border-4 border-white rounded-full"></div>
          <div className="w-16 h-16 bg-cyan-500 rounded-full border-4 border-slate-900 z-10"></div>
        </button>
      </div>
      <style>{`
        @keyframes scan {
          0% { top: 2rem; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: calc(100% - 2rem); opacity: 0; }
        }
      `}</style>
    </div>
  );
};