import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  ChevronDown,
  LogOut,
  Mail,
  Menu,
  Moon,
  Search,
  Settings,
  ShieldCheck,
  Sun,
  User,
} from 'lucide-react';
import { useAppData } from '../../context/appDataContext';
import { useOverlay } from '../ui/overlayContext';
import Brand from '../ui/Brand';

const Navbar = ({ toggleSidebar }) => {
  const {
    user,
    logout,
    isDarkMode,
    toggleDarkMode,
    searchQuery,
    setSearchQuery,
    activeListings,
    notifications = [],
    unreadNotifications = 0,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
  } = useAppData();

  const { toast } = useOverlay();
  const navigate = useNavigate();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const lastUnreadRef = useRef(unreadNotifications);

  useEffect(() => {
    const onDown = (e) => {
      const t = e.target;
      if (profileRef.current && profileRef.current.contains(t)) return;
      if (notifRef.current && notifRef.current.contains(t)) return;
      setIsProfileOpen(false);
      setIsNotifOpen(false);
    };

    const onKey = (e) => {
      if (e.key === 'Escape') {
        setIsProfileOpen(false);
        setIsNotifOpen(false);
      }
    };

    window.addEventListener('mousedown', onDown);
    window.addEventListener('touchstart', onDown); // Mobile support
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('touchstart', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, []);
    
  useEffect(() => {
    // Receiver login nudge (once per session).
    if (!user || user?.role !== 'RECEIVER') return;
    const key = `hx_receiver_welcome_${user?.id || 'me'}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');

    if ((activeListings || []).length > 0) {
      toast({
        title: 'New donations available',
        description: 'Open Marketplace to view donor food donations near you.',
      });
    }
  }, [user, activeListings, toast]);

  useEffect(() => {
    // Real-time notification toast (only when unread increases).
    if (!user) return;
    if (unreadNotifications > lastUnreadRef.current) {
      const newest = (notifications || []).find((n) => !n?.read && (n?.targetRole === 'ALL' || n?.targetRole === user?.role));
      if (newest) {
        toast({
          title: newest.title || 'Update',
          description: newest.message || 'You have a new notification.',
        });
      }
    }
    lastUnreadRef.current = unreadNotifications;
  }, [notifications, toast, unreadNotifications, user]);

  const quickResults = useMemo(() => {
    const q = (searchQuery || '').trim().toLowerCase();
    if (!q) return [];
    return (activeListings || [])
      .filter((item) => {
        const t = (item?.title || '').toLowerCase();
        const c = (item?.category || '').toLowerCase();
        return t.includes(q) || c.includes(q);
      })
      .slice(0, 3);
  }, [activeListings, searchQuery]);

  const visibleNotifications = useMemo(() => {
    if (!user) return [];
    return (notifications || [])
      .filter((n) => n?.targetRole === 'ALL' || n?.targetRole === user?.role)
      .slice(0, 8);
  }, [notifications, user]);

  const onOpenNotification = () => {
    setIsNotifOpen((v) => {
      const next = !v;
      if (next) markAllNotificationsRead?.();
      return next;
    });
    setIsProfileOpen(false);
  };

  const handleQuickAction = (route) => {
    navigate(route);
    setIsProfileOpen(false);
  };

  const openNotifTarget = (n) => {
    if (n?.id) markNotificationRead?.(n.id);
    if (n?.meta?.listingId) {
      navigate('/marketplace');
      return;
    }
    navigate('/dashboard');
  };

  return (
    <header className="h-20 flex items-center justify-between px-6 md:px-10 sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 transition-all duration-300">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="md:hidden p-2 text-slate-500 hover:text-emerald-600 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="flex items-center"
          aria-label="Go to dashboard"
        >
          <Brand size="sm" className="hidden sm:flex" />
          <Brand size="sm" showText={false} className="sm:hidden" />
        </button>
      </div>

      <div className="flex-1 max-w-2xl mx-8 hidden lg:flex items-center gap-4">
        <div className="relative group flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            placeholder="Search listings, partners, and impact data…"
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 text-[15px] font-semibold tracking-tight text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:bg-white dark:focus:bg-slate-800 transition-all shadow-sm"
          />

          {isSearchFocused && searchQuery && (
            <div className="absolute top-14 left-0 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-2xl shadow-xl animate-fade-in z-50">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center mb-1">
                <p className="text-[11px] font-black tracking-widest text-emerald-600 uppercase">Quick results</p>
                <span className="text-[10px] text-slate-400 font-semibold">{quickResults?.length || 0} hits</span>
              </div>

              <div className="flex flex-col">
                {quickResults?.length > 0 ? (
                  quickResults.map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => navigate('/marketplace')}
                      className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors"
                    >
                      <div className="flex items-center min-w-0">
                        <Search size={14} className="text-slate-400 mr-3" />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{item.title}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{item.category}</p>
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-sm text-slate-500 dark:text-slate-400">No matches.</div>
                )}
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={toggleDarkMode}
          className="h-11 w-11 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-900 transition-colors flex items-center justify-center"
          aria-label="Toggle theme"
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={onOpenNotification}
            className="relative h-11 w-11 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-900 transition-colors flex items-center justify-center"
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unreadNotifications > 0 ? (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-emerald-600 text-white text-[10px] font-black flex items-center justify-center">
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </span>
            ) : null}
          </button>

          {isNotifOpen && (
            <div className="absolute top-[54px] right-0 w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-2 z-50 animate-fade-in-up">
              <div className="px-4 py-3 flex items-center justify-between">
                <p className="text-[11px] font-black tracking-widest uppercase text-slate-500 dark:text-slate-400">Notifications</p>
                <button
                  type="button"
                  onClick={() => clearNotifications?.()}
                  className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Clear all
                </button>
              </div>
              <div className="h-px bg-slate-100 dark:bg-slate-800" />
              <div className="max-h-80 overflow-y-auto">
                {visibleNotifications.length === 0 ? (
                  <div className="p-4 text-sm text-slate-500 dark:text-slate-400">No notifications yet.</div>
                ) : (
                  visibleNotifications.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => openNotifTarget(n)}
                      className="w-full text-left p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{n.title}</p>
                      <p className="mt-1 text-[12px] text-slate-500 dark:text-slate-400 leading-snug">{n.message}</p>
                      <p className="mt-2 text-[10px] font-semibold text-slate-400 dark:text-slate-500">{new Date(n.createdAt).toLocaleString()}</p>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => {
              setIsProfileOpen((v) => !v);
              setIsNotifOpen(false);
            }}
            className="flex items-center gap-3 p-1.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors select-none"
            aria-label="Profile menu"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-500 text-white flex items-center justify-center font-black text-sm shadow-sm shadow-emerald-600/20">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-950" />
            </div>
            <div className="hidden xl:block text-left">
              <p className="text-xs font-black text-slate-900 dark:text-white leading-none capitalize">{user?.name || 'Partner'}</p>
              <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 tracking-widest uppercase mt-1 leading-none">{user?.role || 'DONOR'}</p>
            </div>
            <ChevronDown
              size={14}
              className={`hidden xl:block text-slate-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {isProfileOpen && (
            <div className="absolute top-[54px] right-0 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-2 z-50 animate-fade-in-up">
              <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl flex flex-col mb-2">
                <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 tracking-widest uppercase flex items-center mb-1">
                  <ShieldCheck size={12} className="mr-2" /> Verified {user?.role || 'Partner'}
                </p>
                <p className="text-lg font-black text-slate-900 dark:text-white leading-none">{user?.name || 'Current User'}</p>
                <div className="flex items-center mt-2">
                  <Mail size={12} className="text-slate-400 mr-2" />
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 truncate">{user?.email || 'contact@hungerxchange.org'}</p>
                </div>
              </div>

              <div className="flex flex-col space-y-1 p-2">
                <button
                  type="button"
                  onClick={() => handleQuickAction('/settings')}
                  className="flex items-center w-full p-3 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <User size={16} className="mr-3 text-slate-400" />
                  View Public Profile
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAction('/settings')}
                  className="flex items-center w-full p-3 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <Settings size={16} className="mr-3 text-slate-400" />
                  Account Settings
                </button>
                <div className="h-px w-full bg-slate-100 dark:bg-slate-800 my-1" />
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="flex items-center w-full p-3 rounded-xl text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                >
                  <LogOut size={16} className="mr-3" />
                  Sign Out Session
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
