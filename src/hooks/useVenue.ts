import { useAuth } from '../contexts/AuthContext';

export function useVenue() {
  const { profile, loading } = useAuth();
  // We can expand this later to use a local storage override for directors switching venues natively.
  // For now, it reflects the assigned venue.

  return {
    venueId: profile?.venue_id || null,
    loading
  };
}
