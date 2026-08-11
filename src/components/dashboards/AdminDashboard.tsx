import React, { useState, useEffect } from 'react';
import {
  fetchDashboardStats,
  fetchVisitorHistory,
  fetchBlacklist,
  addBlacklistEntry,
  removeBlacklistEntry,
  fetchAuditLogs,
  fetchSettings,
  saveSettings,
} from '../../services/api';
import { AdminSettings, AuditLog, BlacklistItem, EntryRequest, User } from '../../types';
import {
  ShieldAlert,
  Users,
  CheckCircle2,
  Clock,
  Ban,
  FileText,
  Settings,
  Download,
  Search,
  Plus,
  Trash2,
  Sliders,
  AlertTriangle,
  FileSpreadsheet,
} from 'lucide-react';

interface AdminDashboardProps {
  user: User;
  onOpenEmergency: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onOpenEmergency }) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'BLACKLIST' | 'HISTORY' | 'AUDIT' | 'SETTINGS'>('OVERVIEW');

  const [stats, setStats] = useState({
    todayTotal: 24,
    pending: 5,
    approved: 16,
    rejected: 3,
    currentlyInside: 11,
    exited: 10,
    overstayed: 1,
    blacklisted: 1,
  });

  const [history, setHistory] = useState<EntryRequest[]>([]);
  const [blacklist, setBlacklist] = useState<BlacklistItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [settings, setSettingsState] = useState<AdminSettings | null>(null);

  const [searchQuery, setSearchQuery] = useState('');

  // Blacklist modal form state
  const [showAddBlacklist, setShowAddBlacklist] = useState(false);
  const [blName, setBlName] = useState('');
  const [blMobile, setBlMobile] = useState('');
  const [blReason, setBlReason] = useState('');

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const loadAllAdminData = async () => {
    try {
      const s = await fetchDashboardStats();
      setStats(s);
      const h = await fetchVisitorHistory();
      setHistory(h);
      const b = await fetchBlacklist();
      setBlacklist(b);
      const logs = await fetchAuditLogs();
      setAuditLogs(logs);
      const setts = await fetchSettings();
      setSettingsState(setts);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    }
  };

  const handleAddBlacklist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blName || !blMobile) return;
    try {
      await addBlacklistEntry({ name: blName, mobile: blMobile, reason: blReason });
      setBlName('');
      setBlMobile('');
      setBlReason('');
      setShowAddBlacklist(false);
      const b = await fetchBlacklist();
      setBlacklist(b);
    } catch (err) {
      console.error('Failed to add blacklist entry:', err);
    }
  };

  const handleRemoveBlacklist = async (id: string) => {
    try {
      await removeBlacklistEntry(id);
      const b = await fetchBlacklist();
      setBlacklist(b);
    } catch (err) {
      console.error('Failed to remove blacklist entry:', err);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      const updated = await saveSettings(settings);
      setSettingsState(updated);
      alert('Admin security & required field settings saved successfully!');
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  };

  // CSV Export for visitor history
  const handleExportCsv = () => {
    const headers = ['ID', 'Visitor Name', 'Mobile', 'Type', 'Purpose', 'Host', 'Status', 'CheckIn', 'CheckOut'];
    const rows = history.map((h) => [
      h.id,
      `"${h.visitorName}"`,
      h.mobile,
      h.visitorType,
      `"${h.purpose}"`,
      `"${h.hostName}"`,
      h.status,
      h.checkInTime || '',
      h.checkOutTime || '',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `praveshkavach-visitor-report-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const overstayedList = history.filter((r) => r.status === 'INSIDE');

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Admin Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-bold text-indigo-400 tracking-[0.2em] uppercase mb-1">
            Administration & Security Control
          </div>
          <h1 className="text-2xl font-bold text-white">SYSTEM ADMIN DASHBOARD</h1>
          <p className="text-xs text-slate-400 mt-0.5">PraveshKavach Central Visitor Security Engine</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenEmergency}
            className="flex items-center space-x-1.5 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold shadow-md shadow-red-900/50"
          >
            <ShieldAlert className="w-4 h-4 animate-pulse" />
            <span>EMERGENCY MODE</span>
          </button>
        </div>
      </div>

      {/* Admin KPI Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1 shadow-sm">
          <div className="text-[10px] font-bold text-slate-500 uppercase">Total Visitors</div>
          <div className="text-2xl font-bold text-slate-900">{stats.todayTotal}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1 shadow-sm">
          <div className="text-[10px] font-bold text-amber-600 uppercase">Pending</div>
          <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1 shadow-sm">
          <div className="text-[10px] font-bold text-green-600 uppercase">Approved</div>
          <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1 shadow-sm">
          <div className="text-[10px] font-bold text-indigo-600 uppercase">Inside Now</div>
          <div className="text-2xl font-bold text-indigo-600">{stats.currentlyInside}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1 shadow-sm">
          <div className="text-[10px] font-bold text-red-600 uppercase">Rejected</div>
          <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1 shadow-sm">
          <div className="text-[10px] font-bold text-purple-600 uppercase">Overstayed</div>
          <div className="text-2xl font-bold text-purple-600">{stats.overstayed}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1 shadow-sm col-span-2 sm:col-span-1">
          <div className="text-[10px] font-bold text-red-600 uppercase">Blacklisted</div>
          <div className="text-2xl font-bold text-red-600">{stats.blacklisted}</div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'OVERVIEW', label: 'Overview & Overstays', icon: Users },
          { id: 'BLACKLIST', label: 'Security Blacklist', icon: Ban },
          { id: 'HISTORY', label: 'Visitor History & Reports', icon: FileSpreadsheet },
          { id: 'AUDIT', label: 'Audit Logs', icon: FileText },
          { id: 'SETTINGS', label: 'Admin & Required Fields', icon: Sliders },
        ].map((tab) => {
          const IconComp = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 font-bold'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <IconComp className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & OVERSTAYS */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* Overstayed Alert Section */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-purple-600 animate-bounce" />
                <h3 className="font-bold text-slate-900 text-base">Overstayed Visitors Alert ({overstayedList.length})</h3>
              </div>
              <span className="text-xs text-slate-400">Max allowed stay: 6 hours</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {overstayedList.map((v) => (
                <div key={v.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{v.visitorName}</h4>
                      <p className="text-xs text-slate-500">Host: {v.hostName} ({v.hostLocation})</p>
                    </div>
                    <span className="text-[10px] font-bold bg-purple-50 text-purple-700 px-2.5 py-1 rounded-md border border-purple-100 uppercase">
                      Overstay Warning
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 flex justify-between">
                    <span>Mobile: {v.mobile}</span>
                    <span>Entry: {v.checkInTime ? new Date(v.checkInTime).toLocaleTimeString() : '90 mins ago'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BLACKLIST MANAGEMENT */}
      {activeTab === 'BLACKLIST' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Security Blacklisted Individuals</h3>
              <p className="text-xs text-slate-500">Blacklisted individuals are automatically blocked from gate entry approval.</p>
            </div>

            <button
              onClick={() => setShowAddBlacklist(!showAddBlacklist)}
              className="flex items-center space-x-1 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold shadow-md shadow-red-100"
            >
              <Plus className="w-4 h-4" />
              <span>ADD TO BLACKLIST</span>
            </button>
          </div>

          {showAddBlacklist && (
            <form onSubmit={handleAddBlacklist} className="bg-red-50/50 p-4 rounded-xl border border-red-200 space-y-3">
              <h4 className="text-xs font-bold text-red-600 uppercase">New Security Blacklist Entry</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Individual Name *"
                  value={blName}
                  onChange={(e) => setBlName(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-red-400"
                />
                <input
                  type="text"
                  required
                  placeholder="Mobile Number *"
                  value={blMobile}
                  onChange={(e) => setBlMobile(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-red-400"
                />
                <input
                  type="text"
                  required
                  placeholder="Reason for Blacklisting *"
                  value={blReason}
                  onChange={(e) => setBlReason(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-red-400"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddBlacklist(false)}
                  className="text-xs px-3 py-1.5 bg-white text-slate-600 border border-slate-200 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button type="submit" className="text-xs px-4 py-1.5 bg-red-600 text-white font-bold rounded-lg shadow-sm">
                  Save Blacklist Entry
                </button>
              </div>
            </form>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-100">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Mobile</th>
                  <th className="p-3">Reason</th>
                  <th className="p-3">Added By</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {blacklist.filter((b) => b.active).map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-bold text-slate-900">{item.name}</td>
                    <td className="p-3 font-mono">{item.mobile}</td>
                    <td className="p-3 text-red-600 font-semibold">{item.reason}</td>
                    <td className="p-3 text-slate-500">{item.createdBy}</td>
                    <td className="p-3 text-slate-400">{item.createdAt}</td>
                    <td className="p-3">
                      <button
                        onClick={() => handleRemoveBlacklist(item.id)}
                        className="text-xs text-red-600 hover:text-red-800 font-semibold flex items-center space-x-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: VISITOR HISTORY & REPORTS */}
      {activeTab === 'HISTORY' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Visitor History & Gate Reports</h3>
              <p className="text-xs text-slate-500">Searchable history logs with CSV download support.</p>
            </div>

            <button
              onClick={handleExportCsv}
              className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-100"
            >
              <Download className="w-4 h-4" />
              <span>EXPORT TO CSV</span>
            </button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search history by name, mobile, host, or request ID..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-100">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Visitor Name</th>
                  <th className="p-3">Mobile</th>
                  <th className="p-3">Host</th>
                  <th className="p-3">Purpose</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Requested At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history
                  .filter(
                    (h) =>
                      h.visitorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      h.mobile.includes(searchQuery) ||
                      h.hostName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      h.id.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono text-slate-400">{row.id}</td>
                      <td className="p-3 font-bold text-slate-900">{row.visitorName}</td>
                      <td className="p-3 font-mono">{row.mobile}</td>
                      <td className="p-3 text-slate-700 font-medium">{row.hostName}</td>
                      <td className="p-3 text-indigo-600 font-semibold">{row.purpose}</td>
                      <td className="p-3">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-md border uppercase ${
                            row.status === 'APPROVED' || row.status === 'INSIDE'
                              ? 'bg-green-50 text-green-700 border-green-100'
                              : row.status === 'REJECTED'
                              ? 'bg-red-50 text-red-600 border-red-100'
                              : 'bg-amber-50 text-amber-600 border-amber-100'
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400">{new Date(row.requestedAt).toLocaleString()}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: SYSTEM AUDIT LOG */}
      {activeTab === 'AUDIT' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">
            System Security Audit Log
          </h3>

          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div key={log.id} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-start justify-between text-xs">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-slate-400 text-[11px]">{log.timestamp}</span>
                    <span className="font-bold text-indigo-600 uppercase text-[10px] bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      {log.action}
                    </span>
                    <span className="font-semibold text-slate-900">{log.userName} ({log.userRole})</span>
                  </div>
                  <p className="text-slate-600 font-medium">{log.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: ADMIN & CONFIGURABLE REQUIRED FIELDS */}
      {activeTab === 'SETTINGS' && settings && (
        <form onSubmit={handleSaveSettings} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-bold text-slate-900 text-base">Configurable Required Fields & Security Rules</h3>
            <p className="text-xs text-slate-500 mt-0.5">Define mandatory visitor details for gate entry approval.</p>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Required Form Fields for Entry:</h4>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { key: 'fullName', label: 'Visitor Full Name' },
                { key: 'mobile', label: 'Mobile Number' },
                { key: 'document', label: 'Identity Document Scan' },
                { key: 'address', label: 'Residential Address' },
                { key: 'purpose', label: 'Purpose of Visit' },
                { key: 'host', label: 'Host Selection' },
                { key: 'vehicleNumber', label: 'Vehicle Number' },
              ].map((item) => (
                <label key={item.key} className="flex items-center space-x-2 bg-slate-50 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={(settings.requiredFields as any)[item.key]}
                    onChange={(e) =>
                      setSettingsState({
                        ...settings,
                        requiredFields: {
                          ...settings.requiredFields,
                          [item.key]: e.target.checked,
                        },
                      })
                    }
                    className="accent-indigo-600 w-4 h-4 rounded"
                  />
                  <span className="text-xs font-semibold text-slate-700">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-100 transition-all"
            >
              SAVE SECURITY SETTINGS
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
