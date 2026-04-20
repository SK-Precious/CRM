/*
  # Banquety Base RLS and Audit Triggers
*/

-- Enable RLS
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_audit ENABLE ROW LEVEL SECURITY;

-- Helper functions for RLS
CREATE OR REPLACE FUNCTION auth_user_role() RETURNS text AS $$
  SELECT role FROM public.admins WHERE admin_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth_user_venue() RETURNS uuid AS $$
  SELECT venue_id FROM public.admins WHERE admin_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Booking Policies
CREATE POLICY "Users can view bookings in their venue" 
ON public.bookings FOR SELECT TO authenticated
USING (
  venue_id = auth_user_venue() OR 
  auth_user_role() = 'director'
);

CREATE POLICY "Only Sales, GM, Director can insert bookings"
ON public.bookings FOR INSERT TO authenticated
WITH CHECK (
  auth_user_role() IN ('junior_sales', 'gm', 'director')
);

CREATE POLICY "Only GM and Director can update bookings"
ON public.bookings FOR UPDATE TO authenticated
USING (
  auth_user_role() IN ('gm', 'director')
);

-- Payments Policies
CREATE POLICY "Users can view payments in their venue"
ON public.payments FOR SELECT TO authenticated
USING (
  (booking_id IN (SELECT booking_id FROM public.bookings WHERE venue_id = auth_user_venue())) OR
  auth_user_role() = 'director'
);

CREATE POLICY "Anyone except Storekeeper can log a payment"
ON public.payments FOR INSERT TO authenticated
WITH CHECK (
  auth_user_role() != 'storekeeper'
);

CREATE POLICY "Director and GM can update payments for approvals"
ON public.payments FOR UPDATE TO authenticated
USING (
  auth_user_role() IN ('gm', 'director') OR 
  (auth_user_role() = 'junior_sales' AND status IN ('DRAFT', 'REJECTED'))
);

-- Audit RLS (Strict append-only, visible mostly to Director)
CREATE POLICY "Nobody can update audits"
ON public.booking_audit FOR UPDATE TO authenticated USING (false);
CREATE POLICY "Nobody can delete audits"
ON public.booking_audit FOR DELETE TO authenticated USING (false);

CREATE POLICY "Director can view all audits"
ON public.booking_audit FOR SELECT TO authenticated
USING (auth_user_role() = 'director');
CREATE POLICY "Director can view all audits"
ON public.payment_audit FOR SELECT TO authenticated
USING (auth_user_role() = 'director');

