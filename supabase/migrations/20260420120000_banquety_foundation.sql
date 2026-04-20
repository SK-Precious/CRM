/*
  # Banquety Foundation Schema
  
  1. New Tables:
    - venues: Represents physical banquet halls/locations.
    - bookings: Expanded 20-field BTR booking model.
    - payments: 5-state payment approval machine.
    - booking_audit & payment_audit: For strict tracking.

  2. Modifications to Legacy:
    - Add venue_id to leads, vendors, admins.
    - Add role to admins table mapping to Banquety roles.
*/

CREATE TABLE IF NOT EXISTS public.venues (
    venue_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    location text,
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

-- Default Backfill a primary venue just in case to avoid null constraints
INSERT INTO public.venues (name, location) VALUES ('Primary Banquety Venue', 'HQ') ON CONFLICT DO NOTHING;

-- Extend Legacy Admins Table for RBAC
ALTER TABLE public.admins ADD COLUMN IF NOT EXISTS venue_id uuid REFERENCES public.venues(venue_id);
ALTER TABLE public.admins ADD COLUMN IF NOT EXISTS role text CHECK (role IN ('director', 'gm', 'junior_sales', 'storekeeper'));

-- Update any existing admins to default 'director' manually if they had 'full' permissions
UPDATE public.admins SET role = 'director' WHERE permissions = 'full' AND role IS NULL;
UPDATE public.admins SET role = 'junior_sales' WHERE permissions = 'limited' AND role IS NULL;

-- Bind venue_id to existing core models
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS venue_id uuid REFERENCES public.venues(venue_id);
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS venue_id uuid REFERENCES public.venues(venue_id);

-- Create New Bookings Table
CREATE TABLE IF NOT EXISTS public.bookings (
    booking_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id uuid REFERENCES public.venues(venue_id),
    name text NOT NULL,
    contact text NOT NULL,
    contact2 text,
    dob date,
    menu text,
    dof date,
    pax integer,
    hall text,
    occasion text,
    timings text,
    meal text,
    dj boolean,
    liquor boolean,
    flower_decor boolean,
    theme text,
    extra_plates integer,
    total_amount numeric,
    customer_btr numeric,
    remarks text,
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    created_by uuid REFERENCES public.admins(admin_id)
);

-- Create New Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
    payment_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id uuid REFERENCES public.bookings(booking_id),
    amount numeric NOT NULL,
    mode text,
    txn_id text,
    status text CHECK (status IN ('DRAFT', 'PENDING_GM', 'GM_CONFIRMED', 'DIRECTOR_APPROVED', 'LOCKED', 'REJECTED')) DEFAULT 'DRAFT',
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    created_by uuid REFERENCES public.admins(admin_id)
);

-- Create Audit Tables
CREATE TABLE IF NOT EXISTS public.booking_audit (
    audit_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id uuid REFERENCES public.bookings(booking_id),
    action text,
    old_value jsonb,
    new_value jsonb,
    changed_by uuid REFERENCES public.admins(admin_id),
    changed_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.payment_audit (
    audit_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id uuid REFERENCES public.payments(payment_id),
    action text,
    old_value jsonb,
    new_value jsonb,
    changed_by uuid REFERENCES public.admins(admin_id),
    changed_at timestamptz DEFAULT CURRENT_TIMESTAMP
);
