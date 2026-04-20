import React, { useState } from 'react';
import { useRole } from '../hooks/useRole';
import { exportToHardwareVault } from '../lib/hardwareVault';
import { MOCK_PAYMENTS } from '../data/banquetySimulation';
import { AlertCircle, HardDrive, ShieldCheck } from 'lucide-react';

export default function Operations() {
  const { role, isDirector } = useRole();
  const [lastSyncDate, setLastSyncDate] = useState<Date>(new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)); // Mock: 10 days ago
  const [financialsPurged, setFinancialsPurged] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Compliance: Notify if > 7 days passed (implies we missed Sunday)
  const daysSinceSync = Math.floor((new Date().getTime() - lastSyncDate.getTime()) / (1000 * 3600 * 24));
  const requiresSync = daysSinceSync >= 7 && !financialsPurged;

  const handleVaultSync = async () => {
    setExporting(true);
    try {
      const activeData = financialsPurged ? [] : MOCK_PAYMENTS.map(p => ({
        payment_id: p.payment_id,
        booking_id: p.booking_id,
        amount: p.amount,
        status: p.status
      }));

      const success = await exportToHardwareVault(activeData, `Vault_Export_${new Date().toISOString().split('T')[0]}.csv`);
      if (success) {
        setFinancialsPurged(true);
        setLastSyncDate(new Date());
        alert("Hardware Vault Transfer Successful.\n\nZero-Trust Execution: ALL cloud financials have been strictly PURGED from the live database. They now reside exclusively on your physical drive.");
      }
    } catch (err: any) {
      alert("Hardware Transfer Error: " + err.message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold flex items-center">
        Banquety Operations Command
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Current Session</h2>
          <p><strong>Active Role:</strong> <span className="uppercase text-blue-600">{role || 'Unassigned'}</span></p>
          <div className="mt-4 p-4 bg-gray-50 rounded text-sm text-gray-700">
            This module verifies Banquety simulation states. Use the Sidebar to navigate through Operations.
          </div>
        </div>

        {isDirector && (
          <div className="bg-white p-6 rounded-lg border border-red-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
              DIRECTOR ONLY
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
              <ShieldCheck className="w-6 h-6 mr-2 text-red-600" /> Air-Gapped Vault
            </h2>
            
            <div className="text-sm text-gray-600 mb-6">
              Extract sensitive financial ledgers entirely out of cloud storage directly to your physical USB Key Drive (Zero-Trust Purge).
            </div>

            {requiresSync && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-bold text-red-800">Compliance Alert</h3>
                    <p className="text-sm text-red-700 mt-1">
                      It has been <strong>{daysSinceSync} days</strong> since your last hardware extraction. Weekly Sunday sync is overdue. Financial payloads are currently vulnerable on cloud servers.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!requiresSync && financialsPurged && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-r">
                <div className="flex items-center">
                  <ShieldCheck className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-bold text-green-800">Zero-Trust Secured</h3>
                    <p className="text-sm text-green-700">
                      All weekly financials purged successfully. Last strict sync: {lastSyncDate.toDateString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleVaultSync}
              disabled={exporting || financialsPurged}
              className={`w-full py-3 px-4 flex items-center justify-center font-bold rounded-lg transition-colors ${
                financialsPurged 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 text-white shadow shadow-red-200'
              }`}
            >
              <HardDrive className="w-5 h-5 mr-2" /> 
              {exporting ? 'Transferring via FileAPI...' : financialsPurged ? 'Vault Locked & Purged' : 'Initialize Hardware Transfer'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
