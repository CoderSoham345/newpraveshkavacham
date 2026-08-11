import React from 'react';
import { QualityValidationResult } from '../../types';
import { ShieldAlert, CheckCircle2, AlertTriangle, RefreshCw, ArrowRight } from 'lucide-react';

interface QualityValidatorModalProps {
  qualityResult: QualityValidationResult;
  onProceedToOcr: () => void;
  onRetake: () => void;
}

export const QualityValidatorModal: React.FC<QualityValidatorModalProps> = ({
  qualityResult,
  onProceedToOcr,
  onRetake,
}) => {
  const isFailed = qualityResult.overallStatus === 'FAIL';

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
        {/* Header Icon & Title */}
        <div className="flex items-start space-x-3">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              isFailed ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}
          >
            {isFailed ? <ShieldAlert className="w-7 h-7 animate-bounce" /> : <CheckCircle2 className="w-7 h-7" />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {isFailed ? 'QUALITY VALIDATION FAILED' : 'QUALITY CHECK PASSED'}
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              {isFailed
                ? 'Identity document does not meet security readability standards.'
                : 'Document image is crisp, well-lit, and ready for automated OCR identity extraction.'}
            </p>
          </div>
        </div>

        {/* Quality Score Breakdown */}
        <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-3">
          <div className="flex justify-between items-center text-xs border-b border-slate-800/80 pb-2">
            <span className="text-slate-400 font-medium">Document Detection & Boundary</span>
            <span
              className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                qualityResult.isComplete
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-red-500/20 text-red-400'
              }`}
            >
              {qualityResult.isComplete ? 'COMPLETE' : 'INCOMPLETE / CUT OFF'}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs border-b border-slate-800/80 pb-2">
            <span className="text-slate-400 font-medium">Lighting & Brightness</span>
            <span
              className={`font-bold ${
                qualityResult.isDark ? 'text-red-400' : 'text-emerald-400'
              }`}
            >
              {qualityResult.brightnessScore}% {qualityResult.isDark ? '(TOO DARK)' : '(Good Lighting)'}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs border-b border-slate-800/80 pb-2">
            <span className="text-slate-400 font-medium">Document Sharpness</span>
            <span
              className={`font-bold ${
                qualityResult.isBlurry ? 'text-red-400' : 'text-emerald-400'
              }`}
            >
              {qualityResult.sharpnessScore}% {qualityResult.isBlurry ? '(BLURRY)' : '(Sharp Text)'}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs pt-1">
            <span className="text-slate-300 font-bold">OCR Readability Rating</span>
            <span className="font-bold text-sm text-emerald-400">{qualityResult.ocrReadabilityScore}/100</span>
          </div>
        </div>

        {/* Explicit Failure Messages Alert Box */}
        {isFailed && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 space-y-2">
            <div className="flex items-center space-x-2 text-red-400 text-xs font-bold uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4" />
              <span>Hard Security Gate Rejection:</span>
            </div>
            <ul className="text-xs text-red-300 space-y-1 pl-5 list-disc font-medium">
              {qualityResult.rejectionReasons.map((reason, idx) => (
                <li key={idx}>{reason}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onRetake}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center space-x-2 transition-all ${
              isFailed
                ? 'bg-red-600 hover:bg-red-500 text-white w-full justify-center shadow-lg shadow-red-950/50'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            <span>RETAKE DOCUMENT SCAN</span>
          </button>

          {!isFailed && (
            <button
              type="button"
              onClick={onProceedToOcr}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center space-x-2 shadow-lg shadow-emerald-950/40 transition-all"
            >
              <span>PROCEED TO OCR</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
