import { useAuth } from '../contexts/AuthContext';
import { BanquetyRole } from '../types';

export function useRole() {
  const { profile, loading } = useAuth();

  const isRole = (role: BanquetyRole) => profile?.role === role;
  
  const hasAccess = (allowedRoles: BanquetyRole[]) => {
    if (!profile?.role) return false;
    return allowedRoles.includes(profile.role);
  };

  return {
    role: profile?.role || null,
    isDirector: isRole('director'),
    isGM: isRole('gm'),
    isJuniorSales: isRole('junior_sales'),
    isStorekeeper: isRole('storekeeper'),
    isRole,
    hasAccess,
    loading
  };
}
