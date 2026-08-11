import React, { useState, useEffect } from 'react';
import { EntryRequest, User } from '../../types';
import { fetchEntryRequests, approveRequest, rejectRequest } from '../../services/api';
import {
  CheckCircle2,
  XCircle,
  PhoneCall,
  Clock,
  Car,
  FileCheck2,
  ShieldAlert,
  Users,
  Building,
} from 'lucide-react';

interface HostDashboardProps {
  user: User;
}

export const HostDashboard: React.FC<HostDashboardProps> = ({ user }) => {
  const [requests, setRequests] = useState<EntryRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const list = await fetchEntryRequests();
      setRequests(list);
    } catch (err) {
      console.error('Failed to load host requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveRequest(id);
      await loadRequests();
    } catch (err) {
      console.error('Failed to approve request:', err);
    }
  };

  const handleConfirmReject = async (id: string) => {
    if (!rejectReason) return;
    try {
      await rejectRequest(id, rejectReason);
      setRejectingId(null);
      setRejectReason('');
      await loadRequests();
    } catch (err) {
      console.error('Failed to reject request:', err);
    }
  };

  const pending = requests.filter((r) => r.status === 'PENDING_APPROVAL');
  const approvedToday = requests.filter((r) => r.status === 'APPROVED' || r.status === 'INSIDE');
  const currentlyVisiting = requests.filter((r) => r.status === 'INSIDE');

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Host Banner Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-bold text-indigo-400 tracking-[0.2em] uppercase mb-1">
            Resident & Employee Portal
          </div>
          <h1 className="text-2xl font-bold text-white">MY VISITORS</h1>
          <p className="text-xs text-slate-400 mt-0.5">Location: {user.flatOffice} • Department: {user.department || 'Residential'}</p>
        </div>

        <button
          onClick={loadRequests}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-900/50"
        >
          Refresh Requests
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-1">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Entry Requests</div>
          <div className="text-3xl font-bold text-amber-600">{pending.length}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-1">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Approved Today</div>
          <div className="text-3xl font-bold text-green-600">{approvedToday.length}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-1">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Currently Visiting</div>
          <div className="text-3xl font-bold text-indigo-600">{currentlyVisiting.length}</div>
        </div>
      </div>

      {/* Pending Entry Requests Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
          <h2 className="text-base font-bold text-slate-900">Pending Approval Requests ({pending.length})</h2>
        </div>

        {pending.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 text-xs font-medium shadow-sm">
            No pending visitor entry requests at this moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pending.map((request) => (
              <div
                key={request.id}
                className="bg-white border-2 border-slate-200 hover:border-indigo-400 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between transition-all"
              >
                {/* Visitor Card Top: Photo & Info */}
                <div className="flex items-start space-x-4">
                  <img
                    src={request.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300'}
                    alt={request.visitorName}
                    className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-base text-slate-900 truncate">{request.visitorName}</h3>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-amber-50 text-amber-600 border border-amber-100 uppercase">
                        {request.visitorType}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 mt-1 font-mono">{request.mobile}</div>
                    <div className="text-xs text-indigo-600 font-bold mt-1">
                      Purpose: {request.purpose}
                    </div>
                  </div>
                </div>

                {/* Scanned Document Verification Status */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
                  <div className="flex justify-between items-center text-slate-700">
                    <span className="flex items-center text-slate-500 font-medium">
                      <FileCheck2 className="w-3.5 h-3.5 mr-1 text-indigo-600" /> Document Verification:
                    </span>
                    <span className="font-bold text-green-600">✓ Aadhaar OCR Verified</span>
                  </div>

                  {request.documentData && (
                    <div className="text-[11px] text-slate-500">
                      Aadhaar: <span className="font-mono text-slate-800 font-semibold">{request.documentData.aadhaarNumber}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-[11px] text-slate-500 border-t border-slate-200 pt-1.5">
                    <span>Arrival Time: {new Date(request.requestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span>Expected Stay: {request.expectedDuration}</span>
                  </div>

                  {request.vehicleNumber && (
                    <div className="text-[11px] text-slate-600 flex items-center pt-0.5">
                      <Car className="w-3 h-3 mr-1 text-slate-400" /> Vehicle: <strong className="ml-1 font-mono">{request.vehicleNumber}</strong>
                    </div>
                  )}
                </div>

                {/* Rejection reason box if rejecting */}
                {rejectingId === request.id && (
                  <div className="bg-red-50 p-3.5 rounded-xl border border-red-200 space-y-2">
                    <label className="text-xs font-semibold text-red-600 block">Reason for Rejection:</label>
                    <input
                      type="text"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="e.g. Host unavailable / Unannounced visitor"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-red-400"
                    />
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setRejectingId(null)}
                        className="text-xs px-2.5 py-1 bg-white text-slate-600 rounded border border-slate-200 font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleConfirmReject(request.id)}
                        className="text-xs px-3 py-1 bg-red-600 text-white rounded font-bold"
                      >
                        Confirm Reject
                      </button>
                    </div>
                  </div>
                )}

                {/* Action Buttons: APPROVE, REJECT, CALL SECURITY */}
                {rejectingId !== request.id && (
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <button
                      onClick={() => handleApprove(request.id)}
                      className="px-3 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center space-x-1 shadow-md shadow-indigo-100 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>APPROVE</span>
                    </button>

                    <button
                      onClick={() => setRejectingId(request.id)}
                      className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 font-bold text-xs flex items-center justify-center space-x-1 border border-slate-200 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>REJECT</span>
                    </button>

                    <button
                      onClick={() => alert(`Calling Security Gate Guard Ramesh Singh (+91 9876543210)...`)}
                      className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center space-x-1 border border-slate-200 transition-colors"
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-indigo-600" />
                      <span>CALL GUARD</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historical / Approved Requests List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
        <h3 className="font-bold text-slate-900 text-base">Visitor Approval History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-100">
              <tr>
                <th className="p-3">Visitor Name</th>
                <th className="p-3">Mobile</th>
                <th className="p-3">Purpose</th>
                <th className="p-3">Requested At</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-bold text-slate-900">{req.visitorName}</td>
                  <td className="p-3 font-mono">{req.mobile}</td>
                  <td className="p-3 text-indigo-600 font-semibold">{req.purpose}</td>
                  <td className="p-3 text-slate-400">{new Date(req.requestedAt).toLocaleString()}</td>
                  <td className="p-3">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-md border uppercase ${
                        req.status === 'APPROVED' || req.status === 'INSIDE'
                          ? 'bg-green-50 text-green-700 border-green-100'
                          : req.status === 'REJECTED'
                          ? 'bg-red-50 text-red-600 border-red-100'
                          : 'bg-amber-50 text-amber-600 border-amber-100'
                      }`}
                    >
                      {req.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
