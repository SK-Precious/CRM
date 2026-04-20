import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home,
  Users,
  Calendar,
  BarChart2,
  Store,
  Heart,
  ShieldCheck,
  Activity,
  BookOpen,
  CreditCard,
  Briefcase,
  Camera,
  X
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { useRole } from '../../hooks/useRole';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const { role, isDirector, isGM } = useRole();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/', roles: ['director', 'gm', 'junior_sales', 'storekeeper'] },
    { icon: Users, label: 'Leads', path: '/leads', roles: ['director', 'gm', 'junior_sales'] },
    { icon: Calendar, label: 'Calendar', path: '/calendar', roles: ['director', 'gm', 'junior_sales', 'storekeeper'] },
    { icon: BarChart2, label: 'Analytics', path: '/analytics', roles: ['director', 'gm'] },
    { icon: Store, label: 'Vendors', path: '/vendors', roles: ['director', 'gm', 'junior_sales', 'storekeeper'] },
    { icon: Activity, label: 'Operations', path: '/operations', roles: ['director', 'gm'] },
    { icon: Camera, label: 'AI Intake', path: '/ocr', roles: ['director', 'gm', 'junior_sales'] },
    { icon: BookOpen, label: 'Bookings', path: '/bookings', roles: ['director', 'gm', 'junior_sales'] },
    { icon: CreditCard, label: 'Payments', path: '/payments', roles: ['director', 'gm', 'junior_sales'] },
    { icon: Briefcase, label: 'Banquety Team', path: '/team', roles: ['director', 'gm'] },
  ];

  const filteredItems = menuItems.filter(item => 
    !item.roles || (role && item.roles.includes(role))
  );

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleMenuItemClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="w-64 bg-background border-r border-border h-screen flex flex-col md:relative md:flex-shrink-0">
      {/* Mobile Close Button */}
      <div className="md:hidden flex justify-end p-4 border-b border-border">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-6 border-b border-border">
        <div className="flex items-center">
          <img src="/shaadiyaar_logo.png" alt="Shaadiyaar Logo" className="h-10 w-auto" />
          <div className="ml-3">
            <h1 className="text-xl font-serif font-semibold text-foreground">Shaadiyaar</h1>
            <p className="text-sm text-muted-foreground">Admin</p>
          </div>
        </div>
      </div>

      <nav className="mt-6 px-3 flex-1">
        {filteredItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={handleMenuItemClick}
            className={`flex items-center px-3 py-2 my-1 rounded-lg text-sm font-medium transition-colors ${
              isActive(item.path)
                ? 'text-primary bg-accent'
                : 'text-foreground hover:text-primary hover:bg-accent'
            }`}
          >
            <item.icon className={`w-5 h-5 mr-3 ${isActive(item.path) ? 'text-primary' : 'text-foreground'}`} />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-6 border-t border-border">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
            <span className="text-primary font-medium">{(profile?.name || 'A').charAt(0)}</span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-foreground">{profile?.name || 'Admin User'}</p>
            <p className="text-xs text-muted-foreground">{profile?.email || 'admin@shaadiyaar.com'}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-accent-vibrant-purple-darker transition font-medium text-sm"
        >
          Log Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;