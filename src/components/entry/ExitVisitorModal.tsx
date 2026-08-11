import React, { useState, useEffect } from 'react';
import { fetchActiveVisitors, recordGateExit } from '../../services/api';
import { EntryRequest } from '../../types';
import { LogOut, Search, Clock, CheckCircle, X } from 'lucide-react';

interface ExitVisitorModalProps {
  onClose: () => void;
  onExitRecorded: () => void;
}

export const ExitVisitorModal: React.FC<ExitVisitorModalProps> = ({ onClose, onExitRecorded }) => {
  const [activeVisitors, setActiveVisitors] = useState<EntryRequest[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadActive();
  }, []);

  const loadActive = async () => {
    setIsLoading(true);
    try {
      const list = await fetchActiveVisitors();
      setActiveVisitors(list);
    } catch (err) {
      console.error('Failed to load active visitors:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkExit = async (requestId: string) => {
    try {
      await recordGateExit(requestId);
      await loadActive();
      onExitRecorded();
    } catch (err) {
      console.error('Failed to record exit:', err);
    }
  };

  const filtered = activeVisitors.filter(
    (v) =>
      v.visitorName.toLowerCase().includes(search.toLowerCase()) ||
      v.mobile.includes(search) ||
      v.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 shadow-xl space-y-5 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <LogOut className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-base">MARK VISITOR EXIT</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search active visitor by name, mobile, or ID..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {/* Active Visitors List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {isLoading ? (
            <div className="text-center text-xs text-slate-500 py-8">Loading active visitors...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-xs text-slate-500 py-8">No active visitors found inside premises.</div>
          ) : (
            filtered.map((visitor) => (
              <div
                key={visitor.id}
                className="bg-slate-50 border border-slate-200 hover:border-indigo-200 rounded-xl p-4 flex items-center justify-between transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-slate-900">{visitor.visitorName}</span>
                    <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded font-bold border border-green-100">
                      INSIDE PREMISES
                    </span>
                  </div>
                  <div className="text-xs text-slate-600">
                    Host: <strong className="text-slate-900">{visitor.hostName}</strong> ({visitor.hostLocation})
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center space-x-3">
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1 text-slate-400" />
                      Entry: {visitor.checkInTime ? new Date(visitor.checkInTime).toLocaleTimeString() : 'Recent'}
                    </span>
                    <span>Mobile: {visitor.mobile}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleMarkExit(visitor.id)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs shadow-sm transition-colors"
                >
                  MARK EXIT
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
