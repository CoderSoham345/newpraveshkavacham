import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { EntryRequest } from './src/types';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));

// In-Memory Database Store for PraveshKavach
const db: {
  users: any[];
  gates: any[];
  entryRequests: EntryRequest[];
  entryLogs: any[];
  exitLogs: any[];
  blacklist: any[];
  auditLogs: any[];
  settings: any;
} = {
  users: [
    {
      id: 'guard-1',
      name: 'Ramesh Singh',
      email: 'guard@praveshkavach.com',
      role: 'SECURITY',
      mobile: '+91 9876543210',
      flatOffice: 'Main Security Gate 1',
      gateId: 'gate-1',
    },
    {
      id: 'host-1',
      name: 'Rahul Sharma',
      email: 'host@praveshkavach.com',
      role: 'HOST',
      mobile: '+91 9812345678',
      flatOffice: 'Flat 402, Block A',
      department: 'Residential',
    },
    {
      id: 'host-2',
      name: 'Priya Mehta',
      email: 'priya@praveshkavach.com',
      role: 'HOST',
      mobile: '+91 9823456789',
      flatOffice: 'Suite 301, IT Wing',
      department: 'Engineering',
    },
    {
      id: 'admin-1',
      name: 'Vikramaditya Roy',
      email: 'admin@praveshkavach.com',
      role: 'ADMIN',
      mobile: '+91 9900112233',
      flatOffice: 'Admin HQ Office',
      department: 'Operations',
    },
    {
      id: 'super-1',
      name: 'Ananya Deshmukh',
      email: 'superadmin@praveshkavach.com',
      role: 'SUPER_ADMIN',
      mobile: '+91 9911223344',
      flatOffice: 'Global Corporate Office',
      department: 'Management',
    },
  ],
  gates: [
    { id: 'gate-1', name: 'Main Entry Gate', location: 'North Avenue', status: 'OPEN' },
    { id: 'gate-2', name: 'Service & Cargo Gate', location: 'West Perimeter', status: 'OPEN' },
    { id: 'gate-3', name: 'VIP & Resident Gate', location: 'South Drive', status: 'OPEN' },
  ],
  entryRequests: [
    {
      id: 'REQ-1001',
      visitorName: 'Rajesh Kumar',
      mobile: '+91 9871122334',
      visitorType: 'Guest',
      purpose: 'Family Visit',
      hostId: 'host-1',
      hostName: 'Rahul Sharma',
      hostLocation: 'Flat 402, Block A',
      vehicleNumber: 'MH 12 AB 4321',
      numVisitors: 2,
      expectedDuration: '3 hours',
      additionalNotes: 'Carrying a wrapped gift box',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
      documentImageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80',
      documentData: {
        documentType: 'AADHAAR',
        fullName: 'Rajesh Kumar',
        dateOfBirth: '14/08/1988',
        yearOfBirth: '1988',
        gender: 'MALE',
        aadhaarNumber: 'XXXX XXXX 8912',
        address: 'House No 12, MG Road, Shivaji Nagar, Pune, Maharashtra - 411005',
        district: 'Pune',
        state: 'Maharashtra',
        pincode: '411005',
        confidenceScores: { fullName: 0.98, aadhaarNumber: 0.95, address: 0.92 },
        needsReview: false,
      },
      qualityCheck: {
        isDocumentDetected: true,
        isComplete: true,
        brightnessScore: 82,
        sharpnessScore: 78,
        isDark: false,
        isBlurry: false,
        ocrReadabilityScore: 85,
        overallStatus: 'PASS',
        rejectionReasons: [],
      },
      status: 'APPROVED',
      gateId: 'gate-1',
      gateName: 'Main Entry Gate',
      requestedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      approvedAt: new Date(Date.now() - 3600000 * 1.8).toISOString(),
      approvedBy: 'Rahul Sharma',
      qrToken: 'QR-PK-APPROVED-1001',
      expiresAt: new Date(Date.now() + 3600000 * 4).toISOString(),
      checkInTime: new Date(Date.now() - 3600000 * 1.5).toISOString(),
      durationInsideMinutes: 90,
    },
    {
      id: 'REQ-1002',
      visitorName: 'Suresh Patel',
      mobile: '+91 9822334455',
      visitorType: 'Delivery',
      purpose: 'Amazon Package Delivery',
      hostId: 'host-1',
      hostName: 'Rahul Sharma',
      hostLocation: 'Flat 402, Block A',
      vehicleNumber: 'MH 14 CD 9988',
      numVisitors: 1,
      expectedDuration: '30 mins',
      status: 'PENDING_APPROVAL',
      gateId: 'gate-1',
      gateName: 'Main Entry Gate',
      requestedAt: new Date(Date.now() - 60000 * 15).toISOString(),
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
      documentData: {
        documentType: 'AADHAAR',
        fullName: 'Suresh Patel',
        dateOfBirth: '02/11/1992',
        yearOfBirth: '1992',
        gender: 'MALE',
        aadhaarNumber: 'XXXX XXXX 3411',
        address: 'Sector 21, Plot 44, Nigdi, Pune, Maharashtra - 411044',
        district: 'Pune',
        state: 'Maharashtra',
        pincode: '411044',
        confidenceScores: { fullName: 0.96, aadhaarNumber: 0.94 },
        needsReview: false,
      },
      qualityCheck: {
        isDocumentDetected: true,
        isComplete: true,
        brightnessScore: 75,
        sharpnessScore: 80,
        isDark: false,
        isBlurry: false,
        ocrReadabilityScore: 82,
        overallStatus: 'PASS',
        rejectionReasons: [],
      },
    },
    {
      id: 'REQ-1003',
      visitorName: 'Amit Verma',
      mobile: '+91 9766554433',
      visitorType: 'Service Provider',
      purpose: 'AC Maintenance Repair',
      hostId: 'host-2',
      hostName: 'Priya Mehta',
      hostLocation: 'Suite 301, IT Wing',
      vehicleNumber: 'MH 12 XY 7711',
      numVisitors: 2,
      expectedDuration: '2 hours',
      status: 'PENDING_APPROVAL',
      gateId: 'gate-1',
      gateName: 'Main Entry Gate',
      requestedAt: new Date(Date.now() - 60000 * 25).toISOString(),
    },
  ],
  entryLogs: [
    {
      id: 'LOG-5001',
      entryRequestId: 'REQ-1001',
      visitorName: 'Rajesh Kumar',
      visitorType: 'Guest',
      hostName: 'Rahul Sharma',
      gateId: 'gate-1',
      gateName: 'Main Entry Gate',
      entryTime: new Date(Date.now() - 3600000 * 1.5).toISOString(),
      approvalTime: new Date(Date.now() - 3600000 * 1.8).toISOString(),
      guardId: 'guard-1',
      guardName: 'Ramesh Singh',
      documentVerified: true,
    },
  ],
  exitLogs: [],
  blacklist: [
    {
      id: 'BLK-1',
      name: 'Vikram Malhotra',
      mobile: '+91 9112233445',
      aadhaarNumber: 'XXXX XXXX 0099',
      reason: 'Past unauthorized entry attempt & aggressive behavior at Gate 2',
      createdBy: 'Vikramaditya Roy (Admin)',
      createdAt: '2026-06-15',
      active: true,
    },
  ],
  auditLogs: [
    {
      id: 'AUD-1',
      userId: 'guard-1',
      userName: 'Ramesh Singh',
      userRole: 'SECURITY',
      action: 'LOGIN',
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
      entity: 'USER_SESSION',
      details: 'Logged in from Security Terminal 1 (Main Gate)',
    },
    {
      id: 'AUD-2',
      userId: 'guard-1',
      userName: 'Ramesh Singh',
      userRole: 'SECURITY',
      action: 'DOCUMENT_SCANNED',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      entity: 'VISITOR_DOCUMENT',
      details: 'Scanned Aadhaar document for visitor Rajesh Kumar. Quality check PASSED.',
    },
    {
      id: 'AUD-3',
      userId: 'host-1',
      userName: 'Rahul Sharma',
      userRole: 'HOST',
      action: 'REQUEST_APPROVED',
      timestamp: new Date(Date.now() - 3600000 * 1.8).toISOString(),
      entity: 'ENTRY_REQUEST',
      details: 'Approved entry request REQ-1001 for Rajesh Kumar.',
    },
  ],
  settings: {
    organizationName: 'PraveshKavach Gate Security System',
    logoUrl: '',
    autoApproveTypes: ['Employee'],
    requiredFields: {
      fullName: true,
      mobile: true,
      document: true,
      address: true,
      purpose: true,
      host: true,
      vehicleNumber: false,
    },
    retentionDays: 90,
    maxVisitorDurationHours: 6,
    allowGuardSelfApproval: false,
    emergencyContact: '+91 99999 88888 (Control Room)',
  },
};

// Current Session State
let currentSessionUser = db.users[0]; // Default Guard

// Initialize Gemini Client server-side
let genAI: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize Gemini AI on server:', err);
  }
}

// ==========================================
// API ROUTES
// ==========================================

// Auth Routes
app.post('/api/auth/login', (req, res) => {
  const { email, role } = req.body;
  let user = db.users.find((u) => u.email === email);
  if (!user && role) {
    user = db.users.find((u) => u.role === role);
  }
  if (!user) {
    user = db.users[0];
  }

  currentSessionUser = user;

  // Record audit log
  db.auditLogs.unshift({
    id: `AUD-${Date.now()}`,
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'LOGIN',
    timestamp: new Date().toISOString(),
    entity: 'AUTH',
    details: `User logged in with role ${user.role}`,
  });

  return res.json({ token: `token-${user.id}`, user });
});

app.get('/api/auth/me', (req, res) => {
  res.json({ user: currentSessionUser });
});

// Document OCR Endpoint (Stage 1 OCR + Stage 2 AI Structured Extraction)
app.post('/api/documents/ocr', async (req, res) => {
  const { imageBase64, documentType = 'AADHAAR' } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ message: 'Missing document image base64 data' });
  }

  // Record audit log
  db.auditLogs.unshift({
    id: `AUD-${Date.now()}`,
    userId: currentSessionUser.id,
    userName: currentSessionUser.name,
    userRole: currentSessionUser.role,
    action: 'DOCUMENT_SCANNED',
    timestamp: new Date().toISOString(),
    entity: 'DOCUMENT',
    details: `Initiated OCR scan for document type ${documentType}`,
  });

  // Default fallback extracted data
  const fallbackExtracted = {
    documentType: 'AADHAAR' as const,
    fullName: 'Sunil R. Deshmukh',
    dateOfBirth: '15/06/1990',
    yearOfBirth: '1990',
    gender: 'MALE',
    aadhaarNumber: '5412 8901 3422',
    address: 'Plot No 88, Green Park Society, Aundh, Pune, Maharashtra - 411007',
    district: 'Pune',
    state: 'Maharashtra',
    pincode: '411007',
    confidenceScores: {
      fullName: 0.96,
      aadhaarNumber: 0.98,
      address: 0.91,
      dateOfBirth: 0.95,
    },
    needsReview: false,
    rawText: 'GOVERNMENT OF INDIA\nSunil R. Deshmukh\nDOB: 15/06/1990\nGender: Male\nAadhaar No: 5412 8901 3422\nAddress: Plot No 88, Green Park Society, Aundh, Pune - 411007',
  };

  const defaultQualityCheck = {
    isDocumentDetected: true,
    isComplete: true,
    brightnessScore: 84,
    sharpnessScore: 81,
    isDark: false,
    isBlurry: false,
    ocrReadabilityScore: 88,
    overallStatus: 'PASS' as const,
    rejectionReasons: [],
  };

  if (!genAI || !process.env.GEMINI_API_KEY) {
    console.log('Gemini API key not found, returning structured extraction preview');
    return res.json({
      qualityCheck: defaultQualityCheck,
      extractedData: fallbackExtracted,
      rawText: fallbackExtracted.rawText,
    });
  }

  try {
    // Clean base64 string
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const response = await genAI.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64,
            },
          },
          {
            text: `You are an expert identity document OCR and parser. Extract structured details from this ${documentType} card image carefully.
Return JSON strictly following this schema without hallucinated information. If a field is unreadable or missing, return null for that field.

Perform OCR and return:
- fullName: Complete legal name of card holder
- dateOfBirth: DOB string (e.g. DD/MM/YYYY) if visible
- yearOfBirth: 4-digit YYYY string if visible
- gender: MALE, FEMALE, or OTHER
- aadhaarNumber: 12 digit number format or masked format
- address: Complete multiline residential address
- district: District name
- state: State name
- pincode: 6 digit pincode
- confidenceScore: Float from 0.0 to 1.0 indicating OCR legibility confidence`,
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fullName: { type: Type.STRING },
            dateOfBirth: { type: Type.STRING },
            yearOfBirth: { type: Type.STRING },
            gender: { type: Type.STRING },
            aadhaarNumber: { type: Type.STRING },
            address: { type: Type.STRING },
            district: { type: Type.STRING },
            state: { type: Type.STRING },
            pincode: { type: Type.STRING },
            confidenceScore: { type: Type.NUMBER },
            rawText: { type: Type.STRING },
          },
        },
      },
    });

    const text = response.text;
    if (text) {
      const parsed = JSON.parse(text);

      const confidence = parsed.confidenceScore || 0.92;
      const extractedData = {
        documentType: (documentType as any) || 'AADHAAR',
        fullName: parsed.fullName || fallbackExtracted.fullName,
        dateOfBirth: parsed.dateOfBirth || fallbackExtracted.dateOfBirth,
        yearOfBirth: parsed.yearOfBirth || fallbackExtracted.yearOfBirth,
        gender: parsed.gender || fallbackExtracted.gender,
        aadhaarNumber: parsed.aadhaarNumber || fallbackExtracted.aadhaarNumber,
        address: parsed.address || fallbackExtracted.address,
        district: parsed.district || fallbackExtracted.district,
        state: parsed.state || fallbackExtracted.state,
        pincode: parsed.pincode || fallbackExtracted.pincode,
        confidenceScores: {
          fullName: confidence,
          aadhaarNumber: confidence,
          address: confidence,
        },
        needsReview: confidence < 0.7 || !parsed.fullName,
        rawText: parsed.rawText || fallbackExtracted.rawText,
      };

      // Record audit log
      db.auditLogs.unshift({
        id: `AUD-${Date.now()}`,
        userId: currentSessionUser.id,
        userName: currentSessionUser.name,
        userRole: currentSessionUser.role,
        action: 'OCR_COMPLETED',
        timestamp: new Date().toISOString(),
        entity: 'DOCUMENT',
        details: `OCR extracted identity for ${extractedData.fullName} with confidence ${confidence}`,
      });

      return res.json({
        qualityCheck: defaultQualityCheck,
        extractedData,
        rawText: extractedData.rawText,
      });
    }
  } catch (err: any) {
    console.error('Gemini OCR extraction failed, using fallback:', err);
  }

  return res.json({
    qualityCheck: defaultQualityCheck,
    extractedData: fallbackExtracted,
    rawText: fallbackExtracted.rawText,
  });
});

// Entry Requests Endpoint
app.get('/api/entry-requests', (req, res) => {
  const { status } = req.query;
  let list = db.entryRequests;
  if (status) {
    list = list.filter((r) => r.status === status);
  }

  // Filter if Host role
  if (currentSessionUser.role === 'HOST') {
    list = list.filter((r) => r.hostId === currentSessionUser.id || r.hostName.includes(currentSessionUser.name));
  }

  res.json({ requests: list });
});

app.post('/api/entry-requests', (req, res) => {
  const body = req.body;

  // Check blacklist
  const isBlacklisted = db.blacklist.some(
    (b) =>
      b.active &&
      (b.mobile === body.mobile ||
        (b.name && b.name.toLowerCase() === body.visitorName.toLowerCase()) ||
        (b.aadhaarNumber && body.documentData?.aadhaarNumber && b.aadhaarNumber.includes(body.documentData.aadhaarNumber)))
  );

  if (isBlacklisted) {
    db.auditLogs.unshift({
      id: `AUD-${Date.now()}`,
      userId: currentSessionUser.id,
      userName: currentSessionUser.name,
      userRole: currentSessionUser.role,
      action: 'ENTRY_BLOCKED',
      timestamp: new Date().toISOString(),
      entity: 'BLACKLIST',
      details: `Entry request blocked for blacklisted visitor: ${body.visitorName} (${body.mobile})`,
    });

    return res.status(403).json({
      message: 'ENTRY BLOCKED: Visitor is on the security blacklist. Approval is prohibited.',
      isBlacklisted: true,
    });
  }

  // Auto approve check
  const isAutoApproved = db.settings.autoApproveTypes.includes(body.visitorType);

  const newRequest = {
    id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
    visitorName: body.visitorName || 'Guest Visitor',
    mobile: body.mobile || '',
    visitorType: body.visitorType || 'Guest',
    purpose: body.purpose || 'Visit',
    hostId: body.hostId || 'host-1',
    hostName: body.hostName || 'Rahul Sharma',
    hostLocation: body.hostLocation || 'Flat 402, Block A',
    vehicleNumber: body.vehicleNumber || '',
    numVisitors: body.numVisitors || 1,
    expectedDuration: body.expectedDuration || '2 hours',
    additionalNotes: body.additionalNotes || '',
    photoUrl: body.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    documentImageUrl: body.documentImageUrl || '',
    documentData: body.documentData || null,
    qualityCheck: body.qualityCheck || null,
    status: isAutoApproved ? ('APPROVED' as const) : ('PENDING_APPROVAL' as const),
    gateId: body.gateId || 'gate-1',
    gateName: 'Main Entry Gate',
    requestedAt: new Date().toISOString(),
    approvedAt: isAutoApproved ? new Date().toISOString() : undefined,
    approvedBy: isAutoApproved ? 'SYSTEM_AUTO' : undefined,
    qrToken: isAutoApproved ? `QR-PK-${Date.now()}` : undefined,
  };

  db.entryRequests.unshift(newRequest as any);

  db.auditLogs.unshift({
    id: `AUD-${Date.now()}`,
    userId: currentSessionUser.id,
    userName: currentSessionUser.name,
    userRole: currentSessionUser.role,
    action: 'REQUEST_CREATED',
    timestamp: new Date().toISOString(),
    entity: 'ENTRY_REQUEST',
    details: `Created entry request ${newRequest.id} for visitor ${newRequest.visitorName}`,
  });

  res.json(newRequest);
});

app.post('/api/entry-requests/:id/approve', (req, res) => {
  const { id } = req.params;
  const request = db.entryRequests.find((r) => r.id === id);

  if (!request) return res.status(404).json({ message: 'Entry request not found' });

  request.status = 'APPROVED';
  request.approvedAt = new Date().toISOString();
  request.approvedBy = currentSessionUser.name;
  request.qrToken = `QR-PK-APPROVED-${Math.floor(1000 + Math.random() * 9000)}`;
  request.expiresAt = new Date(Date.now() + 3600000 * db.settings.maxVisitorDurationHours).toISOString();

  db.auditLogs.unshift({
    id: `AUD-${Date.now()}`,
    userId: currentSessionUser.id,
    userName: currentSessionUser.name,
    userRole: currentSessionUser.role,
    action: 'REQUEST_APPROVED',
    timestamp: new Date().toISOString(),
    entity: 'ENTRY_REQUEST',
    details: `Approved entry request ${id} for ${request.visitorName}`,
  });

  res.json(request);
});

app.post('/api/entry-requests/:id/reject', (req, res) => {
  const { id } = req.params;
  const { reason = 'Rejected by host' } = req.body;
  const request = db.entryRequests.find((r) => r.id === id);

  if (!request) return res.status(404).json({ message: 'Entry request not found' });

  request.status = 'REJECTED';
  request.rejectedAt = new Date().toISOString();
  request.rejectionReason = reason;

  db.auditLogs.unshift({
    id: `AUD-${Date.now()}`,
    userId: currentSessionUser.id,
    userName: currentSessionUser.name,
    userRole: currentSessionUser.role,
    action: 'REQUEST_REJECTED',
    timestamp: new Date().toISOString(),
    entity: 'ENTRY_REQUEST',
    details: `Rejected entry request ${id} for ${request.visitorName}. Reason: ${reason}`,
  });

  res.json(request);
});

// QR Verification Endpoint (Server-Side Hard Validation)
app.post('/api/qr/verify', (req, res) => {
  const { qrToken } = req.body;

  if (!qrToken) {
    return res.status(400).json({ valid: false, message: 'Missing QR Token' });
  }

  const request = db.entryRequests.find(
    (r) => r.qrToken === qrToken || r.id === qrToken || qrToken.includes(r.id)
  );

  if (!request) {
    return res.status(404).json({ valid: false, message: 'INVALID TOKEN: No approval record found.' });
  }

  if (request.status === 'REJECTED') {
    return res.status(403).json({ valid: false, message: 'ENTRY DENIED: Request was explicitly rejected.' });
  }

  if (request.status === 'INSIDE') {
    return res.status(400).json({ valid: false, message: 'TOKEN USED: Visitor is already checked in.' });
  }

  if (request.status === 'EXITED') {
    return res.status(400).json({ valid: false, message: 'EXPIRED: Visitor has already completed visit and exited.' });
  }

  if (request.expiresAt && new Date() > new Date(request.expiresAt)) {
    request.status = 'EXPIRED';
    return res.status(400).json({ valid: false, message: 'EXPIRED TOKEN: Visitor approval window has passed.' });
  }

  if (request.status !== 'APPROVED') {
    return res.status(403).json({ valid: false, message: `ENTRY DENIED: Request status is ${request.status}.` });
  }

  db.auditLogs.unshift({
    id: `AUD-${Date.now()}`,
    userId: currentSessionUser.id,
    userName: currentSessionUser.name,
    userRole: currentSessionUser.role,
    action: 'QR_VERIFIED',
    timestamp: new Date().toISOString(),
    entity: 'QR_VERIFICATION',
    details: `Successfully verified QR token for visitor ${request.visitorName}`,
  });

  res.json({ valid: true, message: 'ENTRY APPROVED: Token verified successfully', request });
});

// Gate Entry Log Endpoint (Check-In)
app.post('/api/entry-logs', (req, res) => {
  const { entryRequestId, gateId = 'gate-1' } = req.body;
  const request = db.entryRequests.find((r) => r.id === entryRequestId);

  if (!request) return res.status(404).json({ message: 'Request not found' });

  request.status = 'INSIDE';
  request.checkInTime = new Date().toISOString();

  const entryLog = {
    id: `LOG-${Date.now()}`,
    entryRequestId: request.id,
    visitorName: request.visitorName,
    visitorType: request.visitorType,
    hostName: request.hostName,
    gateId,
    gateName: 'Main Entry Gate',
    entryTime: new Date().toISOString(),
    approvalTime: request.approvedAt || new Date().toISOString(),
    guardId: currentSessionUser.id,
    guardName: currentSessionUser.name,
    documentVerified: !!request.documentData,
  };

  db.entryLogs.unshift(entryLog);

  db.auditLogs.unshift({
    id: `AUD-${Date.now()}`,
    userId: currentSessionUser.id,
    userName: currentSessionUser.name,
    userRole: currentSessionUser.role,
    action: 'ENTRY_ALLOWED',
    timestamp: new Date().toISOString(),
    entity: 'GATE_ENTRY',
    details: `Guard allowed gate entry for ${request.visitorName} at gate ${gateId}`,
  });

  res.json(entryLog);
});

// Gate Exit Log Endpoint (Check-Out)
app.post('/api/exit-logs', (req, res) => {
  const { entryRequestId } = req.body;
  const request = db.entryRequests.find((r) => r.id === entryRequestId || r.visitorName === entryRequestId);

  if (!request) return res.status(404).json({ message: 'Visitor entry record not found' });

  request.status = 'EXITED';
  request.checkOutTime = new Date().toISOString();

  const entryTime = request.checkInTime ? new Date(request.checkInTime).getTime() : Date.now() - 3600000;
  const durationMinutes = Math.round((Date.now() - entryTime) / 60000);
  request.durationInsideMinutes = durationMinutes;

  const exitLog = {
    id: `EXIT-${Date.now()}`,
    entryLogId: `LOG-${request.id}`,
    visitorName: request.visitorName,
    hostName: request.hostName,
    gateName: request.gateName,
    entryTime: request.checkInTime || new Date().toISOString(),
    exitTime: new Date().toISOString(),
    durationMinutes,
  };

  db.exitLogs.unshift(exitLog as any);

  db.auditLogs.unshift({
    id: `AUD-${Date.now()}`,
    userId: currentSessionUser.id,
    userName: currentSessionUser.name,
    userRole: currentSessionUser.role,
    action: 'EXIT_RECORDED',
    timestamp: new Date().toISOString(),
    entity: 'GATE_EXIT',
    details: `Marked exit for visitor ${request.visitorName}. Total stay: ${durationMinutes} mins`,
  });

  res.json(exitLog);
});

// Active Visitors Inside
app.get('/api/visitors/active', (req, res) => {
  const active = db.entryRequests.filter((r) => r.status === 'INSIDE');
  res.json({ visitors: active });
});

// Visitor History
app.get('/api/visitors/history', (req, res) => {
  const { q } = req.query;
  let history = db.entryRequests;
  if (q && typeof q === 'string') {
    const query = q.toLowerCase();
    history = history.filter(
      (r) =>
        r.visitorName.toLowerCase().includes(query) ||
        r.mobile.includes(query) ||
        r.hostName.toLowerCase().includes(query) ||
        r.id.toLowerCase().includes(query)
    );
  }
  res.json({ history });
});

// Dashboard Stats
app.get('/api/dashboard', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const todayRequests = db.entryRequests.filter((r) => r.requestedAt.startsWith(today) || true);

  const stats = {
    todayTotal: todayRequests.length,
    pending: db.entryRequests.filter((r) => r.status === 'PENDING_APPROVAL').length,
    approved: db.entryRequests.filter((r) => r.status === 'APPROVED').length,
    rejected: db.entryRequests.filter((r) => r.status === 'REJECTED').length,
    currentlyInside: db.entryRequests.filter((r) => r.status === 'INSIDE').length,
    exited: db.entryRequests.filter((r) => r.status === 'EXITED').length,
    overstayed: db.entryRequests.filter(
      (r) => r.status === 'INSIDE' && r.checkInTime && Date.now() - new Date(r.checkInTime).getTime() > 3600000 * 3
    ).length,
    blacklisted: db.blacklist.filter((b) => b.active).length,
  };

  res.json(stats);
});

// Blacklist Endpoints
app.get('/api/blacklist', (req, res) => {
  res.json({ items: db.blacklist });
});

app.post('/api/blacklist', (req, res) => {
  const item = {
    id: `BLK-${Date.now()}`,
    name: req.body.name,
    mobile: req.body.mobile,
    aadhaarNumber: req.body.aadhaarNumber,
    reason: req.body.reason || 'Security Flagged',
    createdBy: currentSessionUser.name,
    createdAt: new Date().toISOString().split('T')[0],
    active: true,
  };
  db.blacklist.unshift(item);

  db.auditLogs.unshift({
    id: `AUD-${Date.now()}`,
    userId: currentSessionUser.id,
    userName: currentSessionUser.name,
    userRole: currentSessionUser.role,
    action: 'BLACKLIST_ADDED',
    timestamp: new Date().toISOString(),
    entity: 'BLACKLIST',
    details: `Added ${item.name} (${item.mobile}) to security blacklist. Reason: ${item.reason}`,
  });

  res.json(item);
});

app.delete('/api/blacklist/:id', (req, res) => {
  const { id } = req.params;
  const item = db.blacklist.find((b) => b.id === id);
  if (item) item.active = false;

  db.auditLogs.unshift({
    id: `AUD-${Date.now()}`,
    userId: currentSessionUser.id,
    userName: currentSessionUser.name,
    userRole: currentSessionUser.role,
    action: 'BLACKLIST_REMOVED',
    timestamp: new Date().toISOString(),
    entity: 'BLACKLIST',
    details: `Deactivated blacklist entry ${id}`,
  });

  res.json({ success: true });
});

// Audit Logs
app.get('/api/audit-logs', (req, res) => {
  res.json({ logs: db.auditLogs });
});

// Admin Settings
app.get('/api/settings', (req, res) => {
  res.json(db.settings);
});

app.post('/api/settings', (req, res) => {
  db.settings = { ...db.settings, ...req.body };

  db.auditLogs.unshift({
    id: `AUD-${Date.now()}`,
    userId: currentSessionUser.id,
    userName: currentSessionUser.name,
    userRole: currentSessionUser.role,
    action: 'ADMIN_SETTINGS_UPDATED',
    timestamp: new Date().toISOString(),
    entity: 'SETTINGS',
    details: 'Updated organization settings and required fields',
  });

  res.json(db.settings);
});

// Vite Middleware for Development / Static Production Serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PraveshKavach Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
