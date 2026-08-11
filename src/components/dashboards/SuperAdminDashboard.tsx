import React from 'react';
import { User } from '../../types';
import { Building2, ShieldCheck, Users, Server, Globe } from 'lucide-react';

interface SuperAdminDashboardProps {
  user: User;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ user }) => {
  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Super Admin Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex items-center justify-between">
        <div>
          <div className="text-[10px] font-bold text-indigo-400 tracking-[0.2em] uppercase mb-1">
            Global Enterprise Controller
          </div>
          <h1 className="text-2xl font-bold text-white">SUPER ADMIN CONSOLE</h1>
          <p className="text-xs text-slate-400 mt-0.5">PraveshKavach Multi-Tenant Infrastructure Manager</p>
        </div>

        <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          GLOBAL SUPERUSER
        </span>
      </div>

      {/* Multi-Tenant Premises Card List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            name: 'Green Park Housing Society',
            type: 'Gated Residential Society',
            gates: 4,
            activeVisitors: 11,
            status: 'HEALTHY',
          },
          {
            name: 'TechHub Enterprise Campus A',
            type: 'Corporate IT Office Campus',
            gates: 8,
            activeVisitors: 45,
            status: 'HEALTHY',
          },
          {
            name: 'St. Jude University Campus',
            type: 'Educational Institution',
            gates: 6,
            activeVisitors: 82,
            status: 'HEALTHY',
          },
        ].map((tenant, idx) => (
          <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm hover:border-indigo-300 transition-all">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold border border-indigo-100">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold bg-green-50 text-green-700 px-2.5 py-1 rounded-md border border-green-100 uppercase">
                {tenant.status}
              </span>
            </div>

            <div>
              <h3 className="font-bold text-base text-slate-900">{tenant.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{tenant.type}</p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Security Gates:</span>
                <strong className="text-slate-900">{tenant.gates} Active Terminals</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Currently Inside:</span>
                <strong className="text-indigo-600">{tenant.activeVisitors} Visitors</strong>
              </div>
            </div>

            <button className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-100 transition-all">
              MANAGE TENANT
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
