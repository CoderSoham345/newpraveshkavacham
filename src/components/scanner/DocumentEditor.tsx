import React, { useRef, useState, useEffect, useCallback } from 'react';
import { FilterType, QuadCorners, Point } from '../../types';
import {
  cropAndPerspectiveWarp,
  processCanvasImage,
  getDefaultQuadCorners,
} from '../../services/imageProcessing';
import { Sliders, Crop, RotateCw, RefreshCw, CheckCircle, Sparkles, Sun, Contrast as ContrastIcon, Zap } from 'lucide-react';

interface DocumentEditorProps {
  sourceCanvas: HTMLCanvasElement;
  initialCorners?: QuadCorners;
  onConfirmDocument: (processedCanvas: HTMLCanvasElement, corners: QuadCorners) => void;
  onRetake: () => void;
}

export const DocumentEditor: React.FC<DocumentEditorProps> = ({
  sourceCanvas,
  initialCorners = getDefaultQuadCorners(),
  onConfirmDocument,
  onRetake,
}) => {
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [cropMode, setCropMode] = useState<'AUTO' | 'MANUAL'>('AUTO');
  const [corners, setCorners] = useState<QuadCorners>(initialCorners);
  const [activeCorner, setActiveCorner] = useState<keyof QuadCorners | null>(null);

  // Enhancement States
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('ENHANCED');
  const [brightness, setBrightness] = useState<number>(10); // -100 to 100
  const [contrast, setContrast] = useState<number>(15);   // -100 to 100
  const [sharpness, setSharpness] = useState<number>(20);  // 0 to 100

  // Render & process canvas preview on settings change
  const renderPreview = useCallback(() => {
    if (!previewCanvasRef.current) return;

    // 1. Perspective Crop source canvas
    const warpedCanvas = cropAndPerspectiveWarp(sourceCanvas, corners, 856, 540);

    const ctx = previewCanvasRef.current.getContext('2d')!;
    previewCanvasRef.current.width = warpedCanvas.width;
    previewCanvasRef.current.height = warpedCanvas.height;

    // 2. Draw base warped image
    ctx.drawImage(warpedCanvas, 0, 0);

    // 3. Process image with real pixel filters & adjustments
    const processedImageData = processCanvasImage(
      ctx,
      warpedCanvas.width,
      warpedCanvas.height,
      selectedFilter,
      brightness,
      contrast,
      sharpness
    );

    ctx.putImageData(processedImageData, 0, 0);
  }, [sourceCanvas, corners, selectedFilter, brightness, contrast, sharpness]);

  useEffect(() => {
    renderPreview();
  }, [renderPreview]);

  // Handle Corner Dragging for Manual Crop
  const handlePointerDown = (cornerKey: keyof QuadCorners) => {
    if (cropMode === 'MANUAL') {
      setActiveCorner(cornerKey);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!activeCorner || cropMode !== 'MANUAL') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));

    setCorners((prev) => ({
      ...prev,
      [activeCorner]: { x, y },
    }));
  };

  const handlePointerUp = () => {
    setActiveCorner(null);
  };

  const handleReset = () => {
    setCorners(getDefaultQuadCorners());
    setSelectedFilter('ENHANCED');
    setBrightness(10);
    setContrast(15);
    setSharpness(20);
  };

  const handleConfirm = () => {
    if (!previewCanvasRef.current) return;
    onConfirmDocument(previewCanvasRef.current, corners);
  };

  return (
    <div className="bg-slate-900 text-white rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col max-w-3xl mx-auto">
      {/* Editor Header */}
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <h3 className="font-bold text-sm text-slate-100">DOCUMENT EDITOR & ENHANCER</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setCropMode(cropMode === 'AUTO' ? 'MANUAL' : 'AUTO')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 border transition-colors ${
              cropMode === 'MANUAL'
                ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <Crop className="w-3.5 h-3.5" />
            <span>{cropMode === 'AUTO' ? 'MANUAL CROP' : 'AUTO CROP'}</span>
          </button>
        </div>
      </div>

      {/* Editor Viewport */}
      <div className="p-4 bg-slate-950/60 flex flex-col items-center">
        {/* Canvas Stage */}
        <div
          className="relative max-w-full rounded-xl overflow-hidden border border-slate-700 bg-slate-950 shadow-inner"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <canvas
            ref={previewCanvasRef}
            className="max-w-full max-h-[380px] object-contain block"
          />

          {/* Manual Corner Drag Handles Overlay */}
          {cropMode === 'MANUAL' && (
            <div className="absolute inset-0 pointer-events-auto">
              {(Object.keys(corners) as Array<keyof QuadCorners>).map((key) => {
                const corner = corners[key];
                return (
                  <div
                    key={key}
                    onPointerDown={() => handlePointerDown(key)}
                    style={{
                      left: `${corner.x * 100}%`,
                      top: `${corner.y * 100}%`,
                    }}
                    className="absolute w-6 h-6 -ml-3 -mt-3 bg-emerald-500 border-2 border-white rounded-full shadow-lg cursor-grab active:cursor-grabbing hover:scale-125 transition-transform flex items-center justify-center text-[9px] font-bold text-slate-950"
                  >
                    {key === 'topLeft' ? 'TL' : key === 'topRight' ? 'TR' : key === 'bottomRight' ? 'BR' : 'BL'}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {cropMode === 'MANUAL' && (
          <p className="text-xs text-amber-400 mt-2 font-medium">
            Drag the 4 corner handles (TL, TR, BR, BL) to precisely align Aadhaar card boundaries.
          </p>
        )}
      </div>

      {/* Tools & Filters Control Section */}
      <div className="bg-slate-900 border-t border-slate-800 p-4 space-y-4">
        {/* Filter Preset Buttons */}
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Real Pixel Enhancement Filters:
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {(
              [
                { id: 'ORIGINAL', label: 'Original' },
                { id: 'AUTO', label: 'Auto' },
                { id: 'ENHANCED', label: 'Enhanced' },
                { id: 'DOCUMENT', label: 'Document' },
                { id: 'GRAYSCALE', label: 'Grayscale' },
                { id: 'BLACK_WHITE', label: 'B & W' },
              ] as Array<{ id: FilterType; label: string }>
            ).map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setSelectedFilter(f.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedFilter === f.id
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sliders: Brightness, Contrast, Sharpness */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1 font-medium">
              <span className="flex items-center"><Sun className="w-3.5 h-3.5 mr-1 text-amber-400" /> Brightness</span>
              <span>{brightness}</span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="w-full accent-emerald-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1 font-medium">
              <span className="flex items-center"><ContrastIcon className="w-3.5 h-3.5 mr-1 text-blue-400" /> Contrast</span>
              <span>{contrast}</span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              value={contrast}
              onChange={(e) => setContrast(Number(e.target.value))}
              className="w-full accent-emerald-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1 font-medium">
              <span className="flex items-center"><Zap className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Sharpness</span>
              <span>{sharpness}</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              value={sharpness}
              onChange={(e) => setSharpness(Number(e.target.value))}
              className="w-full accent-emerald-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-3">
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>RESET</span>
            </button>
            <button
              type="button"
              onClick={onRetake}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              RETAKE
            </button>
          </div>

          <button
            type="button"
            onClick={handleConfirm}
            className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-950/40 transition-all"
          >
            <CheckCircle className="w-4 h-4" />
            <span>USE THIS DOCUMENT</span>
          </button>
        </div>
      </div>
    </div>
  );
};
