/*
  # Missing Initial Schema Setup for Leads

  Creates the core leads table which was missing from the initial migration tree.
*/

CREATE TABLE IF NOT EXISTS leads (
  lead_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  number text,
  lead_type text,
  wedding_date text,
  budget text,
  location text,
  type_of_venue text,
  lead_create_date timestamptz DEFAULT CURRENT_TIMESTAMP,
  numeric_budget numeric,
  time_to_book_days integer,
  status text DEFAULT 'new'
);
