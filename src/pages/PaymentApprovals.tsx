import React, { useState } from 'react';
import { MOCK_PAYMENTS, MOCK_BOOKINGS } from '../data/banquetySimulation';
import { useRole } from '../hooks/useRole';

export default function PaymentApprovals() {
  const { isStorekeeper, isDirector, isGM, role } = useRole();
  const [payments, setPayments] = useState(MOCK_PAYMENTS);

  if (isStorekeeper) {
    return <div className="p-8 text-red-600">Access Denied: Storekeepers cannot view financial logs under Banquety RLS.</div>;
  }

  const handleApprove = (id: string, newStatus: string) => {
    setPayments(payments.map(p => p.payment_id === id ? { ...p, status: newStatus } : p));
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Payment Workflow</h1>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payments.map(p => (
              <tr key={p.payment_id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.payment_id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.booking_id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">₹{p.amount.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${p.status === 'LOCKED' ? 'bg-purple-100 text-purple-800' : 
                      p.status === 'DIRECTOR_APPROVED' ? 'bg-green-100 text-green-800' :
                      p.status === 'GM_CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'}`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {p.status === 'DRAFT' && isGM && (
                    <button onClick={() => handleApprove(p.payment_id, 'PENDING_GM')} className="text-indigo-600 hover:text-indigo-900">Send to GM</button>
                  )}
                  {p.status === 'PENDING_GM' && isGM && (
                    <button onClick={() => handleApprove(p.payment_id, 'GM_CONFIRMED')} className="text-indigo-600 font-bold hover:text-indigo-900">Confirm Receipt</button>
                  )}
                  {p.status === 'GM_CONFIRMED' && isDirector && (
                    <button onClick={() => handleApprove(p.payment_id, 'DIRECTOR_APPROVED')} className="text-green-600 font-bold hover:text-green-900">Approve</button>
                  )}
                  {p.status === 'DIRECTOR_APPROVED' && isDirector && (
                    <button onClick={() => handleApprove(p.payment_id, 'LOCKED')} className="text-purple-600 flex items-center font-bold hover:text-purple-900">
                      🔒 Lock to Vault
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
