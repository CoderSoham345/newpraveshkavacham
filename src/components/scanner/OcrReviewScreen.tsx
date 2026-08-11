import React, { useState } from 'react';
import { ExtractedDocumentData } from '../../types';
import { CheckCircle2, AlertTriangle, Edit3, RefreshCw, ArrowRight, FileText } from 'lucide-react';

interface OcrReviewScreenProps {
  documentImageUrl: string;
  extractedData: ExtractedDocumentData;
  onConfirmDetails: (updatedData: ExtractedDocumentData) => void;
  onRetake: () => void;
}

export const OcrReviewScreen: React.FC<OcrReviewScreenProps> = ({
  documentImageUrl,
  extractedData,
  onConfirmDetails,
  onRetake,
}) => {
  const [formData, setFormData] = useState<ExtractedDocumentData>({ ...extractedData });
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (field: keyof ExtractedDocumentData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleConfirm = () => {
    onConfirmDetails(formData);
  };

  return (
    <div className="bg-slate-900 text-white rounded-2xl overflow-hidden border border-slate-800 shadow-2xl p-6 max-w-3xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-100">VISITOR IDENTITY VERIFICATION</h3>
            <p className="text-xs text-slate-400 font-medium">Review and verify automatically extracted Aadhaar details</p>
          </div>
        </div>

        {/* OCR Status Badge */}
        <div className="flex items-center space-x-2">
          {formData.needsReview ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Needs Review
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> ✓ OCR Complete
            </span>
          )}
        </div>
      </div>

      {/* Main Grid: Document Image Preview + Extracted Fields Form */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Document Thumbnail Column */}
        <div className="md:col-span-5 space-y-3">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Processed Identity Document:
          </label>
          <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-950 shadow-inner p-2">
            <img
              src={documentImageUrl}
              alt="Processed Aadhaar Card"
              className="w-full h-auto rounded-lg object-contain"
            />
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Document Type:</span>
              <strong className="text-slate-200">Aadhaar Card</strong>
            </div>
            <div className="flex justify-between">
              <span>OCR Confidence:</span>
              <strong className="text-emerald-400">
                {Math.round((formData.confidenceScores?.fullName || 0.94) * 100)}%
              </strong>
            </div>
          </div>
        </div>

        {/* Form Fields Column */}
        <div className="md:col-span-7 space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Extracted Identity Details:
            </label>
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center space-x-1"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Done Editing' : 'Edit Fields'}</span>
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">Full Name *</label>
              <input
                type="text"
                value={formData.fullName || ''}
                onChange={(e) => handleChange('fullName', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-medium focus:border-emerald-500 focus:outline-none"
                placeholder="Enter Visitor Full Name"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Aadhaar / ID Number</label>
                <input
                  type="text"
                  value={formData.aadhaarNumber || ''}
                  onChange={(e) => handleChange('aadhaarNumber', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
                  placeholder="XXXX XXXX XXXX"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Date of Birth / YOB</label>
                <input
                  type="text"
                  value={formData.dateOfBirth || formData.yearOfBirth || ''}
                  onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  placeholder="DD/MM/YYYY"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">Full Residential Address</label>
              <textarea
                rows={2}
                value={formData.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                placeholder="Full address extracted from document"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">District</label>
                <input
                  type="text"
                  value={formData.district || ''}
                  onChange={(e) => handleChange('district', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">State</label>
                <input
                  type="text"
                  value={formData.state || ''}
                  onChange={(e) => handleChange('state', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Pincode</label>
                <input
                  type="text"
                  value={formData.pincode || ''}
                  onChange={(e) => handleChange('pincode', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between border-t border-slate-800 pt-4">
        <button
          type="button"
          onClick={onRetake}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>RETAKE DOCUMENT</span>
        </button>

        <button
          type="button"
          onClick={handleConfirm}
          className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center space-x-2 shadow-lg shadow-emerald-950/40 transition-all"
        >
          <span>CONFIRM DETAILS & NEXT</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
