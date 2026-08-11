import React, { useState } from 'react';
import { verifyQrToken, recordGateEntry } from '../../services/api';
import { QrCode, CheckCircle2, XCircle, ShieldCheck, ArrowRight, X } from 'lucide-react';
import { EntryRequest } from '../../types';

interface QrScannerModalProps {
  onClose: () => void;
  onEntryAllowed: () => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({ onClose, onEntryAllowed }) => {
  const [qrInput, setQrInput] = useState('QR-PK-APPROVED-1001');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    valid: boolean;
    message: string;
    request?: EntryRequest;
  } | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrInput.trim()) return;

    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const res = await verifyQrToken(qrInput.trim());
      setVerificationResult(res);
    } catch (err: any) {
      setVerificationResult({ valid: false, message: err.message || 'QR Verification failed' });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleAllowEntry = async () => {
    if (!verificationResult?.request) return;
    try {
      await recordGateEntry(verificationResult.request.id, 'gate-1');
      onEntryAllowed();
      onClose();
    } catch (err) {
      console.error('Failed to record entry:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <QrCode className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-base">SECURITY QR CODE VERIFICATION</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Input / Camera Scanner simulation */}
        <form onSubmit={handleVerify} className="space-y-3">
          <label className="text-xs text-slate-500 font-medium block">
            Scan Visitor Entry Approval Token / QR Code:
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={qrInput}
              onChange={(e) => setQrInput(e.target.value)}
              placeholder="e.g. QR-PK-APPROVED-1001"
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-900 font-mono focus:border-indigo-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isVerifying}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-100"
            >
              {isVerifying ? 'VERIFYING...' : 'VERIFY TOKEN'}
            </button>
          </div>
        </form>

        {/* Result Feedback Banner */}
        {verificationResult && (
          <div
            className={`p-4 rounded-xl border ${
              verificationResult.valid
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <div className="flex items-center space-x-2 font-bold text-sm mb-2">
              {verificationResult.valid ? (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              <span>{verificationResult.message}</span>
            </div>

            {verificationResult.valid && verificationResult.request && (
              <div className="mt-3 bg-white p-3 rounded-lg border border-green-100 text-xs text-slate-700 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Visitor:</span>
                  <strong className="text-slate-900">{verificationResult.request.visitorName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Host:</span>
                  <strong className="text-slate-900">{verificationResult.request.hostName} ({verificationResult.request.hostLocation})</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Approved At:</span>
                  <span>{new Date(verificationResult.request.approvedAt || Date.now()).toLocaleTimeString()}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
          >
            Cancel
          </button>

          {verificationResult?.valid && (
            <button
              type="button"
              onClick={handleAllowEntry}
              className="px-6 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs flex items-center space-x-1 shadow-md shadow-green-100"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>ALLOW ENTRY (LOG CHECK-IN)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
