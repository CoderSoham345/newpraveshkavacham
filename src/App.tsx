import React, { useState } from 'react';
import { Navbar } from './components/layout/Navbar';
import { SecurityGuardDashboard } from './components/dashboards/SecurityGuardDashboard';
import { HostDashboard } from './components/dashboards/HostDashboard';
import { AdminDashboard } from './components/dashboards/AdminDashboard';
import { SuperAdminDashboard } from './components/dashboards/SuperAdminDashboard';
import { NewVisitorWizard } from './components/entry/NewVisitorWizard';
import { QrScannerModal } from './components/entry/QrScannerModal';
import { ExitVisitorModal } from './components/entry/ExitVisitorModal';
import { EmergencyModal } from './components/EmergencyModal';
import { User, UserRole } from './types';

export default function App() {
  // Current logged in user (swappable for quick testing)
  const [currentUser, setCurrentUser] = useState<User>({
    id: 'usr-guard-1',
    name: 'Rajesh Kumar',
    email: 'rajesh.guard@praveshkavach.in',
    role: 'SECURITY',
    mobile: '+91 9876543210',
    flatOffice: 'Main Gate Terminal 1',
    gateId: 'gate-1',
  });

  // Modal & View States
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);

  // Switch role for testing all perspectives
  const handleSwitchRole = (role: UserRole) => {
    if (role === 'SECURITY') {
      setCurrentUser({
        id: 'usr-guard-1',
        name: 'Rajesh Kumar',
        email: 'rajesh.guard@praveshkavach.in',
        role: 'SECURITY',
        mobile: '+91 9876543210',
        flatOffice: 'Main Gate Terminal 1',
        gateId: 'gate-1',
      });
    } else if (role === 'HOST') {
      setCurrentUser({
        id: 'usr-host-1',
        name: 'Rahul Sharma',
        email: 'rahul.sharma@acmecorp.com',
        role: 'HOST',
        mobile: '+91 9812345678',
        flatOffice: 'Flat 402, Block A',
        department: 'Engineering',
      });
    } else if (role === 'ADMIN') {
      setCurrentUser({
        id: 'usr-admin-1',
        name: 'Anita Desai',
        email: 'anita.admin@praveshkavach.in',
        role: 'ADMIN',
        mobile: '+91 9988776655',
        flatOffice: 'Facility Control Office',
      });
    } else if (role === 'SUPER_ADMIN') {
      setCurrentUser({
        id: 'usr-super-1',
        name: 'Vikram Malhotra',
        email: 'vikram.super@praveshkavach.in',
        role: 'SUPER_ADMIN',
        mobile: '+91 9000000001',
        flatOffice: 'Global HQ Command',
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        user={currentUser}
        onSwitchRole={handleSwitchRole}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
        onOpenSettings={() => {
          handleSwitchRole('ADMIN');
        }}
      />

      {/* Main App Canvas */}
      <main className="flex-1 pb-12">
        {/* If Visitor Wizard is active */}
        {isWizardOpen ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <NewVisitorWizard
              onCancel={() => setIsWizardOpen(false)}
              onCompleted={() => setIsWizardOpen(false)}
            />
          </div>
        ) : (
          <>
            {/* Role Specific Dashboards */}
            {currentUser.role === 'SECURITY' && (
              <SecurityGuardDashboard
                user={currentUser}
                onOpenNewVisitor={() => setIsWizardOpen(true)}
                onOpenQrScanner={() => setIsQrModalOpen(true)}
                onOpenExitModal={() => setIsExitModalOpen(true)}
              />
            )}

            {currentUser.role === 'HOST' && <HostDashboard user={currentUser} />}

            {currentUser.role === 'ADMIN' && (
              <AdminDashboard
                user={currentUser}
                onOpenEmergency={() => setIsEmergencyOpen(true)}
              />
            )}

            {currentUser.role === 'SUPER_ADMIN' && <SuperAdminDashboard user={currentUser} />}
          </>
        )}
      </main>

      {/* Modals */}
      {isQrModalOpen && <QrScannerModal onClose={() => setIsQrModalOpen(false)} />}
      {isExitModalOpen && <ExitVisitorModal onClose={() => setIsExitModalOpen(false)} />}
      {isEmergencyOpen && <EmergencyModal onClose={() => setIsEmergencyOpen(false)} />}
    </div>
  );
}
