import React, { useState } from 'react';
import { User, UserRole } from './types';
import { Navbar } from './components/layout/Navbar';
import { SecurityGuardDashboard } from './components/dashboards/SecurityGuardDashboard';
import { HostDashboard } from './components/dashboards/HostDashboard';
import { AdminDashboard } from './components/dashboards/AdminDashboard';
import { SuperAdminDashboard } from './components/dashboards/SuperAdminDashboard';
import { NewVisitorWizard } from './components/entry/NewVisitorWizard';
import { QrScannerModal } from './components/entry/QrScannerModal';
import { ExitVisitorModal } from './components/entry/ExitVisitorModal';
import { EmergencyModal } from './components/EmergencyModal';

export default function App() {
  // Current logged in demo user state
  const [currentUser, setCurrentUser] = useState<User>({
    id: 'user-guard-1',
    name: 'Ramesh Singh',
    role: 'SECURITY',
    mobile: '+91 9876543210',
    flatOffice: 'Main Gate 1',
  });

  // Modal Views state
  const [showWizard, setShowWizard] = useState(false);
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  // Switch role helper for quick testing
  const handleSwitchRole = (newRole: UserRole) => {
    if (newRole === 'SECURITY') {
      setCurrentUser({
        id: 'user-guard-1',
        name: 'Ramesh Singh',
        role: 'SECURITY',
        mobile: '+91 9876543210',
        flatOffice: 'Main Gate 1',
      });
    } else if (newRole === 'HOST') {
      setCurrentUser({
        id: 'user-host-1',
        name: 'Rahul Sharma',
        role: 'HOST',
        mobile: '+91 9811223344',
        flatOffice: 'Flat 402, Block A',
        department: 'Residential',
      });
    } else if (newRole === 'ADMIN') {
      setCurrentUser({
        id: 'user-admin-1',
        name: 'Anjali Verma',
        role: 'ADMIN',
        mobile: '+91 9988776655',
        flatOffice: 'Admin Block',
      });
    } else {
      setCurrentUser({
        id: 'user-super-1',
        name: 'Vikramaditya Rao',
        role: 'SUPER_ADMIN',
        mobile: '+91 9000011111',
        flatOffice: 'HQ Command',
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        user={currentUser}
        onSwitchRole={handleSwitchRole}
        onOpenEmergency={() => setShowEmergencyModal(true)}
        onOpenSettings={() => {
          handleSwitchRole('ADMIN');
        }}
      />

      {/* Main View Container */}
      <main className="flex-1 pb-12">
        {showWizard ? (
          <div className="py-6 px-4">
            <NewVisitorWizard
              onCancel={() => setShowWizard(false)}
              onRequestSubmitted={(req) => {
                console.log('Visitor request submitted:', req);
              }}
            />
          </div>
        ) : (
          <>
            {currentUser.role === 'SECURITY' && (
              <SecurityGuardDashboard
                user={currentUser}
                onOpenNewVisitor={() => setShowWizard(true)}
                onOpenQrScanner={() => setShowQrScanner(true)}
                onOpenExitModal={() => setShowExitModal(true)}
              />
            )}

            {currentUser.role === 'HOST' && <HostDashboard user={currentUser} />}

            {currentUser.role === 'ADMIN' && (
              <AdminDashboard
                user={currentUser}
                onOpenEmergency={() => setShowEmergencyModal(true)}
              />
            )}

            {currentUser.role === 'SUPER_ADMIN' && <SuperAdminDashboard user={currentUser} />}
          </>
        )}
      </main>

      {/* Security QR Scanner Modal */}
      {showQrScanner && (
        <QrScannerModal
          onClose={() => setShowQrScanner(false)}
          onEntryAllowed={() => setShowQrScanner(false)}
        />
      )}

      {/* Mark Exit Visitor Modal */}
      {showExitModal && (
        <ExitVisitorModal
          onClose={() => setShowExitModal(false)}
          onExitRecorded={() => setShowExitModal(false)}
        />
      )}

      {/* Emergency Evacuation Modal */}
      {showEmergencyModal && (
        <EmergencyModal onClose={() => setShowEmergencyModal(false)} />
      )}
    </div>
  );
}
