/**
 * Banquety Payment Timeline Helper
 * Computes logical due dates based on the Date of Function (DOF).
 */

export interface PaymentSchedule {
  stage: string;
  percentage: number;
  dueDate: string;
  description: string;
}

export function autoComputePaymentTimeline(eventDateStr: string | null): PaymentSchedule[] {
  if (!eventDateStr) return [];
  
  const eventDate = new Date(eventDateStr);
  const now = new Date();

  // One month before event
  const oneMonthBefore = new Date(eventDate);
  oneMonthBefore.setMonth(oneMonthBefore.getMonth() - 1);

  // Two days before event
  const twoDaysBefore = new Date(eventDate);
  twoDaysBefore.setDate(twoDaysBefore.getDate() - 2);

  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  return [
    {
      stage: 'Advance',
      percentage: 25,
      dueDate: formatDate(now), // Due immediately at booking
      description: '25% Advance payment to lock the date.'
    },
    {
      stage: 'Midpoint',
      percentage: 25,
      dueDate: formatDate(oneMonthBefore),
      description: 'Next 25% due exactly one month prior to event.'
    },
    {
      stage: 'Final',
      percentage: 50,
      dueDate: formatDate(twoDaysBefore),
      description: 'Remaining 50% strict deadline two days prior to event.'
    }
  ];
}
