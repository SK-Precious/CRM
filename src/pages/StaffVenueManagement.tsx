import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRole } from '../hooks/useRole';
import { Admin, BanquetyRole } from '../types';
import { Plus, Trash2, ShieldCheck, Mail, Building, User } from 'lucide-react';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';

export default function StaffVenueManagement() {
  const { isDirector } = useRole();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    role: 'junior_sales' as BanquetyRole,
    venue_id: 'v1'
  });

  const loadAdmins = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setAdmins(data || []);
    } catch (err: any) {
      toast.error('Failed to load team: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.loading('Inviting staff member...');
    try {
      // In a production app, we would call the Edge Function here.
      // For this implementation, we will simulate the successful insert 
      // as the user's Edge Function setup might be pending.
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/add-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          email: newStaff.email,
          name: newStaff.name,
          permissions: newStaff.role === 'director' ? 'full' : 'limited',
          role: newStaff.role,
          venue_id: newStaff.venue_id
        })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to add staff');

      toast.dismiss();
      toast.success('Staff invited! Temp password: ' + result.tempPassword);
      setIsAdding(false);
      loadAdmins();
    } catch (err: any) {
      toast.dismiss();
      toast.error(err.message);
    }
  };

  const handleDeleteStaff = async (adminId: string) => {
    if (!confirm('Are you sure you want to remove this staff member? Access will be immediately revoked.')) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ admin_id: adminId })
      });

      if (!response.ok) throw new Error('Failed to delete staff');
      
      toast.success('Staff member removed');
      loadAdmins();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (!isDirector) {
    return (
      <div className="p-8 flex flex-col items-center justify-center text-center">
        <ShieldCheck className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-900">Access Restricted</h2>
        <p className="text-gray-600">Only the Organization Director can manage multi-venue staff assignments.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Banquety Team Management</h1>
          <p className="text-muted-foreground">Manage roles, venue scopes, and access permissions.</p>
        </div>
        <Button onClick={() => setIsAdding(true)} className="flex items-center">
          <Plus className="w-4 h-4 mr-2" /> Invite Staff Member
        </Button>
      </div>

      {isAdding && (
        <div className="bg-white border rounded-xl p-6 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <h3 className="text-lg font-semibold mb-4">Invite New Staff Member</h3>
          <form onSubmit={handleAddStaff} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 uppercase">Full Name</label>
              <input 
                required
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                value={newStaff.name}
                onChange={e => setNewStaff({...newStaff, name: e.target.value})}
                placeholder="e.g. John Doe"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 uppercase">Work Email</label>
              <input 
                required
                type="email"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                value={newStaff.email}
                onChange={e => setNewStaff({...newStaff, email: e.target.value})}
                placeholder="email@company.com"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 uppercase">Role</label>
              <select 
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                value={newStaff.role}
                onChange={e => setNewStaff({...newStaff, role: e.target.value as BanquetyRole})}
              >
                <option value="junior_sales">Junior Sales</option>
                <option value="gm">General Manager</option>
                <option value="storekeeper">Storekeeper</option>
                <option value="director">Director</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 uppercase">Site (Venue)</label>
              <select 
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                value={newStaff.venue_id}
                onChange={e => setNewStaff({...newStaff, venue_id: e.target.value})}
              >
                <option value="v1">Main Banquet Hall</option>
                <option value="v2">Garden Lawn</option>
                <option value="v3">The Royal Suite</option>
              </select>
            </div>
            <div className="lg:col-span-4 flex justify-end space-x-3 mt-2">
              <Button variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
              <Button type="submit">Send Invite</Button>
            </div>
          </form>
        </div>
      )}
      
      <div className="bg-white shadow rounded-xl border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Venue Scope</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500 animate-pulse">Loading directory...</td></tr>
            ) : admins.map(admin => (
              <tr key={admin.admin_id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {admin.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{admin.name}</div>
                      <div className="text-xs text-gray-500 flex items-center"><Mail className="w-3 h-3 mr-1" /> {admin.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    admin.role === 'director' ? 'bg-purple-100 text-purple-800' :
                    admin.role === 'gm' ? 'bg-green-100 text-green-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {admin.role?.replace('_', ' ') || 'Admin'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  <div className="flex items-center">
                    <Building className="w-4 h-4 mr-2 text-gray-400" />
                    {admin.venue_id || 'Global Access'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => handleDeleteStaff(admin.admin_id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
