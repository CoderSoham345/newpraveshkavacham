import React, { useState } from 'react';
import { ExtractedDocumentData, QuadCorners, QualityValidationResult, VisitorType, EntryRequest } from '../../types';
import { CameraView } from '../scanner/CameraView';
import { DocumentEditor } from '../scanner/DocumentEditor';
import { QualityValidatorModal } from '../scanner/QualityValidatorModal';
import { OcrReviewScreen } from '../scanner/OcrReviewScreen';
import { validateDocumentQuality, getDefaultQuadCorners } from '../../services/imageProcessing';
import { processDocumentOcr, createEntryRequest } from '../../services/api';
import {
  User,
  Package,
  Wrench,
  Briefcase,
  GraduationCap,
  Users,
  Building,
  CheckCircle,
  Clock,
  Send,
  ArrowLeft,
  QrCode,
  ShieldCheck,
  AlertOctagon,
} from 'lucide-react';

interface NewVisitorWizardProps {
  onCancel: () => void;
  onRequestSubmitted: (newRequest: EntryRequest) => void;
}

export const NewVisitorWizard: React.FC<NewVisitorWizardProps> = ({
  onCancel,
  onRequestSubmitted,
}) => {
  const [step, setStep] = useState<
    'TYPE' | 'SCAN' | 'EDIT' | 'QUALITY' | 'OCR_REVIEW' | 'VISIT_DETAILS' | 'PENDING'
  >('TYPE');

  // Visitor Details State
  const [visitorType, setVisitorType] = useState<VisitorType>('Guest');
  const [sourceCanvas, setSourceCanvas] = useState<HTMLCanvasElement | null>(null);
  const [processedCanvas, setProcessedCanvas] = useState<HTMLCanvasElement | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string>('');
  const [quadCorners, setQuadCorners] = useState<QuadCorners>(getDefaultQuadCorners());

  const [qualityResult, setQualityResult] = useState<QualityValidationResult | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedDocumentData | null>(null);

  // Visit Form State
  const [visitorName, setVisitorName] = useState('');
  const [mobile, setMobile] = useState('');
  const [purpose, setPurpose] = useState('Personal Meeting');
  const [selectedHostId, setSelectedHostId] = useState('host-1');
  const [selectedHostName, setSelectedHostName] = useState('Rahul Sharma');
  const [flatOffice, setFlatOffice] = useState('Flat 402, Block A');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [numVisitors, setNumVisitors] = useState(1);
  const [expectedDuration, setExpectedDuration] = useState('2 hours');
  const [additionalNotes, setAdditionalNotes] = useState('');

  const [isLoadingOcr, setIsLoadingOcr] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdRequest, setCreatedRequest] = useState<EntryRequest | null>(null);

  const [blacklistAlert, setBlacklistAlert] = useState<string | null>(null);

  // Step 1: Select Visitor Type
  const handleSelectType = (type: VisitorType) => {
    setVisitorType(type);
    setStep('SCAN');
  };

  // Step 2: Camera Capture (Direct Document Scan with 4 Yellow Corners Crop + Direct OCR Extraction)
  const handleCapture = async (canvas: HTMLCanvasElement, _corners: QuadCorners) => {
    setSourceCanvas(canvas);
    setProcessedCanvas(canvas);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setProcessedImageUrl(dataUrl);

    // Direct transition to OCR review without barrier popups
    setStep('OCR_REVIEW');
    setIsLoadingOcr(true);

    try {
      const ocrRes = await processDocumentOcr(dataUrl, 'AADHAAR');
      setExtractedData(ocrRes.extractedData);
      if (ocrRes.extractedData.fullName) {
        setVisitorName(ocrRes.extractedData.fullName);
      }
    } catch (err) {
      console.error('OCR extraction error:', err);
    } finally {
      setIsLoadingOcr(false);
    }
  };

  const handleGallerySelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    img.onload = async () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      setSourceCanvas(canvas);
      setProcessedCanvas(canvas);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setProcessedImageUrl(dataUrl);

      setStep('OCR_REVIEW');
      setIsLoadingOcr(true);

      try {
        const ocrRes = await processDocumentOcr(dataUrl, 'AADHAAR');
        setExtractedData(ocrRes.extractedData);
        if (ocrRes.extractedData.fullName) {
          setVisitorName(ocrRes.extractedData.fullName);
        }
      } catch (err) {
        console.error('Gallery image OCR error:', err);
      } finally {
        setIsLoadingOcr(false);
      }
    };
    img.src = URL.createObjectURL(file);
  };

  // Step 3: Editor Confirm Document
  const handleConfirmDocument = async (editedCanvas: HTMLCanvasElement, corners: QuadCorners) => {
    setProcessedCanvas(editedCanvas);
    const dataUrl = editedCanvas.toDataURL('image/jpeg', 0.9);
    setProcessedImageUrl(dataUrl);

    // Run hard quality validation check
    const ctx = editedCanvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, editedCanvas.width, editedCanvas.height);
    const qCheck = validateDocumentQuality(imageData, corners);
    setQualityResult(qCheck);

    setStep('QUALITY');
  };

  // Step 4: Quality Gate Proceed
  const handleProceedFromQuality = async () => {
    setStep('OCR_REVIEW');
    setIsLoadingOcr(true);

    try {
      if (processedImageUrl) {
        const ocrRes = await processDocumentOcr(processedImageUrl, 'AADHAAR');
        setExtractedData(ocrRes.extractedData);
        if (ocrRes.extractedData.fullName) {
          setVisitorName(ocrRes.extractedData.fullName);
        }
      }
    } catch (err) {
      console.error('OCR process error:', err);
    } finally {
      setIsLoadingOcr(false);
    }
  };

  // Step 5: OCR Review Confirm
  const handleConfirmOcrDetails = (updatedData: ExtractedDocumentData) => {
    setExtractedData(updatedData);
    if (updatedData.fullName) {
      setVisitorName(updatedData.fullName);
    }
    setStep('VISIT_DETAILS');
  };

  // Step 6: Submit Entry Request
  const handleSubmitEntryRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setBlacklistAlert(null);

    try {
      const requestPayload: Partial<EntryRequest> = {
        visitorName,
        mobile,
        visitorType,
        purpose,
        hostId: selectedHostId,
        hostName: selectedHostName,
        hostLocation: flatOffice,
        vehicleNumber,
        numVisitors,
        expectedDuration,
        additionalNotes,
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
        documentImageUrl: processedImageUrl,
        documentData: extractedData || undefined,
        qualityCheck: qualityResult || undefined,
      };

      const result = await createEntryRequest(requestPayload);
      setCreatedRequest(result);
      setStep('PENDING');
      onRequestSubmitted(result);
    } catch (err: any) {
      console.error('Failed to submit entry request:', err);
      setBlacklistAlert(err.message || 'Failed to submit entry request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Wizard Step Indicator Bar */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center justify-between text-xs text-slate-400 shadow-sm">
        <button
          onClick={onCancel}
          className="flex items-center space-x-1 text-slate-300 hover:text-white font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Wizard</span>
        </button>

        <div className="flex items-center space-x-2 sm:space-x-4">
          <span className={`font-semibold ${step === 'TYPE' ? 'text-indigo-400' : 'text-slate-500'}`}>1. Type</span>
          <span className="text-slate-700">/</span>
          <span className={`font-semibold ${step === 'SCAN' ? 'text-indigo-400' : 'text-slate-500'}`}>2. Direct Scan</span>
          <span className="text-slate-700">/</span>
          <span className={`font-semibold ${step === 'OCR_REVIEW' ? 'text-indigo-400' : 'text-slate-500'}`}>3. AI Extract</span>
          <span className="text-slate-700">/</span>
          <span className={`font-semibold ${step === 'VISIT_DETAILS' || step === 'PENDING' ? 'text-indigo-400' : 'text-slate-500'}`}>4. Send Request</span>
        </div>
      </div>

      {/* STEP 1: VISITOR TYPE SELECTION */}
      {step === 'TYPE' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-slate-900">SELECT VISITOR CATEGORY</h2>
            <p className="text-xs text-slate-500 mt-1">
              Choose the visitor type to apply appropriate gate entry security protocols.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { type: 'Guest', label: 'Guest / Visitor', icon: Users, desc: 'Friends, Family & Guests' },
              { type: 'Delivery', label: 'Delivery Driver', icon: Package, desc: 'Amazon, Swiggy, Zomato, Courier' },
              { type: 'Service Provider', label: 'Service Provider', icon: Wrench, desc: 'Plumber, AC Repair, Electrician' },
              { type: 'Employee', label: 'Staff / Employee', icon: Briefcase, desc: 'Corporate Staff & Support' },
              { type: 'Contractor', label: 'Contractor / Work', icon: Building, desc: 'Construction & Civil Work' },
              { type: 'Interview Candidate', label: 'Interview Candidate', icon: GraduationCap, desc: 'Job Recruitment' },
            ].map((item) => {
              const IconComp = item.icon;
              return (
                <button
                  key={item.type}
                  onClick={() => handleSelectType(item.type as VisitorType)}
                  className="bg-slate-50 hover:bg-white border-2 border-slate-200 hover:border-indigo-400 rounded-2xl p-5 text-left transition-all group flex flex-col justify-between shadow-sm"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 group-hover:scale-110 transition-transform">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div className="mt-4">
                    <div className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {item.label}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{item.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 2: CAMERA DOCUMENT SCANNER */}
      {step === 'SCAN' && (
        <CameraView
          onCapture={handleCapture}
          onGallerySelect={handleGallerySelect}
          onCancel={() => setStep('TYPE')}
        />
      )}

      {/* STEP 3: DOCUMENT EDITOR & PIXEL FILTERS */}
      {step === 'EDIT' && sourceCanvas && (
        <DocumentEditor
          sourceCanvas={sourceCanvas}
          initialCorners={quadCorners}
          onConfirmDocument={handleConfirmDocument}
          onRetake={() => setStep('SCAN')}
        />
      )}

      {/* STEP 4: HARD QUALITY GATE VALIDATION MODAL */}
      {step === 'QUALITY' && qualityResult && (
        <QualityValidatorModal
          qualityResult={qualityResult}
          onProceedToOcr={handleProceedFromQuality}
          onRetake={() => setStep('SCAN')}
        />
      )}

      {/* STEP 5: OCR REVIEW & CONFIRMATION */}
      {step === 'OCR_REVIEW' && (
        <div>
          {isLoadingOcr ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin mx-auto" />
              <h3 className="font-bold text-slate-900 text-base">Reading Identity Document via AI OCR...</h3>
              <p className="text-xs text-slate-500">Extracting name, DOB, Aadhaar number, and multiline address...</p>
            </div>
          ) : (
            extractedData && (
              <OcrReviewScreen
                documentImageUrl={processedImageUrl}
                extractedData={extractedData}
                onConfirmDetails={handleConfirmOcrDetails}
                onRetake={() => setStep('SCAN')}
              />
            )
          )}
        </div>
      )}

      {/* STEP 6: VISIT DETAILS FORM */}
      {step === 'VISIT_DETAILS' && (
        <form onSubmit={handleSubmitEntryRequest} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-900">VISIT DETAILS & HOST SELECTION</h2>
            <p className="text-xs text-slate-500 mt-1">Complete visitor purpose and send approval notification to host.</p>
          </div>

          {blacklistAlert && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center space-x-3 text-xs font-bold">
              <AlertOctagon className="w-6 h-6 shrink-0 text-red-600 animate-bounce" />
              <span>{blacklistAlert}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-500 font-medium block mb-1">Visitor Full Name *</label>
              <input
                type="text"
                required
                value={visitorName}
                onChange={(e) => setVisitorName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-semibold focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-slate-500 font-medium block mb-1">Mobile Number *</label>
              <input
                type="tel"
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="+91 9876543210"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-mono focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-slate-500 font-medium block mb-1">Host / Resident to Visit *</label>
              <select
                value={selectedHostId}
                onChange={(e) => {
                  setSelectedHostId(e.target.value);
                  if (e.target.value === 'host-1') {
                    setSelectedHostName('Rahul Sharma');
                    setFlatOffice('Flat 402, Block A');
                  } else {
                    setSelectedHostName('Priya Mehta');
                    setFlatOffice('Suite 301, IT Wing');
                  }
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none"
              >
                <option value="host-1">Rahul Sharma (Flat 402, Block A)</option>
                <option value="host-2">Priya Mehta (Suite 301, IT Wing)</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-500 font-medium block mb-1">Purpose of Visit *</label>
              <input
                type="text"
                required
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-slate-500 font-medium block mb-1">Vehicle Number (Optional)</label>
              <input
                type="text"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                placeholder="MH 12 AB 1234"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-mono focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-slate-500 font-medium block mb-1">Expected Duration</label>
              <select
                value={expectedDuration}
                onChange={(e) => setExpectedDuration(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none"
              >
                <option value="30 mins">30 mins</option>
                <option value="1 hour">1 hour</option>
                <option value="2 hours">2 hours</option>
                <option value="4 hours">4 hours</option>
                <option value="Full Day">Full Day</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => setStep('OCR_REVIEW')}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
            >
              Back
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm flex items-center space-x-2 shadow-md shadow-indigo-100 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'SENDING REQUEST...' : 'SEND FOR APPROVAL'}</span>
            </button>
          </div>
        </form>
      )}

      {/* STEP 7: PENDING APPROVAL NOTIFICATION SCREEN */}
      {step === 'PENDING' && createdRequest && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-6 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center mx-auto animate-pulse">
            <Clock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">ENTRY REQUEST SUBMITTED</h2>
            <p className="text-sm text-amber-600 font-semibold">
              Status: {createdRequest.status}
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Approval notification sent to host <strong>{createdRequest.hostName}</strong> ({createdRequest.hostLocation}).
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 max-w-md mx-auto text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Request ID:</span>
              <strong className="text-slate-900 font-mono">{createdRequest.id}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Visitor:</span>
              <strong className="text-slate-900">{createdRequest.visitorName}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Purpose:</span>
              <strong className="text-slate-900">{createdRequest.purpose}</strong>
            </div>
          </div>

          <button
            onClick={onCancel}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-100"
          >
            RETURN TO GUARD DASHBOARD
          </button>
        </div>
      )}
    </div>
  );
};
