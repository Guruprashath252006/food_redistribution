import { useMemo, useState } from 'react';
import { useAppData } from '../context/appDataContext';
import BorderGlow from '../components/ui/BorderGlow';
import { useOverlay } from '../components/ui/overlayContext';
import { Search, MapPin, Clock, ArrowRight, ShieldCheck, Tag, Info, ShoppingCart, Waves } from 'lucide-react';

const Marketplace = () => {
	    const { user, availableItems, requestListing, cancelRequest } = useAppData();
      const { prompt, toast, confirm, form } = useOverlay();
	    const [searchQuery, setSearchQuery] = useState('');
	    const [selectedCategory, setSelectedCategory] = useState('All');

    const categories = useMemo(() => {
      const set = new Set((availableItems || []).map((i) => i?.category).filter(Boolean));
      return ['All', ...Array.from(set)];
    }, [availableItems]);

    const filteredItems = useMemo(() => {
      const q = searchQuery.trim().toLowerCase();
      return (availableItems || []).filter((item) => {
        if (item?.status !== 'AVAILABLE') return false;
        if (selectedCategory !== 'All' && item?.category !== selectedCategory) return false;
        if (!q) return true;
        const title = (item?.title || '').toLowerCase();
        const location = (item?.location || '').toLowerCase();
        const vendor = (item?.donorName || item?.vendor || '').toLowerCase();
        return title.includes(q) || location.includes(q) || vendor.includes(q);
      });
    }, [availableItems, searchQuery, selectedCategory]);

    const fmtQty = (item) => {
      const qty = Number(item?.quantity);
      if (Number.isFinite(qty)) {
        return `${qty.toLocaleString(undefined, { maximumFractionDigits: 1 })} ${item?.unit || ''}`.trim();
      }
      return `${item?.quantity || '0'} ${item?.unit || ''}`.trim();
    };

    const statusLabel = (item) => {
      const requests = Array.isArray(item?.requests) ? item.requests : [];
      const uid = (user?.id || '').toString();
      const myReq = requests.find(r => r?.receiverId === uid && !['REJECTED', 'CANCELLED'].includes(r?.status));
      if (myReq?.status === 'VERIFIED') return 'Verified';
      if (myReq?.status === 'PENDING') return 'Pending';
      return 'In stock';
    };

	    const handleRequest = async (itemId) => {
        const note =
          (await prompt({
            title: 'Request pickup',
            description: 'Optional note to the donor (pickup time, contact, etc.).',
            inputLabel: 'Message (optional)',
            placeholder: 'e.g. “We can pick up by 7pm. Contact +91…”',
            defaultValue: '',
            confirmText: 'Send request',
            cancelText: 'Cancel',
          })) ?? null;

        if (note === null) return;

        try {
          const ok = await requestListing(itemId, note);
          if (ok) {
            toast({ variant: 'success', title: 'Request sent', description: 'Track status in your Dashboard.' });
          }
        } catch (err) {
          toast({ variant: 'danger', title: 'Request failed', description: err?.response?.data?.message || 'This listing may no longer be available.' });
        }
	    };

	    const handleCancelRequest = async (itemId) => {
        try {
          await cancelRequest(itemId);
          toast({ variant: 'success', title: 'Request cancelled', description: 'You can request again anytime.' });
        } catch (err) {
          toast({ variant: 'danger', title: 'Cancel failed', description: err?.response?.data?.message || 'Only pending requests can be cancelled.' });
        }
	    };

      const handleViewDetails = async (item) => {
        await confirm({
          title: item?.title || 'Food item details',
          description: item?.description || 'No additional description has been added for this listing yet.',
          confirmText: 'Close',
          cancelText: 'Back',
        });
      };

      const handleStructuredRequest = async (itemId) => {
        const today = new Date().toISOString().slice(0, 10);
        const details =
          (await form({
            title: 'Request pickup',
            description: 'Enter your mobile number, pickup date, time, AM/PM, and any message for the donor.',
            confirmText: 'Send request',
            cancelText: 'Cancel',
            fields: [
              {
                id: 'mobile',
                label: 'Mobile number',
                type: 'tel',
                placeholder: 'e.g. +91 98765 43210',
              },
              {
                id: 'pickup_date',
                label: 'Pickup date',
                type: 'date',
                defaultValue: today,
              },
              {
                id: 'pickup_time',
                label: 'Pickup time',
                type: 'time',
              },
              {
                id: 'period',
                label: 'AM / PM',
                type: 'select',
                defaultValue: 'PM',
                options: [
                  { value: 'AM', label: 'AM' },
                  { value: 'PM', label: 'PM' },
                ],
              },
              {
                id: 'message',
                label: 'Message',
                type: 'textarea',
                rows: 3,
                fullWidth: true,
                placeholder: 'Add pickup notes for the donor...',
              },
            ],
          })) ?? null;

        if (details === null) return;

        const noteParts = [
          details.mobile ? `Mobile: ${details.mobile}` : '',
          details.pickup_date ? `Date: ${details.pickup_date}` : '',
          details.pickup_time ? `Time: ${details.pickup_time}${details.period ? ` ${details.period}` : ''}` : '',
          details.message ? `Message: ${details.message}` : '',
        ].filter(Boolean);

        try {
          await requestListing(itemId, noteParts.join(' | '));
          toast({ variant: 'success', title: 'Request sent', description: 'Track status in your Dashboard.' });
        } catch (err) {
          toast({ variant: 'danger', title: 'Request failed', description: err?.response?.data?.message || 'This listing may no longer be available.' });
        }
      };

    return (
      <div className="flex flex-col h-full animate-fade-in-up transition-colors duration-300">
        {/* Header Section */}
        <div className="mb-12">
          <div className="inline-flex glass px-4 py-1.5 rounded-full mb-4 border border-emerald-100/20 dark:border-emerald-900/50 shadow-sm">
             <span className="text-[14px] font-black text-emerald-600 dark:text-emerald-400 tracking-[0.25em] uppercase flex items-center">
               <Waves size={18} className="mr-2 animate-pulse" /> Live Marketplace
             </span>
          </div>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 md:gap-8">
            <div className="w-full md:w-auto">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">
                Surplus <span className="text-gradient">Exchange</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-4 text-lg sm:text-xl font-medium tracking-tight max-w-2xl leading-snug">
                Claim high-quality surplus food from local retailers in real-time. Verified quality and instant pickup within your community.
              </p>
            </div>
            
            <div className="flex bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl p-2 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-2xl">
              <button className="primary-button flex items-center text-[16px] px-8 py-3.5">
                <ShoppingCart size={20} className="mr-2" /> View My Orders
              </button>
            </div>
          </div>
        </div>
  
        {/* Search & Filters */}
        <BorderGlow 
          borderRadius={48}
          backgroundColor="transparent"
          className="mb-12 shadow-2xl shadow-slate-900/5 dark:shadow-none overflow-hidden glass"
        >
          <div className="p-5 flex flex-col xl:flex-row items-center gap-6 transition-all">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-emerald-500" size={22} />
              <input 
                type="text" 
                placeholder="Search vendor name, item, or location..." 
                className="w-full bg-slate-100/50 dark:bg-slate-950/50 border border-transparent rounded-[1.5rem] py-5 pl-20 pr-8 text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all tracking-tight"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap gap-2 md:gap-3">
                        {categories.map((cat) => (
                            <button 
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 sm:px-5 md:px-8 py-2 md:py-3.5 rounded-xl md:rounded-2xl text-[11px] sm:text-[12px] md:text-[14px] font-black uppercase tracking-widest transition-all ${
                                    selectedCategory === cat 
                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                                    : 'bg-white dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/30'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
          </div>
        </BorderGlow>
  
        {/* Table Area */}
        <div className="pb-20">
          <BorderGlow 
            borderRadius={40}
            backgroundColor="transparent"
            className="shadow-2xl shadow-slate-900/5 dark:shadow-none overflow-hidden glass border border-slate-200/60 dark:border-slate-800/60"
          >
            <div className="w-full">
              <div className="hidden lg:grid grid-cols-[2fr_1.15fr_0.85fr_0.95fr_1fr] gap-6 border-b border-slate-200/60 bg-gradient-to-r from-slate-50/80 to-white/40 px-8 py-6 dark:border-slate-800/60 dark:from-slate-900/60 dark:to-slate-950/20">
                <div className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-500">Listing details</div>
                <div className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-500">Source</div>
                <div className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-500 text-center">Available</div>
                <div className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-500">Terms</div>
                <div className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-500 text-right">Action</div>
              </div>

              {filteredItems.length === 0 ? (
                <div className="px-10 py-20 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                      <Search size={32} className="opacity-50" />
                    </div>
                    <p className="text-[16px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">No matches found</p>
                    <p className="mt-2 text-sm opacity-80">Adjust your search or filters to see more available listings.</p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-slate-200/50 dark:divide-slate-800/50">
                  {filteredItems.map((item) => {
                    const requests = Array.isArray(item?.requests) ? item.requests : [];
                    const uid = (user?.id || '').toString();
                    const myReq = requests.find(r => r?.receiverId === uid && !['REJECTED', 'CANCELLED'].includes(r?.status));
                    const requestStatus = myReq?.status;

                    return (
                      <div key={item.id} className="group px-5 py-5 transition-all duration-300 hover:bg-white/40 dark:hover:bg-slate-900/25 sm:px-8">
                        <div className="grid gap-6 lg:grid-cols-[2fr_1.15fr_0.85fr_0.95fr_1fr] lg:items-center">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full border border-emerald-300/60 bg-emerald-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">
                                {item.category}
                              </span>
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-slate-600 shadow-sm dark:border-slate-700/70 dark:bg-slate-900 dark:text-slate-300">
                                <ShieldCheck size={12} className="text-emerald-500" /> Verified
                              </span>
                            </div>

                            <h3 className="mt-3 text-[1.85rem] leading-tight font-black tracking-tight text-slate-900 transition-colors duration-300 group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-400 sm:text-[2rem]">
                              {item.title}
                            </h3>



                            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                              <span className="inline-flex items-center gap-1.5">
                                <MapPin size={14} className="text-emerald-500" /> {item.location}
                              </span>
                              <span className="inline-flex items-center gap-1.5">
                                <Clock size={14} className="text-emerald-500" /> {item.expiry}
                              </span>
                              <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-300">
                                {statusLabel(item)}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col justify-center">
                            <p className="truncate text-[16px] font-black uppercase tracking-tight text-slate-900 dark:text-white">
                              {item.vendor || item.donorName || 'Local Retailer'}
                            </p>
                            <p className="mt-1.5 inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                              <MapPin size={12} className="text-emerald-500" /> {item.location}
                            </p>
                          </div>

                          <div className="flex flex-col justify-center lg:text-center">
                            <p className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">{fmtQty(item)}</p>
                            <p className="mt-1.5 text-[11px] font-black uppercase tracking-[0.24em] text-emerald-500">
                              {statusLabel(item)}
                            </p>
                          </div>

                          <div className="flex flex-col justify-center gap-3">
                            <div className="flex items-center text-[12px] font-black uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
                              <Clock size={14} className="mr-2 text-emerald-500" /> Life: <span className="ml-[6px] text-slate-900 dark:text-white">{item.expiry}</span>
                            </div>
                            <div className="flex items-center text-[12px] font-black uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
                              <Tag size={14} className="mr-2 text-blue-500" /> Cost: <span className="ml-[6px] text-slate-900 dark:text-white">Free pickup</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                            {user?.role === 'RECEIVER' ? (
                              requestStatus === 'PENDING' || requestStatus === 'VERIFIED' ? (
                                <>
                                  <button
                                    disabled
                                    className="inline-flex items-center rounded-2xl border border-slate-200 bg-slate-100 px-5 py-3 text-[12px] font-black uppercase tracking-[0.18em] text-slate-500 opacity-80 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                  >
                                    {requestStatus === 'VERIFIED' ? 'Verified' : 'Pending'}
                                  </button>
                                  <button
                                    onClick={() => handleCancelRequest(item.id)}
                                    className="inline-flex items-center rounded-2xl border border-rose-200 bg-white px-5 py-3 text-[12px] font-black uppercase tracking-[0.18em] text-rose-600 transition-colors hover:bg-rose-50 dark:border-rose-900/60 dark:bg-slate-950 dark:text-rose-300 dark:hover:bg-rose-950/30"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleViewDetails(item)}
                                    className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:border-emerald-300 hover:text-emerald-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-emerald-900/60 dark:hover:text-emerald-300"
                                    title="View details"
                                  >
                                    <Info size={18} />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleStructuredRequest(item.id)}
                                    className="inline-flex items-center rounded-2xl bg-emerald-600 px-6 py-3 text-[12px] font-black uppercase tracking-[0.18em] text-white shadow-lg shadow-emerald-600/20 transition-colors hover:bg-emerald-700"
                                  >
                                    Request
                                    <ArrowRight size={16} className="ml-2" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleViewDetails(item)}
                                    className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:border-emerald-300 hover:text-emerald-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-emerald-900/60 dark:hover:text-emerald-300"
                                    title="View details"
                                  >
                                    <Info size={18} />
                                  </button>
                                </>
                              )
                            ) : (
                              <>
                                <button
                                  disabled
                                  className="inline-flex items-center rounded-2xl border border-slate-200 bg-slate-100 px-5 py-3 text-[12px] font-black uppercase tracking-[0.18em] text-slate-500 opacity-75 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                >
                                  Donor view
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleViewDetails(item)}
                                  className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:border-emerald-300 hover:text-emerald-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-emerald-900/60 dark:hover:text-emerald-300"
                                  title="View details"
                                >
                                  <Info size={18} />
                                </button>
                              </>
                            )}
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
  
export default Marketplace;
