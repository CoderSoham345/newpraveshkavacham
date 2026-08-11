import React, { useState, useEffect } from 'react';
import { fetchActiveVisitors } from '../services/api';
import { EntryRequest } from '../types';
import { ShieldAlert, Download, Printer, X, AlertTriangle } from 'lucide-react';

interface EmergencyModalProps {
  onClose: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ onClose }) => {
  const [activeList, setActiveList] = useState<EntryRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadActive();
  }, []);

  const loadActive = async () => {
    setIsLoading(true);
    try {
      const list = await fetchActiveVisitors();
      setActiveList(list);
    } catch (err) {
      console.error('Failed to load emergency active visitors:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCsv = () => {
    const headers = ['Visitor Name', 'Mobile', 'Host Name', 'Flat / Location', 'Check-In Time'];
    const rows = activeList.map((v) => [
      `"${v.visitorName}"`,
      v.mobile,
      `"${v.hostName}"`,
      `"${v.hostLocation}"`,
      v.checkInTime || '',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `EMERGENCY-EVACUATION-VISITORS-${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border-2 border-red-500 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in duration-200">
        {/* Red Emergency Header */}
        <div className="flex justify-between items-start border-b border-red-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 animate-pulse shadow-md shadow-red-200">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">EMERGENCY EVACUATION MODE</h2>
              <p className="text-xs text-red-600 font-bold mt-0.5">
                ACTIVE VISITORS CURRENTLY INSIDE PREMISES: {activeList.length} INDIVIDUALS
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Emergency List */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-h-72 overflow-y-auto space-y-3">
          {isLoading ? (
            <div className="text-center text-xs text-slate-500 py-6">Loading evacuation manifest...</div>
          ) : activeList.length === 0 ? (
            <div className="text-center text-xs text-green-700 py-6 font-bold">
              ✓ All visitors have exited. Premises clear.
            </div>
          ) : (
            activeList.map((v) => (
              <div key={v.id} className="bg-white border border-red-200 p-3.5 rounded-xl flex items-center justify-between text-xs shadow-sm">
                <div>
                  <div className="font-bold text-slate-900 text-sm">{v.visitorName}</div>
                  <div className="text-slate-500">
                    Host: <strong className="text-slate-800">{v.hostName}</strong> ({v.hostLocation})
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-red-700 font-bold">{v.mobile}</div>
                  <div className="text-[10px] text-slate-400">In since: {v.checkInTime ? new Date(v.checkInTime).toLocaleTimeString() : 'Recent'}</div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Action Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 border-t border-slate-100 pt-4">
          <button
            onClick={handleExportCsv}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md shadow-red-100"
          >
            <Download className="w-4 h-4" />
            <span>EXPORT EVACUATION MANIFEST (CSV)</span>
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
          >
            Close Emergency View
          </button>
        </div>
      </div>
    </div>
  );
};
