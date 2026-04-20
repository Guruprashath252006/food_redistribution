import { useMemo, useState } from 'react';
import { useAppData } from '../context/appDataContext';
import BorderGlow from '../components/ui/BorderGlow';
import { History, Search, MapPin, Package, ShieldCheck, Clock, CheckCircle, Tag } from 'lucide-react';
import { useOverlay } from '../components/ui/overlayContext';

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

const Listings = () => {
  const { user, foodListings = [] } = useAppData();
  const { confirm, toast } = useOverlay();
  const [searchQuery, setSearchQuery] = useState('');

  // Get relevant history
  const historyRecords = useMemo(() => {
    const uid = (user?.id || '').toString();
    const uName = (user?.name || '').toLowerCase().trim();

    return foodListings.filter((item) => {
      // If Donor: show items they donated
      if (user?.role === 'DONOR') {
        if (item?.donorId && item.donorId === uid) return true;
        const dName = (item?.donorName || '').toLowerCase().trim();
        if (dName && dName === uName) return true;
        return false;
      }
      // If Receiver: show items they interacted with (requested or accepted)
      if (user?.role === 'RECEIVER') {
        if (item?.receiverId === uid) return true;
        const requests = Array.isArray(item?.requests) ? item.requests : [];
        if (requests.some(r => r.receiverId === uid)) return true;
        return false;
      }
      return false;
    }).sort((a, b) => Date.parse(b?.createdAt || 0) - Date.parse(a?.createdAt || 0));
  }, [foodListings, user]);

  const filteredRecords = historyRecords.filter((item) => {
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    const title = (item?.title || '').toLowerCase();
    const location = (item?.location || '').toLowerCase();
    const counterpart = (user?.role === 'DONOR' ? item?.receiverName : item?.donorName || '').toLowerCase();
    return title.includes(q) || location.includes(q) || counterpart.includes(q);
  });

  const fmtQty = (item) => {
    const qty = Number(item?.quantity);
    if (Number.isFinite(qty)) {
      return `${qty.toLocaleString(undefined, { maximumFractionDigits: 1 })} ${item?.unit || 'KG'}`.trim();
    }
    return `${item?.quantity || '0'} ${item?.unit || 'KG'}`.trim();
  };

  const handleViewDetails = async (item) => {
    await confirm({
      title: item?.title || 'Listing Details',
      description: item?.description || 'No additional description provided.',
      confirmText: 'Close',
      cancelText: 'Back',
    });
  };

  return (
    <div className="flex flex-col h-full animate-fade-in-up transition-colors duration-300 p-6 md:p-10">
      {/* Header Section */}
      <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[13px] font-black uppercase tracking-[0.2em] text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/30 dark:text-sky-300">
            <History size={15} /> All Listings & History
          </div>
          <h1 className="mt-4 text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            Historical Records
          </h1>
          <p className="mt-3 max-w-3xl text-sm font-semibold text-slate-600 dark:text-slate-300 md:text-base">
            Review all your past and current listings, orders, and pickups. This serves as your complete digital ledger for all interactions on the platform.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white/80 px-5 py-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-950/35 flex items-center justify-center gap-4">
          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Total Records</p>
            <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{filteredRecords.length}</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <BorderGlow 
          borderRadius={32}
          backgroundColor="transparent"
          className="mb-8 shadow-md shadow-slate-900/5 dark:shadow-none overflow-hidden glass"
        >
          <div className="p-4 flex flex-col items-center transition-all">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
              <input 
                type="text" 
                placeholder="Search history by title, location, or partner name..." 
                className="w-full bg-slate-100/30 dark:bg-slate-950/30 border border-transparent rounded-[1rem] py-4 pl-16 pr-6 text-sm font-bold text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 transition-all tracking-tight"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
      </BorderGlow>

      {/* Main Table Area */}
      <div className="pb-20">
          <BorderGlow 
            borderRadius={32}
            backgroundColor="transparent"
            className="shadow-xl shadow-slate-900/5 dark:shadow-none overflow-hidden glass border border-slate-200/60 dark:border-slate-800/60"
          >
            <div className="w-full">
              <div className="hidden lg:grid grid-cols-[2fr_1.5fr_1fr_1fr] gap-6 border-b border-slate-200/60 bg-gradient-to-r from-slate-50/80 to-white/40 px-8 py-6 dark:border-slate-800/60 dark:from-slate-900/60 dark:to-slate-950/20">
                <div className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-500">Item Details</div>
                <div className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-500">Partner & Location</div>
                <div className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-500">Status</div>
                <div className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-500 text-right">Details</div>
              </div>

              {filteredRecords.length === 0 ? (
                <div className="px-10 py-24 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                      <History size={32} className="opacity-50 text-slate-500" />
                    </div>
                    <p className="text-[16px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">No history found</p>
                    <p className="mt-2 text-sm opacity-80 max-w-sm">No historical records or current listings match your search criteria. Interact on the marketplace to build your ledger.</p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-slate-200/50 dark:divide-slate-800/50">
                  {filteredRecords.map((item) => {
                    const partnerName = user?.role === 'DONOR' ? (item.receiverName || 'Waiting...') : (item.donorName || 'Vendor');
                    
                    // Display status based on whether user is receiver and what their request status is
                    let displayStatus = item.status;
                    if (user?.role === 'RECEIVER') {
                       const myReq = (item.requests || []).find(r => r.receiverId === user?.id?.toString());
                       if (myReq) displayStatus = myReq.status;
                    }

                    return (
                      <div key={item.id} className="group px-5 py-6 transition-all duration-300 hover:bg-white/40 dark:hover:bg-slate-900/25 sm:px-8">
                        <div className="grid gap-6 lg:grid-cols-[2fr_1.5fr_1fr_1fr] lg:items-center">
                          {/* Item Details */}
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full border border-sky-300/60 bg-sky-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/30 dark:text-sky-300">
                                {item.category}
                              </span>
                              <span className="text-xs font-semibold text-slate-400 ml-2">
                                {new Date(item.createdAt || Date.now()).toLocaleDateString()}
                              </span>
                            </div>

                            <h3 className="mt-3 text-[1.5rem] leading-tight font-black tracking-tight text-slate-900 transition-colors duration-300 dark:text-white sm:text-[1.75rem]">
                              {item.title}
                            </h3>

                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                              <span className="inline-flex items-center gap-1.5 font-bold">
                                <Package size={14} className="text-slate-400" /> {fmtQty(item)}
                              </span>
                            </div>
                          </div>

                          {/* Partner & Location */}
                          <div className="flex flex-col justify-center">
                            <p className="truncate text-[15px] font-black uppercase tracking-tight text-slate-900 dark:text-white">
                              {partnerName}
                            </p>
                            <p className="mt-2 inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                              <MapPin size={12} className="text-sky-500" /> {item.location}
                            </p>
                          </div>

                          {/* Status */}
                          <div className="flex flex-col justify-center items-start">
                             <StatusBadge status={displayStatus} />
                             {displayStatus === 'ACCEPTED' && (
                               <p className="mt-2 text-xs font-semibold text-emerald-600 flex items-center gap-1">
                                 <CheckCircle size={12}/> Completed
                               </p>
                             )}
                          </div>

                          {/* Details / Action */}
                          <div className="flex justify-end items-center h-full">
                            <button
                              type="button"
                              onClick={() => handleViewDetails(item)}
                              className="h-10 px-5 rounded-2xl bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 font-bold text-[11px] tracking-[0.15em] uppercase hover:bg-slate-50 dark:hover:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex items-center gap-2 shadow-sm"
                            >
                              <History size={14} /> View Details
                            </button>
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </BorderGlow>
        </div>
    </div>
  );
};

export default Listings;
