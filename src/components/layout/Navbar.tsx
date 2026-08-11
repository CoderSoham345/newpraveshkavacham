import React from 'react';
import { User, UserRole } from '../../types';
import { Shield, ShieldAlert, UserCheck, Settings, LogOut, DoorClosed as GateIcon, RefreshCw } from 'lucide-react';

interface NavbarProps {
  user: User;
  onSwitchRole: (role: UserRole) => void;
  onOpenEmergency: () => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onSwitchRole,
  onOpenEmergency,
  onOpenSettings,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Subtitle */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-900/50">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-xl tracking-tight text-white">PraveshKavach</span>
              <span className="hidden lg:inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/20 tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse mr-1.5" />
                GATE OPEN
              </span>
            </div>
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-medium hidden sm:block">
              Smart Entry System
            </p>
          </div>
        </div>

        {/* Right Section: Role Switcher & Actions */}
        <div className="flex items-center space-x-3">
          {/* Quick Demo Role Selector */}
          <div className="hidden md:flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/80">
            <span className="text-[11px] text-slate-400 px-2 font-medium flex items-center">
              <RefreshCw className="w-3 h-3 mr-1" /> Switch Role:
            </span>
            {(['SECURITY', 'HOST', 'ADMIN', 'SUPER_ADMIN'] as UserRole[]).map((r) => (
              <button
                key={r}
                onClick={() => onSwitchRole(r)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  user.role === r
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/50'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                {r === 'SECURITY'
                  ? 'Guard'
                  : r === 'HOST'
                  ? 'Host/Resident'
                  : r === 'ADMIN'
                  ? 'Admin'
                  : 'Super Admin'}
              </button>
            ))}
          </div>

          {/* Emergency Mode Button */}
          <button
            onClick={onOpenEmergency}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-semibold text-xs transition-colors"
            title="Emergency Mode - View Currently Inside Visitors"
          >
            <ShieldAlert className="w-4 h-4 text-red-400 animate-pulse" />
            <span className="hidden sm:inline">EMERGENCY</span>
          </button>

          {/* Settings button for Admin */}
          {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="System Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          )}

          {/* Active User Badge */}
          <div className="flex items-center space-x-3 pl-2 border-l border-slate-800">
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-indigo-400">
              {user.name.charAt(0)}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-semibold text-white leading-tight">{user.name}</div>
              <div className="text-[10px] text-indigo-400 font-medium">
                {user.role} • {user.flatOffice}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Role Switcher Sub-bar */}
      <div className="md:hidden bg-slate-950 px-4 py-2 border-t border-slate-800 flex items-center justify-between text-xs">
        <span className="text-slate-400 font-medium">Active Role:</span>
        <div className="flex space-x-1">
          {(['SECURITY', 'HOST', 'ADMIN', 'SUPER_ADMIN'] as UserRole[]).map((r) => (
            <button
              key={r}
              onClick={() => onSwitchRole(r)}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                user.role === r ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {r === 'SECURITY' ? 'Guard' : r === 'HOST' ? 'Host' : r === 'ADMIN' ? 'Admin' : 'Super'}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
