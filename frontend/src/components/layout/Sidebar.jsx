import { NavLink, useNavigate } from 'react-router-dom';
import { useAppData } from '../../context/appDataContext';
import { LayoutDashboard, Store, History, Map as MapIcon, Users, Settings, LogOut } from 'lucide-react';
import Brand from '../ui/Brand';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { logout } = useAppData();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'Marketplace', path: '/marketplace', icon: <Store size={18} /> },
    { name: 'Listings', path: '/listings', icon: <History size={18} /> },
    { name: 'Route Map', path: '/map', icon: <MapIcon size={18} /> },
    { name: 'Network Feed', path: '/community', icon: <Users size={18} /> },
    { name: 'Console Prefs', path: '/settings', icon: <Settings size={18} /> },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className={`
      fixed md:sticky top-0 left-0 h-screen w-[280px] glass z-50 flex flex-col 
      border-r border-slate-200/50 dark:border-slate-800/50 transition-all duration-500 overflow-hidden
      ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
    `}>
      <div className="absolute top-0 left-0 w-full h-full bg-slate-900/5 dark:bg-slate-950/5 pointer-events-none"></div>

      {/* Brand Header */}
      <div className="p-6 flex items-center justify-center">
        <Brand size="md" className="justify-center" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto mt-2">
        <div className="px-4 py-2 mt-4">
           <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-[0.15em] uppercase">Operations Navigation</h3>
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            onClick={() => {
              // Close the mobile drawer after navigation.
              if (isOpen) toggleSidebar?.();
            }}
            className={({ isActive }) =>
              `group flex items-center px-6 py-4 text-[12px] font-bold uppercase tracking-[0.12em] rounded-2xl transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isActive
                  ? 'bg-emerald-500 text-white shadow-[0_15px_30px_-5px_rgba(16,185,129,0.4)] translate-x-3 scale-[1.02]'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900 hover:text-emerald-600 dark:hover:text-emerald-400 hover:translate-x-1.5'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`mr-5 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${isActive ? 'scale-110 rotate-3' : 'group-hover:scale-110 group-hover:rotate-6'}`}>{item.icon}</span>
                {item.name}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Profile & Actions */}
      <div className="p-6 border-t border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/30">
        <button 
          onClick={handleLogout}
          className="w-full text-red-500 dark:text-red-400 text-[10px] font-black uppercase tracking-widest py-3.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-2xl flex items-center justify-center transition-all border border-transparent hover:border-red-100 dark:hover:border-red-500/20"
        >
          <LogOut size={16} className="mr-3" /> Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
