import {
  AdminSettings,
  AuditLog,
  BlacklistItem,
  EntryLog,
  EntryRequest,
  ExitLog,
  ExtractedDocumentData,
  QualityValidationResult,
  User,
  VisitorType,
} from '../types';

/**
 * Backend API Client Service for PraveshKavach
 * Handles calls to express server endpoints.
 */

const API_BASE = '/api';

export async function loginUser(email: string, role?: string): Promise<{ token: string; user: User }> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, role }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Login failed' }));
    throw new Error(err.message || 'Login failed');
  }

  return res.json();
}

export async function fetchCurrentSession(): Promise<User | null> {
  try {
    const res = await fetch(`${API_BASE}/auth/me`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.user;
  } catch (e) {
    console.error('Failed to fetch user session:', e);
    return null;
  }
}

export interface OcrResponse {
  qualityCheck: QualityValidationResult;
  extractedData: ExtractedDocumentData;
  rawText?: string;
  processedImageUrl?: string;
}

export async function processDocumentOcr(
  imageBase64: string,
  documentType = 'AADHAAR'
): Promise<OcrResponse> {
  const res = await fetch(`${API_BASE}/documents/ocr`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, documentType }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'OCR process failed' }));
    throw new Error(err.message || 'OCR process failed');
  }

  return res.json();
}

export async function createEntryRequest(payload: Partial<EntryRequest>): Promise<EntryRequest> {
  const res = await fetch(`${API_BASE}/entry-requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Failed to create entry request' }));
    throw new Error(err.message || 'Failed to create entry request');
  }

  return res.json();
}

export async function fetchEntryRequests(status?: string): Promise<EntryRequest[]> {
  const url = status ? `${API_BASE}/entry-requests?status=${status}` : `${API_BASE}/entry-requests`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch entry requests');
  const data = await res.json();
  return data.requests;
}

export async function approveRequest(id: string, notes?: string): Promise<EntryRequest> {
  const res = await fetch(`${API_BASE}/entry-requests/${id}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notes }),
  });

  if (!res.ok) throw new Error('Failed to approve entry request');
  return res.json();
}

export async function rejectRequest(id: string, reason: string): Promise<EntryRequest> {
  const res = await fetch(`${API_BASE}/entry-requests/${id}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason }),
  });

  if (!res.ok) throw new Error('Failed to reject entry request');
  return res.json();
}

export interface QrVerifyResponse {
  valid: boolean;
  message: string;
  request?: EntryRequest;
}

export async function verifyQrToken(qrToken: string): Promise<QrVerifyResponse> {
  const res = await fetch(`${API_BASE}/qr/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ qrToken }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'QR verification failed' }));
    return { valid: false, message: err.message || 'Invalid or expired entry token' };
  }

  return res.json();
}

export async function recordGateEntry(entryRequestId: string, gateId = 'gate-1'): Promise<EntryLog> {
  const res = await fetch(`${API_BASE}/entry-logs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ entryRequestId, gateId }),
  });

  if (!res.ok) throw new Error('Failed to record gate entry');
  return res.json();
}

export async function recordGateExit(entryRequestId: string): Promise<ExitLog> {
  const res = await fetch(`${API_BASE}/exit-logs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ entryRequestId }),
  });

  if (!res.ok) throw new Error('Failed to record gate exit');
  return res.json();
}

export async function fetchActiveVisitors(): Promise<EntryRequest[]> {
  const res = await fetch(`${API_BASE}/visitors/active`);
  if (!res.ok) throw new Error('Failed to fetch active visitors');
  const data = await res.json();
  return data.visitors;
}

export async function fetchVisitorHistory(query?: string): Promise<EntryRequest[]> {
  const url = query ? `${API_BASE}/visitors/history?q=${encodeURIComponent(query)}` : `${API_BASE}/visitors/history`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch visitor history');
  const data = await res.json();
  return data.history;
}

export async function fetchDashboardStats() {
  const res = await fetch(`${API_BASE}/dashboard`);
  if (!res.ok) throw new Error('Failed to fetch dashboard stats');
  return res.json();
}

export async function fetchBlacklist(): Promise<BlacklistItem[]> {
  const res = await fetch(`${API_BASE}/blacklist`);
  if (!res.ok) throw new Error('Failed to fetch blacklist');
  const data = await res.json();
  return data.items;
}

export async function addBlacklistEntry(item: Partial<BlacklistItem>): Promise<BlacklistItem> {
  const res = await fetch(`${API_BASE}/blacklist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });

  if (!res.ok) throw new Error('Failed to add to blacklist');
  return res.json();
}

export async function removeBlacklistEntry(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/blacklist/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to remove from blacklist');
}

export async function fetchAuditLogs(): Promise<AuditLog[]> {
  const res = await fetch(`${API_BASE}/audit-logs`);
  if (!res.ok) throw new Error('Failed to fetch audit logs');
  const data = await res.json();
  return data.logs;
}

export async function fetchSettings(): Promise<AdminSettings> {
  const res = await fetch(`${API_BASE}/settings`);
  if (!res.ok) throw new Error('Failed to fetch settings');
  return res.json();
}

export async function saveSettings(settings: Partial<AdminSettings>): Promise<AdminSettings> {
  const res = await fetch(`${API_BASE}/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });

  if (!res.ok) throw new Error('Failed to save settings');
  return res.json();
}
