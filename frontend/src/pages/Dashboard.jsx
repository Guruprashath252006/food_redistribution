import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  Crosshair,
  HandHeart,
  Info,
  MapPin,
  Package,
  Plus,
  ShieldCheck,
  Store,
  User,
  XCircle,
} from 'lucide-react';
import { useAppData } from '../context/appDataContext';
import { useOverlay } from '../components/ui/overlayContext';

const StatCard = ({ label, value, suffix, icon }) => {
  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/70 bg-white/70 dark:bg-slate-950/30 shadow-sm p-5">
      <div className="flex items-center justify-between gap-4">
        <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 tracking-widest uppercase">
          {label}
        </p>
        <div className="w-9 h-9 rounded-xl bg-slate-900/5 dark:bg-white/5 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
          {icon}
        </div>
      </div>
      <p className="mt-4 text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
        {value}{' '}
        {suffix ? (
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{suffix}</span>
        ) : null}
      </p>
    </div>
  );
};

const statusBadgeMap = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200/70 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60',
  VERIFIED: 'bg-sky-50 text-sky-700 border-sky-200/70 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-900/60',
  ACCEPTED: 'bg-emerald-50 text-emerald-700 border-emerald-200/70 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/60',
  AVAILABLE: 'bg-slate-50 text-slate-700 border-slate-200/70 dark:bg-slate-950/40 dark:text-slate-300 dark:border-slate-800/60',
  REJECTED: 'bg-rose-50 text-rose-700 border-rose-200/70 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/60',
  CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200/70 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/60',
};

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center justify-center rounded-full border px-2.5 py-1 text-[10px] font-black tracking-[0.18em] uppercase ${
      statusBadgeMap[status] || statusBadgeMap.AVAILABLE
    }`}
  >
    {status || 'UNKNOWN'}
  </span>
);

const DataTable = ({ columns, rows, emptyText }) => {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/75 dark:bg-slate-950/35">
      {columns.length > 0 && (
        <div className="hidden md:grid grid-cols-12 gap-4 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-900/40 px-5 py-3">
          {columns.map((column) => (
            <div
              key={column.key}
              className={`text-[11px] font-black tracking-[0.22em] uppercase text-slate-500 dark:text-slate-400 ${column.className || ''}`}
            >
              {column.label}
            </div>
          ))}
        </div>
      )}

      {rows.length === 0 ? (
        <div className="px-5 py-10 text-sm text-slate-600 dark:text-slate-300">{emptyText}</div>
      ) : (
        <div className="divide-y divide-slate-200/80 dark:divide-slate-800/80">
          {rows.map((row) => (
            <div key={row.key} className="px-5 py-4">
              <div className="hidden md:grid md:grid-cols-12 md:gap-4 md:items-center">
                {columns.map((column) => (
                  <div key={column.key} className={column.className || ''}>
                    {column.render(row)}
                  </div>
                ))}
              </div>

              <div className="md:hidden space-y-3">
                {columns.map((column) => (
                  <div key={column.key} className="flex items-start justify-between gap-4">
                    <span className="text-[10px] font-black tracking-[0.18em] uppercase text-slate-500 dark:text-slate-400">
                      {column.label}
                    </span>
                    <div className="min-w-0 text-right">{column.render(row)}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const {
    user,
    stats = {},
    foodListings = [],
    addListing,
    cancelRequest,
    verifyRequest,
    acceptListing,
    rejectRequest,
    cancelListing,
    searchQuery,
  } = useAppData();
  const { confirm, toast } = useOverlay();

  const todayISO = (() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  })();

  const [isCreateOpen, setIsCreateOpen] = useState(user?.role === 'DONOR');
  const [form, setForm] = useState({
    title: '',
    category: 'Fresh Produce',
    quantity: 10,
    unit: 'KG',
    expiry: todayISO,
    location: '',
    description: '',
  });
  const [isLocating, setIsLocating] = useState(false);

  const fmtInt = (n) => {
    const num = Number(n || 0);
    return Number.isFinite(num) ? Math.round(num).toLocaleString() : '0';
  };

  const fmtNum = (n, digits = 1) => {
    const num = Number(n || 0);
    if (!Number.isFinite(num)) return '0';
    return num.toLocaleString(undefined, { maximumFractionDigits: digits });
  };

  const me = (user?.name || 'Partner').trim();
  const donorName = user?.name || 'Donor';

  const donorOwnedListings = useMemo(() => {
    if (!user || user?.role !== 'DONOR') return [];
    const uid = (user?.id || '').toString();
    return (foodListings || []).filter((item) => {
      // Primary: match by donorId (MongoDB ObjectId string)
      if (item?.donorId && uid && item.donorId === uid) return true;
      // Fallback: match by name in case donorId is missing
      const dName = (item?.donorName || '').toLowerCase().trim();
      const uName = (user?.name || '').toLowerCase().trim();
      return dName && uName && dName === uName;
    });
  }, [foodListings, user]);

  const incomingRequests = useMemo(() => {
    if (!user || user?.role !== 'DONOR') return [];
    const rows = [];
    donorOwnedListings.forEach((listing) => {
      const requests = Array.isArray(listing?.requests) ? listing.requests : [];
      requests
        .filter((r) => ['PENDING', 'VERIFIED'].includes(r?.status))
        .forEach((request) => rows.push({ listing, request }));
    });
    return rows;
  }, [donorOwnedListings, user]);

  const myRequests = useMemo(() => {
    if (!user || user?.role !== 'RECEIVER') return [];
    const uid = (user?.id || '').toString();
    const rows = [];
    (foodListings || []).forEach((listing) => {
      const requests = Array.isArray(listing?.requests) ? listing.requests : [];
      requests
        .filter((r) => r?.receiverId === uid && ['PENDING', 'VERIFIED'].includes(r?.status))
        .forEach((request) => rows.push({ listing, request }));
    });
    return rows;
  }, [foodListings, user]);

  const myPickups = useMemo(() => {
    if (!user || user?.role !== 'RECEIVER') return [];
    const uid = (user?.id || '').toString();
    return (foodListings || []).filter((l) => l?.status === 'ACCEPTED' && l?.receiverId === uid);
  }, [foodListings, user]);

  const filteredMyPickups = useMemo(() => {
    const q = (searchQuery || '').trim().toLowerCase();
    if (!q) return myPickups;
    return myPickups.filter((item) => {
      const title = (item?.title || '').toLowerCase();
      const location = (item?.location || '').toLowerCase();
      return title.includes(q) || location.includes(q);
    });
  }, [myPickups, searchQuery]);

  const incomingRequestRows = useMemo(
    () =>
      incomingRequests.map(({ listing, request }) => ({
        key: `${listing?.id}_${request?.id}`,
        title: listing?.title || 'Untitled listing',
        counterpart: request?.receiverName || 'Receiver',
        receiverIsVerified: request?.receiverIsVerified || false,
        location: listing?.location || 'Not specified',
        quantity: `${fmtNum(listing?.quantity, 1)} ${listing?.unit || 'KG'}`,
        status: request?.status || 'PENDING',
        note: request?.message || 'No message provided',
        listing,
        request,
      })),
    [incomingRequests]
  );

  const myRequestRows = useMemo(
    () =>
      myRequests.map(({ listing, request }) => ({
        key: `${listing?.id}_${request?.id}`,
        title: listing?.title || 'Untitled listing',
        counterpart: listing?.donorName || 'Donor',
        location: listing?.location || 'Not specified',
        quantity: `${fmtNum(listing?.quantity, 1)} ${listing?.unit || 'KG'}`,
        status: request?.status || 'PENDING',
        note: request?.message || 'Awaiting donor response',
        listing,
        request,
      })),
    [myRequests]
  );

  const pickupRows = useMemo(
    () =>
      filteredMyPickups.map((listing) => ({
        key: listing?.id,
        title: listing?.title || 'Untitled listing',
        counterpart: listing?.donorName || 'Donor',
        location: listing?.location || 'Not specified',
        quantity: `${fmtNum(listing?.quantity, 1)} ${listing?.unit || 'KG'}`,
        status: listing?.status || 'ACCEPTED',
        expiry: listing?.expiry || 'Not set',
        listing,
      })),
    [filteredMyPickups]
  );

  const listingRows = useMemo(
    () =>
      (user?.role === 'DONOR' ? donorOwnedListings : foodListings)
        .slice()
        .sort((a, b) => Date.parse(b?.createdAt || 0) - Date.parse(a?.createdAt || 0))
        .slice(0, 8)
        .map((listing) => ({
          key: listing?.id,
          title: listing?.title || 'Untitled listing',
          category: listing?.category || 'Uncategorized',
          location: listing?.location || 'Not specified',
          quantity: `${fmtNum(listing?.quantity, 1)} ${listing?.unit || 'KG'}`,
          status: listing?.status || 'AVAILABLE',
          receiverName: listing?.receiverName || 'Unassigned',
          expiry: listing?.expiry || 'Not set',
        })),
    [donorOwnedListings, foodListings, user?.role]
  );

  const onCreate = async (e) => {
    e.preventDefault();

    try {
      await addListing({
        title: form.title,
        category: form.category,
        quantity: Number(form.quantity),
        unit: form.unit,
        expiry: form.expiry,
        location: form.location,
        description: form.description,
        image:
          'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=640',
      });
      toast({ variant: 'success', title: 'Listing created', description: 'It is now visible in Marketplace.' });
      setForm((prev) => ({
        ...prev,
        title: '',
        quantity: 10,
        expiry: todayISO,
        location: '',
        description: '',
      }));
      setIsCreateOpen(false);
    } catch (err) {
      toast({ variant: 'danger', title: 'Failed to create listing', description: err?.response?.data?.message || 'Please try again.' });
    }
  };

  const useCurrentLocation = async () => {
    const allowed = await confirm({
      title: 'Use your current location?',
      description: 'We will ask your browser for location permission and insert the current pickup coordinates into the field.',
      confirmText: 'Allow location',
      cancelText: 'Not now',
    });

    if (!allowed) return;

    if (!navigator?.geolocation) {
      toast({
        variant: 'danger',
        title: 'Location unavailable',
        description: 'Geolocation is not supported in this browser.',
      });
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const lat = Number(coords?.latitude || 0).toFixed(5);
        const lng = Number(coords?.longitude || 0).toFixed(5);
        const accuracy = Math.round(coords?.accuracy || 0);

        let locationString = `Current location (${lat}, ${lng})${accuracy ? ` • ±${accuracy}m` : ''}`;

        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
          if (res.ok) {
            const data = await res.json();
            if (data && data.display_name) {
              // Simplify the address if it's too long
              const parts = data.display_name.split(', ');
              const shortAddress = parts.slice(0, 3).join(', ');
              locationString = `${shortAddress} (${lat}, ${lng})`;
            }
          }
        } catch (error) {
          console.error("Reverse geocoding failed", error);
        }

        setForm((prev) => ({
          ...prev,
          location: locationString,
        }));
        setIsLocating(false);
        toast({
          variant: 'success',
          title: 'Location added',
          description: 'Your actual address has been applied to the listing.',
        });
      },
      () => {
        setIsLocating(false);
        toast({
          variant: 'danger',
          title: 'Location denied',
          description: 'Browser location permission was not granted. You can allow it and try again, or type the pickup point manually.',
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 60000,
      }
    );
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800/70 bg-white/70 dark:bg-slate-950/30 shadow-sm p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-900/50 bg-emerald-50/70 dark:bg-emerald-950/30">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-black text-emerald-700 dark:text-emerald-300 tracking-widest uppercase">
                {user?.role === 'DONOR' ? 'Donor Console' : 'Receiver Console'}
              </span>
            </div>
            <h1 className="mt-4 text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Welcome, {me}
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-300 text-sm md:text-base">
              Manage listings, approvals, and pickups. Use the global search to filter your queue.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {user?.role === 'DONOR' ? (
              <button
                type="button"
                onClick={() => setIsCreateOpen((v) => !v)}
                className="h-11 px-5 rounded-2xl bg-emerald-600 text-white font-semibold tracking-tight hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-600/25 flex items-center justify-center gap-2"
              >
                <Plus size={18} /> {isCreateOpen ? 'Hide form' : 'Create listing'}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/marketplace')}
                className="h-11 px-5 rounded-2xl bg-emerald-600 text-white font-semibold tracking-tight hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-600/25 flex items-center justify-center gap-2"
              >
                <HandHeart size={18} /> Browse marketplace
              </button>
            )}

            <button
              type="button"
              onClick={() => navigate('/map')}
              className="h-11 px-5 rounded-2xl bg-white/70 dark:bg-slate-950/30 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 font-semibold tracking-tight hover:bg-white dark:hover:bg-slate-950/40 transition-colors flex items-center justify-center gap-2"
            >
              <MapPin size={18} /> Route planner
            </button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Active listings" value={fmtInt(stats.activeListingsCount)} icon={<Store size={16} />} />
          <StatCard label="Rescued" value={fmtNum(stats.totalRescuedKg, 1)} suffix="kg" icon={<Package size={16} />} />
          <StatCard label="Meals" value={fmtInt(stats.mealsEquivalents)} icon={<ShieldCheck size={16} />} />
          <StatCard label="Partners engaged" value={fmtInt(stats.partnersEngaged)} icon={<HandHeart size={16} />} />
        </div>
      </div>

      {user?.role === 'DONOR' && isCreateOpen && (
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800/70 bg-white/70 dark:bg-slate-950/30 shadow-sm p-6 md:p-8">
          <div className="flex items-center justify-between gap-6 mb-6">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Create a new listing</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">This will appear immediately in Marketplace.</p>
            </div>
            <div className="text-[11px] font-black text-slate-500 dark:text-slate-400 tracking-widest uppercase">
              Required fields marked
            </div>
          </div>

          <form onSubmit={onCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 tracking-widest uppercase">Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                required
                placeholder="e.g. Organic vegetables"
                className="h-11 w-full rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/25"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 tracking-widest uppercase">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                className="h-11 w-full rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/25"
              >
                <option>Fresh Produce</option>
                <option>Bakery & Grains</option>
                <option>Prepared Meals</option>
                <option>Pantry</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 tracking-widest uppercase">Quantity</label>
              <div className="flex gap-3">
                <input
                  type="number"
                  min={1}
                  step={0.5}
                  value={form.quantity}
                  onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))}
                  required
                  className="h-11 w-full rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/25"
                />
                <select
                  value={form.unit}
                  onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value }))}
                  className="h-11 w-28 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/25"
                >
                  <option>KG</option>
                  <option>L</option>
                  <option>PCS</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 tracking-widest uppercase">Expiry date</label>
              <input
                type="date"
                min={todayISO}
                value={form.expiry}
                onChange={(e) => setForm((p) => ({ ...p, expiry: e.target.value }))}
                required
                className="h-11 w-full rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/25"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 tracking-widest uppercase">Pickup location</label>
              <div className="relative">
                <input
                  value={form.location}
                  onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                  required
                  placeholder="e.g. Loading dock, gate 2"
                  className="h-11 w-full rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 pl-4 pr-36 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/25"
                />
                <button
                  type="button"
                  onClick={useCurrentLocation}
                  disabled={isLocating}
                  className="absolute right-1.5 top-1.5 inline-flex h-8 items-center gap-2 rounded-xl border border-emerald-200/80 bg-emerald-50 px-3 text-[11px] font-black tracking-wide text-emerald-700 transition-colors hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300"
                >
                  <Crosshair size={14} />
                  {isLocating ? 'Locating…' : 'Pick current'}
                </button>
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 tracking-widest uppercase">Notes (optional)</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Handling notes, allergens, pickup instructions…"
                className="w-full rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-3 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 resize-none"
              />
            </div>

            <div className="md:col-span-2 flex flex-col sm:flex-row justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="h-11 px-5 rounded-2xl bg-white/70 dark:bg-slate-950/30 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 font-semibold tracking-tight hover:bg-white dark:hover:bg-slate-950/40 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-11 px-5 rounded-2xl bg-emerald-600 text-white font-semibold tracking-tight hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-600/25 flex items-center justify-center gap-2"
              >
                <Plus size={18} /> Create
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex flex-col gap-6 w-full">
        <div className="space-y-6">

          {user?.role === 'DONOR' ? (
            <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800/70 bg-white/70 dark:bg-slate-950/30 shadow-sm p-6 md:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Incoming requests</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Review and accept pickups from verified receivers.</p>
                </div>
                <div className="text-[11px] font-black text-slate-500 dark:text-slate-400 tracking-widest uppercase bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  {incomingRequests.length} pending
                </div>
              </div>

              <DataTable
                columns={[
                  {
                    key: 'request',
                    label: 'Request item',
                    className: 'col-span-3',
                    render: (row) => (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                           <Package size={20} />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">{row.title}</p>
                          <p className="mt-0.5 truncate text-[11px] font-semibold text-slate-500 dark:text-slate-400 capitalize">{row.listing?.category}</p>
                        </div>
                      </div>
                    ),
                  },
                  {
                    key: 'receiver',
                    label: 'Receiver',
                    className: 'col-span-2',
                    render: (row) => {
                      const name = row.counterpart || 'User';
                      const initials = name.slice(0, 1);
                      return (
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 avatar-initials text-[12px] bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-800 dark:to-black`}>
                            {initials}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1">
                              <span className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate">{name}</span>
                              {(row.receiverIsVerified || row.status === 'VERIFIED') && (
                                <ShieldCheck size={14} className="text-blue-500 fill-blue-500/10 shrink-0" />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    },
                  },
                  {
                    key: 'location',
                    label: 'Distance/Loqty',
                    className: 'col-span-3',
                    render: (row) => (
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                        <MapPin size={13} className="text-emerald-500" />
                        <span className="text-[12px] font-medium truncate font-mono text-slate-500">{row.location}</span>
                      </div>
                    ),
                  },
                  {
                    key: 'status',
                    label: 'Status',
                    className: 'col-span-2',
                    render: (row) => (
                      <div className="flex flex-col gap-1">
                        <StatusBadge status={row.status} />
                        {row.status === 'VERIFIED' && (
                          <div className="flex flex-col">
                            <span className="text-[9px] font-black text-blue-500 dark:text-blue-400 border border-blue-500/20 px-1 inline-block w-fit rounded uppercase tracking-tighter mb-0.5 bg-blue-50/50 dark:bg-blue-950/20">
                              Verified
                            </span>
                            <span className="text-[9px] font-black text-emerald-500 dark:text-emerald-400 uppercase tracking-tighter">
                              Ready to accept
                            </span>
                          </div>
                        )}
                      </div>
                    ),
                  },
                  {
                    key: 'actions',
                    label: 'Operations',
                    className: 'col-span-2',
                    render: (row) => {
                      const isPending = row.request?.status === 'PENDING';
                      const isVerified = row.request?.status === 'VERIFIED';
                      const isAccepted = row.request?.status === 'ACCEPTED';

                      if (isAccepted) {
                        return (
                          <div className="flex items-center justify-end gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                            <CheckCircle size={16} /> <span>ACCEPTED</span>
                          </div>
                        );
                      }

                      return (
                        <div className="flex items-center justify-end gap-2">
                          {isVerified ? (
                            <button
                              type="button"
                              onClick={async (e) => {
                                e.stopPropagation(); // Prevent any accidental bubbling
                                const ok = await confirm({
                                  title: 'Finalize selection?',
                                  description: 'This will assign the pickup to this user.',
                                  confirmText: 'Accept & Close',
                                  cancelText: 'Cancel',
                                });
                                if (!ok) return;
                                try {
                                  await acceptListing(row.listing?.id, row.request?.id);
                                  toast({ variant: 'success', title: 'Success', description: 'Assigned!' });
                                } catch (err) {
                                  toast({ variant: 'danger', title: 'Action failed', description: err?.response?.data?.message || 'Error.' });
                                }
                              }}
                              className="h-9 px-4 rounded-xl bg-emerald-500 text-white font-bold text-[11px] tracking-tight hover:bg-emerald-600 transition-all flex items-center gap-2 shadow-sm shadow-emerald-500/20"
                            >
                              <CheckCircle size={14} /> Accept
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                  await verifyRequest(row.listing?.id, row.request?.id);
                                  toast({ variant: 'success', title: 'Verified', description: 'User ready for acceptance.' });
                                } catch (err) {
                                  toast({ variant: 'danger', title: 'Failed', description: 'Error.' });
                                }
                              }}
                              className="h-9 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-bold text-[11px] tracking-tight text-slate-600 dark:text-slate-300 hover:border-emerald-500/50 transition-all"
                            >
                              Verify ID
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={async (e) => {
                              e.stopPropagation();
                              const ok = await confirm({
                                title: 'Dismiss?',
                                confirmText: 'Dismiss',
                                confirmVariant: 'danger',
                              });
                              if (!ok) return;
                              try {
                                await rejectRequest(row.listing?.id, row.request?.id);
                              } catch (err) {}
                            }}
                            className="h-9 w-9 flex items-center justify-center rounded-xl bg-white dark:bg-slate-950 text-rose-500 border border-slate-200 dark:border-slate-800 shadow-sm hover:scale-105 transition-all"
                            title="Dismiss"
                          >
                            <XCircle size={16} />
                          </button>
                        </div>
                      );
                    },
                  },



                ]}
                rows={incomingRequestRows}
                emptyText="Queue is empty. Your listings will appear here when requested."
              />
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800/70 bg-white/70 dark:bg-slate-950/30 shadow-sm p-6 md:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">My requests</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Track the status of your pending food requests.</p>
                </div>
                <div className="text-[11px] font-black text-slate-500 dark:text-slate-400 tracking-widest uppercase bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  {myRequests.length} active
                </div>
              </div>

              <DataTable
                columns={[
                  {
                    key: 'request',
                    label: 'Request',
                    className: 'col-span-3',
                    render: (row) => (
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{row.title}</p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{row.note}</p>
                      </div>
                    ),
                  },
                  {
                    key: 'donor',
                    label: 'Donor',
                    className: 'col-span-2',
                    render: (row) => <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{row.counterpart}</span>,
                  },
                  {
                    key: 'location',
                    label: 'Location',
                    className: 'col-span-2',
                    render: (row) => <span className="text-sm text-slate-600 dark:text-slate-300">{row.location}</span>,
                  },
                  {
                    key: 'quantity',
                    label: 'Qty',
                    className: 'col-span-1',
                    render: (row) => <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{row.quantity}</span>,
                  },
                  {
                    key: 'status',
                    label: 'Status',
                    className: 'col-span-2',
                    render: (row) => <StatusBadge status={row.status} />,
                  },
                  {
                    key: 'actions',
                    label: 'Actions',
                    className: 'col-span-2',
                    render: (row) => (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={async () => {
                            const ok = await confirm({
                              title: 'Cancel request?',
                              description: 'This cancels your pending request for this listing.',
                              confirmText: 'Cancel request',
                              cancelText: 'Keep',
                              confirmVariant: 'danger',
                            });
                            if (!ok) return;
                            try {
                              await cancelRequest(row.listing?.id);
                              toast({ variant: 'success', title: 'Cancelled', description: 'You can request again anytime.' });
                            } catch (err) {
                              toast({ variant: 'danger', title: 'Cancel failed', description: err?.response?.data?.message || 'Only pending requests can be cancelled.' });
                            }
                          }}
                          className="h-9 px-3 rounded-xl bg-white/80 dark:bg-slate-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/70 dark:border-rose-900/60 text-xs font-semibold tracking-tight hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ),
                  },
                ]}
                rows={myRequestRows}
                emptyText="No pending requests. Browse Marketplace to request a pickup."
              />
            </div>
          )}

          {user?.role === 'RECEIVER' && (
            <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800/70 bg-white/70 dark:bg-slate-950/30 shadow-sm p-6 md:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Pickup queue</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Your approved items waiting to be picked up.</p>
                </div>
                <div className="text-[11px] font-black text-slate-500 dark:text-slate-400 tracking-widest uppercase bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  {filteredMyPickups.length} assigned
                </div>
              </div>

              <DataTable
                columns={[
                  {
                    key: 'pickup',
                    label: 'Pickup',
                    className: 'col-span-3',
                    render: (row) => (
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{row.title}</p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{row.counterpart}</p>
                      </div>
                    ),
                  },
                  {
                    key: 'location',
                    label: 'Location',
                    className: 'col-span-2',
                    render: (row) => <span className="text-sm text-slate-600 dark:text-slate-300">{row.location}</span>,
                  },
                  {
                    key: 'expiry',
                    label: 'Expiry',
                    className: 'col-span-2',
                    render: (row) => <span className="text-sm text-slate-600 dark:text-slate-300">{row.expiry}</span>,
                  },
                  {
                    key: 'quantity',
                    label: 'Qty',
                    className: 'col-span-1',
                    render: (row) => <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{row.quantity}</span>,
                  },
                  {
                    key: 'status',
                    label: 'Status',
                    className: 'col-span-2',
                    render: (row) => <StatusBadge status={row.status} />,
                  },
                  {
                    key: 'actions',
                    label: 'Actions',
                    className: 'col-span-2',
                    render: (row) => (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={async () => {
                            const ok = await confirm({
                              title: 'Cancel pickup?',
                              description: 'This reopens the listing for the marketplace.',
                              confirmText: 'Cancel pickup',
                              cancelText: 'Keep',
                              confirmVariant: 'danger',
                            });
                            if (!ok) return;
                            try {
                              await cancelListing(row.listing?.id);
                              toast({ variant: 'success', title: 'Pickup cancelled', description: 'The listing is available again.' });
                            } catch (err) {
                              toast({ variant: 'danger', title: 'Cancel failed', description: err?.response?.data?.message || 'Please refresh and try again.' });
                            }
                          }}
                          className="h-9 px-3 rounded-xl bg-white/80 dark:bg-slate-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/70 dark:border-rose-900/60 text-xs font-semibold tracking-tight hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ),
                  },
                ]}
                rows={pickupRows}
                emptyText="No assigned pickups yet."
              />
            </div>
          )}
        </div>

        <div className="space-y-6">

          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800/70 bg-white/70 dark:bg-slate-950/30 shadow-sm p-6 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">My listings</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Manage your active, available, and assigned food listings.</p>
              </div>
              <div className="text-[11px] font-black text-slate-500 dark:text-slate-400 tracking-widest uppercase bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
                {user?.role === 'DONOR' ? donorOwnedListings.length : foodListings.length} total
              </div>
            </div>

            <DataTable
              columns={[
                {
                  key: 'listing',
                  label: 'Listing',
                  className: 'col-span-3',
                  render: (row) => (
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">{row.title}</p>
                      <p className="mt-0.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">{row.category}</p>
                    </div>
                  ),
                },
                {
                  key: 'location',
                  label: 'Location',
                  className: 'col-span-4',
                  render: (row) => (
                    <div className="min-w-0">
                      <p className="text-[12px] font-medium text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed font-mono">
                        {row.location}
                      </p>
                    </div>
                  ),
                },
                {
                  key: 'quantity',
                  label: 'QTY',
                  className: 'col-span-2',
                  render: (row) => <span className="text-[13px] font-black text-slate-900 dark:text-white uppercase">{row.quantity}</span>,
                },
                {
                  key: 'status',
                  label: 'Status',
                  className: 'col-span-3',
                  render: (row) => (
                    <div className="flex flex-col items-start gap-1.5 md:items-end">
                      <StatusBadge status={row.status} />
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">
                        {row.status === 'ACCEPTED'
                          ? `Assigned: ${row.receiverName}`
                          : `Expires: ${row.expiry}`}
                      </span>
                    </div>
                  ),
                },

              ]}
              rows={listingRows}
              emptyText={user?.role === 'DONOR' ? 'No listings created yet.' : `No listings available for ${donorName}.`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
