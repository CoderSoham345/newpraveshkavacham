export type UserRole = 'SECURITY' | 'HOST' | 'ADMIN' | 'SUPER_ADMIN';

export type VisitorType =
  | 'Guest'
  | 'Delivery'
  | 'Service Provider'
  | 'Employee'
  | 'Contractor'
  | 'Vendor'
  | 'Interview Candidate'
  | 'Student'
  | 'Other';

export type EntryStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'INSIDE'
  | 'EXITED'
  | 'CANCELLED';

export type DocumentType =
  | 'AADHAAR'
  | 'PAN'
  | 'DRIVING_LICENSE'
  | 'PASSPORT'
  | 'VOTER_ID'
  | 'OTHER';

export type FilterType =
  | 'ORIGINAL'
  | 'AUTO'
  | 'ENHANCED'
  | 'DOCUMENT'
  | 'GRAYSCALE'
  | 'BLACK_WHITE';

export interface Point {
  x: number; // Percentage or pixel ratio 0 to 1
  y: number;
}

export interface QuadCorners {
  topLeft: Point;
  topRight: Point;
  bottomRight: Point;
  bottomLeft: Point;
}

export interface QualityValidationResult {
  isDocumentDetected: boolean;
  isComplete: boolean;
  brightnessScore: number; // 0-100
  sharpnessScore: number; // 0-100
  isDark: boolean;
  isBlurry: boolean;
  ocrReadabilityScore: number; // 0-100
  overallStatus: 'PASS' | 'FAIL';
  rejectionReasons: string[];
}

export interface ExtractedDocumentData {
  documentType: DocumentType;
  fullName: string | null;
  dateOfBirth: string | null;
  yearOfBirth: string | null;
  gender: string | null;
  aadhaarNumber: string | null;
  address: string | null;
  district: string | null;
  state: string | null;
  pincode: string | null;
  confidenceScores: Record<string, number>;
  needsReview: boolean;
  rawText?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  mobile: string;
  flatOffice: string;
  department?: string;
  gateId?: string;
  avatarUrl?: string;
}

export interface Gate {
  id: string;
  name: string;
  location: string;
  status: 'OPEN' | 'CLOSED' | 'RESTRICTED';
}

export interface EntryRequest {
  id: string;
  visitorName: string;
  mobile: string;
  visitorType: VisitorType;
  purpose: string;
  hostId: string;
  hostName: string;
  hostLocation: string;
  vehicleNumber?: string;
  numVisitors: number;
  expectedDuration: string; // e.g. "2 hours"
  additionalNotes?: string;
  photoUrl?: string;
  documentImageUrl?: string;
  documentData?: ExtractedDocumentData;
  qualityCheck?: QualityValidationResult;
  status: EntryStatus;
  gateId: string;
  gateName: string;
  requestedAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  approvedBy?: string;
  qrToken?: string;
  expiresAt?: string;
  checkInTime?: string;
  checkOutTime?: string;
  durationInsideMinutes?: number;
  isOverstayed?: boolean;
}

export interface EntryLog {
  id: string;
  entryRequestId: string;
  visitorName: string;
  visitorType: VisitorType;
  hostName: string;
  gateId: string;
  gateName: string;
  entryTime: string;
  approvalTime: string;
  guardId: string;
  guardName: string;
  documentVerified: boolean;
}

export interface ExitLog {
  id: string;
  entryLogId: string;
  visitorName: string;
  hostName: string;
  gateName: string;
  entryTime: string;
  exitTime: string;
  durationMinutes: number;
}

export interface BlacklistItem {
  id: string;
  name: string;
  mobile: string;
  aadhaarNumber?: string;
  reason: string;
  createdBy: string;
  createdAt: string;
  active: boolean;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  timestamp: string;
  entity: string;
  details: string;
}

export interface AdminSettings {
  organizationName: string;
  logoUrl?: string;
  autoApproveTypes: VisitorType[];
  requiredFields: {
    fullName: boolean;
    mobile: boolean;
    document: boolean;
    address: boolean;
    purpose: boolean;
    host: boolean;
    vehicleNumber: boolean;
  };
  retentionDays: number;
  maxVisitorDurationHours: number;
  allowGuardSelfApproval: boolean;
  emergencyContact: string;
}
