import React, { useState, useEffect } from 'react';
import { EntryRequest, User } from '../../types';
import { fetchDashboardStats, fetchEntryRequests } from '../../services/api';
import {
  UserPlus,
  QrCode,
  LogOut,
  Clock,
  CheckCircle2,
  XCircle,
  Users,
  ShieldCheck,
  FileCheck2,
  Sparkles,
  Search,
} from 'lucide-react';

interface SecurityGuardDashboardProps {
  user: User;
  onOpenNewVisitor: () => void;
  onOpenQrScanner: () => void;
  onOpenExitModal: () => void;
}

export const SecurityGuardDashboard: React.FC<SecurityGuardDashboardProps> = ({
  user,
  onOpenNewVisitor,
  onOpenQrScanner,
  onOpenExitModal,
}) => {
  const [stats, setStats] = useState({
    todayTotal: 24,
    pending: 5,
    approved: 16,
    rejected: 3,
    currentlyInside: 11,
  });

  const [recentRequests, setRecentRequests] = useState<EntryRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const s = await fetchDashboardStats();
      setStats(s);
      const reqs = await fetchEntryRequests();
      setRecentRequests(reqs.slice(0, 5));
    } catch (err) {
      console.error('Failed to load guard dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Guard Banner Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-bold text-indigo-400 tracking-[0.2em] uppercase mb-1">
            Gate Security Terminal
          </div>
          <h1 className="text-2xl font-bold text-white">Good Morning, {user.name}</h1>
          <p className="text-xs text-slate-400 mt-0.5">Assigned Location: Main Entry Gate 1 • Shift A Security</p>
        </div>

        <div className="bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-800 flex items-center space-x-3 self-start sm:self-auto">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Gate Status</div>
            <div className="text-xs font-bold text-green-400">OPEN & ACTIVE</div>
          </div>
        </div>
      </div>

      {/* Sleek KPI Stats Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Today's Total</p>
          <div className="flex items-end justify-between mt-2">
            <h2 className="text-3xl font-bold text-slate-900">{stats.todayTotal}</h2>
            <span className="text-green-600 text-xs font-bold bg-green-50 px-2 py-0.5 rounded-full border border-green-100">+12% ↑</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Pending Approval</p>
          <div className="flex items-end justify-between mt-2">
            <h2 className="text-3xl font-bold text-amber-600">{stats.pending.toString().padStart(2, '0')}</h2>
            <span className="text-slate-400 text-[10px] font-medium">Awaiting Host</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Approved Today</p>
          <div className="flex items-end justify-between mt-2">
            <h2 className="text-3xl font-bold text-emerald-600">{stats.approved}</h2>
            <span className="text-emerald-600 text-xs font-bold">Passed</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Inside Premises</p>
          <div className="flex items-end justify-between mt-2">
            <h2 className="text-3xl font-bold text-indigo-600">{stats.currentlyInside}</h2>
            <div className="flex -space-x-1.5">
              <div className="w-5 h-5 rounded-full bg-indigo-100 border border-white text-[9px] font-bold text-indigo-600 flex items-center justify-center">A</div>
              <div className="w-5 h-5 rounded-full bg-slate-200 border border-white text-[9px] font-bold text-slate-600 flex items-center justify-center">B</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 col-span-2 sm:col-span-1">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Rejected Today</p>
          <div className="flex items-end justify-between mt-2">
            <h2 className="text-3xl font-bold text-red-600">{stats.rejected.toString().padStart(2, '0')}</h2>
            <span className="text-red-500 text-xs font-bold">High Risk</span>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS GRID & VISITOR TABLE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Quick Actions Panel */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Quick Actions</h3>
          
          <button
            onClick={onOpenNewVisitor}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-6 rounded-2xl shadow-lg shadow-indigo-100 flex items-center justify-between transition-all active:scale-95 group text-left"
          >
            <div>
              <p className="font-bold text-lg">New Visitor</p>
              <p className="text-indigo-100 text-xs opacity-90">Start manual entry & OCR</p>
            </div>
            <UserPlus className="w-8 h-8 text-indigo-100 group-hover:scale-110 transition-transform" />
          </button>

          <button
            onClick={onOpenNewVisitor}
            className="w-full bg-white border-2 border-slate-200 hover:border-indigo-400 p-5 rounded-2xl flex items-center justify-between transition-all group text-left shadow-sm"
          >
            <div>
              <p className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition-colors">Scan Identity</p>
              <p className="text-slate-400 text-xs">Aadhaar / Passport / Driver ID</p>
            </div>
            <FileCheck2 className="w-7 h-7 text-slate-300 group-hover:text-indigo-500 transition-colors" />
          </button>

          <button
            onClick={onOpenQrScanner}
            className="w-full bg-white border-2 border-slate-200 hover:border-indigo-400 p-5 rounded-2xl flex items-center justify-between transition-all group text-left shadow-sm"
          >
            <div>
              <p className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition-colors">QR Token Scanner</p>
              <p className="text-slate-400 text-xs">Verify Host Approval Pass</p>
            </div>
            <QrCode className="w-7 h-7 text-slate-300 group-hover:text-indigo-500 transition-colors" />
          </button>

          <button
            onClick={onOpenExitModal}
            className="w-full bg-slate-100 border border-slate-200 hover:bg-slate-200/80 p-4 rounded-xl flex items-center justify-between text-slate-700 font-bold text-sm transition-colors text-left"
          >
            <div className="flex items-center space-x-3">
              <LogOut className="w-5 h-5 text-slate-500" />
              <span>Mark Visitor Exit</span>
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">11 Inside</span>
          </button>
        </div>

        {/* Active Approvals & Entries Table */}
        <div className="lg:col-span-8 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-base">Active Approvals & Entries</h3>
            <button onClick={loadData} className="text-indigo-600 text-xs font-bold hover:underline">
              Refresh Log
            </button>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Visitor Info</th>
                  <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Purpose / Host</th>
                  <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-xs border border-slate-200">
                          {req.visitorName.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-900 leading-tight">{req.visitorName}</p>
                          <p className="text-[11px] text-slate-400 font-medium">{req.mobile}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-700 font-semibold">{req.purpose}</p>
                      <p className="text-[11px] text-slate-400">Host: {req.hostName} ({req.hostLocation})</p>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-md border uppercase tracking-wide ${
                          req.status === 'APPROVED' || req.status === 'INSIDE'
                            ? 'bg-green-50 text-green-700 border-green-100'
                            : req.status === 'PENDING_APPROVAL'
                            ? 'bg-amber-50 text-amber-600 border-amber-100'
                            : 'bg-red-50 text-red-600 border-red-100'
                        }`}
                      >
                        {req.status === 'INSIDE' ? 'Checked In' : req.status === 'PENDING_APPROVAL' ? 'Pending' : req.status}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <button className="text-indigo-600 hover:text-indigo-800 text-xs font-bold">
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400 font-medium">Showing recent visitor logs for gate security</p>
          </div>
        </div>
      </div>
    </div>
  );
};
