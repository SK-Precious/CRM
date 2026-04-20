import React, { useState } from 'react';
import { MOCK_BOOKINGS } from '../data/banquetySimulation';
import { useRole } from '../hooks/useRole';

export default function BookingOperations() {
  const { isStorekeeper } = useRole();
  const [bookings] = useState(MOCK_BOOKINGS);

  if (isStorekeeper) {
    return <div className="p-8 text-red-600">Access Denied: Storekeepers cannot view booking PII under Banquety RLS.</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Booking Operations</h1>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">PAX</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bookings.map(b => (
              <tr key={b.booking_id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{b.booking_id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{b.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{b.pax}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{b.total_amount.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">{b.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
