import React, { useRef, useState, useEffect } from 'react';
import { Camera, Image as ImageIcon, Zap, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import { QuadCorners } from '../../types';
import { getDefaultQuadCorners } from '../../services/imageProcessing';

interface CameraViewProps {
  onCapture: (imageCanvas: HTMLCanvasElement, corners: QuadCorners) => void;
  onGallerySelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCancel?: () => void;
}

export const CameraView: React.FC<CameraViewProps> = ({
  onCapture,
  onGallerySelect,
  onCancel,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraStatus, setCameraStatus] = useState<'INITIALIZING' | 'ACTIVE' | 'ERROR'>('INITIALIZING');
  const [errorMessage, setErrorMessage] = useState('');
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [detectionStatus, setDetectionStatus] = useState<
    'Searching...' | 'Document detected' | 'Hold steady' | 'Good lighting' | 'Ready to capture'
  >('Searching...');

  // Start real camera stream
  useEffect(() => {
    let activeStream: MediaStream | null = null;

    async function initCamera() {
      try {
        setCameraStatus('INITIALIZING');
        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: 'environment', // Rear camera preferred for guard phone
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        };
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        activeStream = mediaStream;
        setStream(mediaStream);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play();
        }
        setCameraStatus('ACTIVE');
      } catch (err: any) {
        console.warn('Real camera stream failed or restricted, enabling demo camera mode:', err);
        setCameraStatus('ERROR');
        setErrorMessage(
          'Camera permissions restricted or unavailable in preview frame. You can capture demo document or upload from gallery.'
        );
      }
    }

    initCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Simulation status interval to show real-time document detection lifecycle
  useEffect(() => {
    const statuses: Array<'Searching...' | 'Document detected' | 'Hold steady' | 'Good lighting' | 'Ready to capture'> = [
      'Searching...',
      'Document detected',
      'Hold steady',
      'Good lighting',
      'Ready to capture',
    ];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % statuses.length;
      setDetectionStatus(statuses[idx]);
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  // Yellow Corner Box percentage bounds (0-100)
  const cornerBounds = {
    x: 15, // 15% left
    y: 15, // 15% top
    w: 70, // 70% width
    h: 70, // 70% height
  };

  // Handle Capture click - crops ONLY what is bounded inside the 4 yellow corners
  const handleCaptureClick = () => {
    // Full source canvas
    const sourceCanvas = document.createElement('canvas');
    const fullW = 1280;
    const fullH = 800;
    sourceCanvas.width = fullW;
    sourceCanvas.height = fullH;
    const sCtx = sourceCanvas.getContext('2d')!;

    if (videoRef.current && cameraStatus === 'ACTIVE') {
      sCtx.drawImage(videoRef.current, 0, 0, fullW, fullH);
    } else {
      // Create realistic Aadhaar card sample canvas when real video feed is restricted
      drawSampleAadhaarCanvas(sCtx, fullW, fullH);
    }

    // Calculate exact pixel crop bounds corresponding to the 4 yellow corners
    const cropX = Math.round((cornerBounds.x / 100) * fullW);
    const cropY = Math.round((cornerBounds.y / 100) * fullH);
    const cropW = Math.round((cornerBounds.w / 100) * fullW);
    const cropH = Math.round((cornerBounds.h / 100) * fullH);

    // Create cropped canvas for ONLY what is present inside the 4 yellow corners
    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = cropW;
    croppedCanvas.height = cropH;
    const cCtx = croppedCanvas.getContext('2d')!;

    // Draw ONLY the yellow corners bounded region
    cCtx.drawImage(sourceCanvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

    const corners = getDefaultQuadCorners();
    onCapture(croppedCanvas, corners);
  };

  return (
    <div className="bg-slate-950 text-white rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col relative max-w-2xl mx-auto">
      {/* Top Header Bar */}
      <div className="bg-slate-900/90 backdrop-blur px-4 py-3 border-b border-slate-800 flex items-center justify-between z-10">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <h3 className="font-bold text-sm text-slate-100">SCAN IDENTITY DOCUMENT</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setFlashEnabled(!flashEnabled)}
            className={`p-2 rounded-lg text-xs font-semibold flex items-center space-x-1 border transition-colors ${
              flashEnabled
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span className="hidden sm:inline">{flashEnabled ? 'Flash ON' : 'Flash OFF'}</span>
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Main Camera Viewfinder Stage */}
      <div className="relative aspect-[4/3] sm:aspect-[16/10] bg-slate-900 flex items-center justify-center overflow-hidden">
        {cameraStatus === 'ACTIVE' ? (
          <video
            ref={videoRef}
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        ) : (
          /* Demo Simulated Camera Canvas Stage when live camera permission is pending */
          <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center p-6 text-center relative">
            <div className="w-full max-w-md aspect-[1.585] rounded-xl border-2 border-dashed border-emerald-500/60 bg-slate-800/80 p-4 flex flex-col justify-between shadow-inner relative">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">GOVERNMENT OF INDIA</div>
                  <div className="text-xs font-bold text-emerald-400 mt-1">Aadhaar Card Boundary</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center font-bold text-xs text-slate-300">
                  PHOTO
                </div>
              </div>
              <div className="text-left space-y-1 my-2">
                <div className="h-2 bg-slate-700 rounded w-3/4"></div>
                <div className="h-2 bg-slate-700 rounded w-1/2"></div>
                <div className="h-2 bg-slate-700 rounded w-2/3"></div>
              </div>
              <div className="text-center font-mono text-sm tracking-widest text-emerald-400 font-bold border-t border-slate-700/60 pt-2">
                XXXX XXXX 8912
              </div>
            </div>
          </div>
        )}

        {/* Real-time 4 Yellow Corners Framing Overlay */}
        <div
          className="absolute pointer-events-none transition-all duration-150 border-2 border-yellow-400/80 shadow-[0_0_20px_rgba(250,204,21,0.35)]"
          style={{
            left: `${cornerBounds.x}%`,
            top: `${cornerBounds.y}%`,
            width: `${cornerBounds.w}%`,
            height: `${cornerBounds.h}%`,
          }}
        >
          {/* Top-Left Yellow Corner */}
          <div className="absolute -top-1 -left-1 w-8 h-8 sm:w-10 sm:h-10 border-t-4 border-l-4 border-yellow-400 rounded-tl-sm shadow-[0_0_12px_#facc15]" />

          {/* Top-Right Yellow Corner */}
          <div className="absolute -top-1 -right-1 w-8 h-8 sm:w-10 sm:h-10 border-t-4 border-r-4 border-yellow-400 rounded-tr-sm shadow-[0_0_12px_#facc15]" />

          {/* Bottom-Left Yellow Corner */}
          <div className="absolute -bottom-1 -left-1 w-8 h-8 sm:w-10 sm:h-10 border-b-4 border-l-4 border-yellow-400 rounded-bl-sm shadow-[0_0_12px_#facc15]" />

          {/* Bottom-Right Yellow Corner */}
          <div className="absolute -bottom-1 -right-1 w-8 h-8 sm:w-10 sm:h-10 border-b-4 border-r-4 border-yellow-400 rounded-br-sm shadow-[0_0_12px_#facc15]" />

          {/* Center Crosshair Target */}
          <div className="absolute inset-0 flex items-center justify-center opacity-30">
            <div className="w-6 h-0.5 bg-yellow-400" />
            <div className="h-6 w-0.5 bg-yellow-400 absolute" />
          </div>
        </div>

        {/* Floating Yellow Corner Capture Indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur border border-yellow-400/60 px-4 py-1.5 rounded-full flex items-center space-x-2 text-xs font-bold text-yellow-300 shadow-xl">
          <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
          <span>Captures ONLY content inside 4 Yellow Corners</span>
        </div>
      </div>

      {/* Instruction & Controls Bar */}
      <div className="bg-slate-900 px-4 py-4 border-t border-slate-800 space-y-3">
        <p className="text-xs text-center text-slate-400 font-medium">
          Place the complete Aadhaar card inside the frame. Ensure good lighting without glare.
        </p>

        <div className="flex items-center justify-center space-x-4 pt-1">
          {/* Gallery Upload Button */}
          <label className="cursor-pointer flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors">
            <ImageIcon className="w-4 h-4 text-slate-400" />
            <span>GALLERY</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onGallerySelect}
            />
          </label>

          {/* Capture Primary Button */}
          <button
            type="button"
            onClick={handleCaptureClick}
            className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/50 transition-all transform active:scale-95"
          >
            <Camera className="w-5 h-5" />
            <span>CAPTURE DOCUMENT</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper canvas generator for demo Aadhaar card fallback
function drawSampleAadhaarCanvas(ctx: CanvasRenderingContext2D, width: number, height: number) {
  // Background table surface
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, width, height);

  // Aadhaar card rectangle
  const cardX = width * 0.15;
  const cardY = height * 0.18;
  const cardW = width * 0.7;
  const cardH = height * 0.64;

  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
  ctx.shadowBlur = 20;
  ctx.fillRect(cardX, cardY, cardW, cardH);
  ctx.shadowBlur = 0;

  // Top header red stripe
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(cardX, cardY, cardW, 24);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('GOVERNMENT OF INDIA / भारत सरकार', cardX + 16, cardY + 16);

  // Photo box
  const photoX = cardX + 24;
  const photoY = cardY + 44;
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(photoX, photoY, 100, 120);
  ctx.strokeStyle = '#94a3b8';
  ctx.strokeRect(photoX, photoY, 100, 120);

  ctx.fillStyle = '#64748b';
  ctx.font = '10px sans-serif';
  ctx.fillText('PHOTO', photoX + 30, photoY + 65);

  // Text details
  const textX = photoX + 120;
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('Sunil R. Deshmukh', textX, cardY + 60);

  ctx.font = '12px sans-serif';
  ctx.fillStyle = '#334155';
  ctx.fillText('DOB: 15/06/1990', textX, cardY + 82);
  ctx.fillText('Gender: MALE / पुरुष', textX, cardY + 102);

  ctx.fillStyle = '#475569';
  ctx.font = '11px sans-serif';
  ctx.fillText('Address: Plot No 88, Green Park Society, Aundh,', textX, cardY + 126);
  ctx.fillText('Pune, Maharashtra - 411007', textX, cardY + 142);

  // Bottom Aadhaar Number Bar
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 20px monospace';
  ctx.fillText('5412 8901 3422', cardX + cardW / 2 - 90, cardY + cardH - 30);

  // Red line below Aadhaar
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(cardX + 20, cardY + cardH - 18, cardW - 40, 4);
}
