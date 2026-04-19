import { useState, useEffect, useCallback } from 'react';
import React from 'react';
import { AppDataContext } from './appDataContext';
import api from '../lib/api';

// ─── Helpers ────────────────────────────────────────────────────────────────

const DEFAULT_UNIT = 'KG';

const parseQuantity = (quantity, unit) => {
  if (typeof quantity === 'number' && Number.isFinite(quantity)) {
    return { quantity, unit: (unit || DEFAULT_UNIT).toUpperCase() };
  }
  const raw = (quantity ?? '').toString().trim();
  const numeric = Number(raw.replace(/[^0-9.]/g, ''));
  const inferredUnit = raw.replace(/[0-9.\s]/g, '').trim();
  return {
    quantity: Number.isFinite(numeric) ? numeric : 0,
    unit: ((unit || inferredUnit || DEFAULT_UNIT) || DEFAULT_UNIT).toUpperCase(),
  };
};

// Coerce any value to a plain string (handles Mongoose ObjectId, string, null)
const toStr = (v) => (v == null ? null : (typeof v === 'object' ? v.toString() : String(v)));

const normalizeListing = (listing) => {
  const q = parseQuantity(listing?.quantity, listing?.unit);
  return {
    ...listing,
    id: toStr(listing?.id || listing?._id),
    donorId: toStr(listing?.donorId),
    receiverId: toStr(listing?.receiverId),
    quantity: q.quantity,
    unit: q.unit,
    title: (listing?.title ?? '').toString(),
    category: (listing?.category ?? 'Fresh Produce').toString(),
    status: (listing?.status ?? 'AVAILABLE').toString(),
    requests: Array.isArray(listing?.requests)
      ? listing.requests.map((r) => ({
          ...r,
          id: toStr(r?.id || r?._id),
          receiverId: toStr(r?.receiverId),
        }))
      : [],
  };
};

const normalizeListings = (listings) => {
  if (!Array.isArray(listings)) return [];
  return listings.map(normalizeListing);
};

// ─── Provider ────────────────────────────────────────────────────────────────

export const AppDataProvider = ({ children }) => {
  // ─── Dark mode ──────────────────────────────────────────────────────────
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return (
      localStorage.getItem('theme') === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
    );
  });

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  // ─── Auth state ─────────────────────────────────────────────────────────
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('hx_user');
    try { return saved ? JSON.parse(saved) : null; } catch { return null; }
  });

  const [searchQuery, setSearchQuery] = useState('');

  // ─── Listings state ─────────────────────────────────────────────────────
  const [foodListings, setFoodListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(false);

  const fetchListings = useCallback(async () => {
    setListingsLoading(true);
    try {
      const { data } = await api.get('/listings');
      setFoodListings(normalizeListings(data));
    } catch (err) {
      console.error('Failed to fetch listings:', err);
    } finally {
      setListingsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // ─── Community posts ─────────────────────────────────────────────────────
  const [communityPosts, setCommunityPosts] = useState([]);

  const fetchPosts = useCallback(async () => {
    try {
      const { data } = await api.get('/posts');
      setCommunityPosts(data.map((p) => ({ ...p, id: p.id || p._id?.toString?.() })));
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // ─── Notifications (client-side only) ────────────────────────────────────
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('hx_notifications');
    try { return saved ? JSON.parse(saved) : []; } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('hx_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const pushNotification = ({ title, message, type = 'INFO', targetRole = 'ALL', meta = {} }) => {
    const n = {
      id: `n_${Date.now()}_${Math.random().toString(16).slice(2)}`,
      title: (title || '').toString().slice(0, 80),
      message: (message || '').toString().slice(0, 240),
      type,
      targetRole,
      meta,
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [n, ...(prev || [])].slice(0, 50));
    return n.id;
  };

  const markNotificationRead = (id) => {
    setNotifications((prev) => (prev || []).map((n) => (n?.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => (prev || []).map((n) => ({ ...n, read: true })));
  };
    
  const clearNotifications = () => {
    setNotifications([]);
    localStorage.removeItem('hx_notifications');
  };
    
  const getUnreadCount = (role) => {
    const r = (role || 'ALL').toString();
    return (notifications || []).filter((n) => {
      if (!n || n.read) return false;
      if (n.targetRole === 'ALL') return true;
      return n.targetRole === r;
    }).length;
  };

  // ─── Leaderboard (static) ────────────────────────────────────────────────
  const [leaderboard] = useState([
    { id: 'l1', rank: 1, name: 'Green Earth NGOs', donated: '1,245 kg', impact: 'High' },
    { id: 'l2', rank: 2, name: 'Local Bakehouse', donated: '980 kg', impact: 'High' },
    { id: 'l3', rank: 3, name: 'City Market Co.', donated: '850 kg', impact: 'High' },
    { id: 'l4', rank: 4, name: 'Sunrise Grocery', donated: '620 kg', impact: 'Medium' },
    { id: 'l5', rank: 5, name: 'Community Cafe', donated: '410 kg', impact: 'Medium' },
  ]);

  // ─── Auth actions ────────────────────────────────────────────────────────

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('hx_token', data.token);
    localStorage.setItem('hx_user', JSON.stringify(data.user));
    setUser(data.user);
    // Refresh listings after login
    fetchListings();
  };

  const register = async (email, password, role, name) => {
    const displayName = (name || email.split('@')[0]).trim();
    const { data } = await api.post('/auth/register', { name: displayName, email, password, role });
    // Do NOT set user/token here — Login.jsx will redirect to sign-in after registration
    return data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hx_token');
    localStorage.removeItem('hx_user');
    localStorage.removeItem('hx_notifications');
  };

  const updateUser = async (profileData) => {
    const { data } = await api.put('/auth/profile', profileData);
    const updated = data.user;
    setUser(updated);
    localStorage.setItem('hx_user', JSON.stringify(updated));
    return true;
  };

  const changePassword = async (newPassword) => {
    await api.put('/auth/change-password', { newPassword });
    return true;
  };

  const toggle2FA = async () => {
    const { data } = await api.put('/auth/toggle-2fa');
    const updated = data.user;
    setUser(updated);
    localStorage.setItem('hx_user', JSON.stringify(updated));
    return true;
  };

  const deleteAccount = async () => {
    await api.delete('/auth/account');
    logout();
    return true;
  };

  // ─── Listing actions ─────────────────────────────────────────────────────

  const addListing = async (listingData) => {
    if (!user || user?.role !== 'DONOR') return false;
    const { data } = await api.post('/listings', listingData);
    const newListing = normalizeListing(data);
    setFoodListings((prev) => [newListing, ...(prev || [])]);

    pushNotification({
      type: 'NEW_LISTING',
      targetRole: 'RECEIVER',
      title: 'New donation available',
      message: `${newListing.title} • ${newListing.quantity} ${newListing.unit} • ${newListing.location}`,
      meta: { listingId: newListing.id },
    });
    return true;
  };

  const requestListing = async (listingId, message = '') => {
    if (!user || user?.role !== 'RECEIVER') return false;
    const { data } = await api.post(`/listings/${listingId}/request`, { message });
    const updated = normalizeListing(data);
    setFoodListings((prev) => (prev || []).map((l) => (l.id === listingId ? updated : l)));

    pushNotification({
      type: 'REQUEST_SUBMITTED',
      targetRole: 'DONOR',
      title: 'New pickup request',
      message: `${user?.name} requested "${updated.title}". Verify before accepting.`,
      meta: { listingId, receiverId: user?.id },
    });
    return true;
  };

  const cancelRequest = async (listingId) => {
    if (!user || user?.role !== 'RECEIVER') return false;
    // Find the active request ID for this user on this listing
    const listing = foodListings.find((l) => l.id === listingId);
    const activeReq = (listing?.requests || []).find(
      (r) => r.receiverId === user.id && !['REJECTED', 'CANCELLED'].includes(r.status)
    );
    const rid = activeReq?.id || activeReq?._id?.toString?.() || 'none';
    const { data } = await api.put(`/listings/${listingId}/request/${rid}/cancel`);
    const updated = normalizeListing(data);
    setFoodListings((prev) => (prev || []).map((l) => (l.id === listingId ? updated : l)));
    return true;
  };

  const verifyRequest = async (listingId, requestId) => {
    if (!user || user?.role !== 'DONOR') return false;
    const { data } = await api.put(`/listings/${listingId}/request/${requestId}/verify`);
    const updated = normalizeListing(data);
    setFoodListings((prev) => (prev || []).map((l) => (l.id === listingId ? updated : l)));
    return true;
  };

  const acceptListing = async (listingId, requestId) => {
    if (!user || user?.role !== 'DONOR') return false;
    const { data } = await api.put(`/listings/${listingId}/request/${requestId}/accept`);
    const updated = normalizeListing(data);
    setFoodListings((prev) => (prev || []).map((l) => (l.id === listingId ? updated : l)));

    pushNotification({
      type: 'REQUEST_ACCEPTED',
      targetRole: 'RECEIVER',
      title: 'Request accepted',
      message: `Your pickup request for "${updated.title}" was accepted.`,
      meta: { listingId, requestId },
    });
    return true;
  };

  const rejectRequest = async (listingId, requestId) => {
    if (!user || user?.role !== 'DONOR') return false;
    const { data } = await api.put(`/listings/${listingId}/request/${requestId}/reject`);
    const updated = normalizeListing(data);
    setFoodListings((prev) => (prev || []).map((l) => (l.id === listingId ? updated : l)));
    return true;
  };

  const cancelListing = async (listingId) => {
    if (!user) return false;
    const { data } = await api.put(`/listings/${listingId}/cancel`);
    const updated = normalizeListing(data);
    setFoodListings((prev) => (prev || []).map((l) => (l.id === listingId ? updated : l)));
    return true;
  };

  // ─── Community post actions ───────────────────────────────────────────────

  const createPost = async (content) => {
    const { data } = await api.post('/posts', { content });
    const post = { ...data, id: data.id || data._id?.toString?.() };
    setCommunityPosts((prev) => [post, ...(prev || [])]);
  };

  const likePost = async (postId) => {
    const { data } = await api.put(`/posts/${postId}/like`);
    const updated = { ...data, id: data.id || data._id?.toString?.() };
    setCommunityPosts((prev) => (prev || []).map((p) => (p.id === postId ? updated : p)));
  };

  const replyToPost = async (postId, replyContent) => {
    const { data } = await api.post(`/posts/${postId}/reply`, { content: replyContent });
    const updated = { ...data, id: data.id || data._id?.toString?.() };
    setCommunityPosts((prev) => (prev || []).map((p) => (p.id === postId ? updated : p)));
  };

  // ─── Computed stats ─────────────────────────────────────────────────────
  const activeListings = foodListings.filter((item) => item?.status === 'AVAILABLE');
  const acceptedListings = foodListings.filter((item) => item?.status === 'ACCEPTED');

  const sumAcceptedKg = acceptedListings.reduce((acc, item) => {
    const q = typeof item?.quantity === 'number' ? item.quantity : Number(item?.quantity);
    return acc + (Number.isFinite(q) ? q : 0);
  }, 0);

  const uniquePartners = (() => {
    const set = new Set();
    (foodListings || []).forEach((item) => {
      if (item?.donorName) set.add(String(item.donorName).trim().toLowerCase());
      if (item?.receiverName) set.add(String(item.receiverName).trim().toLowerCase());
    });
    if (user?.name) set.add(String(user.name).trim().toLowerCase());
    return set;
  })();

  const mealsEquivalents = Math.round(sumAcceptedKg * 2);
  const waterSavedLiters = Math.round(sumAcceptedKg * 100);
  const carbonSavedTons = (sumAcceptedKg * 2.5) / 1000;

  const stats = {
    totalRescuedKg: Number(sumAcceptedKg.toFixed(2)),
    carbonSavedTons: Number(carbonSavedTons.toFixed(2)),
    activeListingsCount: activeListings?.length || 0,
    partnersEngaged: uniquePartners.size,
    waterSavedLiters,
    mealsEquivalents,
  };

  // ─── Context value ───────────────────────────────────────────────────────
  const value = {
    user,
    foodListings,
    activeListings,
    availableItems: activeListings,
    listingsLoading,
    searchQuery,
    setSearchQuery,
    stats,
    notifications,
    unreadNotifications: getUnreadCount(user?.role),
    pushNotification,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
    login,
    register,
    logout,
    updateUser,
    changePassword,
    toggle2FA,
    deleteAccount,
    addListing,
    requestListing,
    cancelRequest,
    verifyRequest,
    acceptListing,
    rejectRequest,
    cancelListing,
    communityPosts,
    leaderboard,
    createPost,
    likePost,
    replyToPost,
    isDarkMode,
    toggleDarkMode,
    refetchListings: fetchListings,
  };

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
};
