export const MOCK_VENUES = [
  { id: 'v1', name: 'Grand Ballroom A', location: 'HQ' },
  { id: 'v2', name: 'Open Lawn', location: 'HQ' },
];

export const MOCK_STAFF = [
  { id: 's1', name: 'Alice (Director)', role: 'director', venue_id: null },
  { id: 's2', name: 'Bob (GM)', role: 'gm', venue_id: 'v1' },
  { id: 's3', name: 'Charlie (Jr Sales)', role: 'junior_sales', venue_id: 'v1' },
  { id: 's4', name: 'Dave (Storekeeper)', role: 'storekeeper', venue_id: 'v1' },
];

export const MOCK_BOOKINGS = [
  {
    booking_id: 'b1',
    venue_id: 'v1',
    name: 'Sharma Wedding',
    pax: 400,
    total_amount: 500000,
    status: 'Booked'
  }
];

export const MOCK_PAYMENTS = [
  {
    payment_id: 'p1',
    booking_id: 'b1',
    amount: 125000,
    status: 'DRAFT',
    mode: 'CASH',
    txn_id: ''
  }
];
