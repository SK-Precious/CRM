import React from 'react';
import { MOCK_STAFF, MOCK_VENUES } from '../data/banquetySimulation';
import { useRole } from '../hooks/useRole';

export default function StaffVenueManagement() {
  const { isDirector } = useRole();

  if (!isDirector) {
    return <div className="p-8 text-red-600">Access Denied: Only Directors can manage multi-venue staff assignments.</div>;
  }

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">Staff & Venue Configuration</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Venue Scopes</h2>
          <div className="bg-white shadow rounded-lg p-4 space-y-4">
            {MOCK_VENUES.map(v => (
              <div key={v.id} className="border-b pb-2 flex justify-between">
                <div>
                  <div className="font-bold">{v.name}</div>
                  <div className="text-sm text-gray-500">{v.location}</div>
                </div>
                <div className="text-sm text-gray-400">ID: {v.id}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Staff Directory (RBAC)</h2>
          <div className="bg-white shadow rounded-lg p-4 space-y-4">
            {MOCK_STAFF.map(s => (
              <div key={s.id} className="border-b pb-2 flex justify-between items-center">
                <div>
                  <div className="font-bold">{s.name}</div>
                  <div className="flex space-x-2 mt-1">
                    <span className="px-2 bg-indigo-100 text-indigo-800 text-xs rounded uppercase font-semibold">{s.role}</span>
                    <span className="px-2 bg-gray-100 text-gray-800 text-xs rounded">{s.venue_id || 'Global'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
