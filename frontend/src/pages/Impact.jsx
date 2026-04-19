import { useMemo } from 'react';
import { useAppData } from '../context/appDataContext';
import BorderGlow from '../components/ui/BorderGlow';
import { Calendar, Globe, Leaf, Users, Zap } from 'lucide-react';

const Impact = () => {
  const { stats = {}, foodListings = [] } = useAppData();

  const acceptedListings = useMemo(() => {
    return (foodListings || [])
      .filter((i) => i?.status === 'ACCEPTED')
      .slice()
      .sort(
        (a, b) =>
          Date.parse(b?.acceptedAt || b?.createdAt || 0) -
          Date.parse(a?.acceptedAt || a?.createdAt || 0),
      );
  }, [foodListings]);

  const fmtInt = (n) => {
    const num = Number(n || 0);
    return Number.isFinite(num) ? Math.round(num).toLocaleString() : '0';
  };

  const fmtKg = (n) => {
    const num = Number(n || 0);
    if (!Number.isFinite(num)) return '0 kg';
    return `${num.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg`;
  };

  const fmtTons = (n) => {
    const num = Number(n || 0);
    if (!Number.isFinite(num)) return '0.0 tons';
    return `${num.toLocaleString(undefined, { maximumFractionDigits: 2 })} tons`;
  };

  const series = useMemo(() => {
    const now = new Date();
    const days = 10;
    const out = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      out.push({
        key,
        label: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        kg: 0,
      });
    }
    const idx = new Map(out.map((p) => [p.key, p]));
    acceptedListings.forEach((it) => {
      const t = Date.parse(it?.acceptedAt || it?.createdAt || '');
      if (!Number.isFinite(t)) return;
      const key = new Date(t).toISOString().slice(0, 10);
      const p = idx.get(key);
      if (!p) return;
      p.kg += Number.isFinite(it?.quantity) ? it.quantity : 0;
    });
    const maxKg = Math.max(1, ...out.map((p) => p.kg));
    const maxMeals = Math.max(1, ...out.map((p) => p.kg * 2));
    return { points: out, maxKg, maxMeals };
  }, [acceptedListings]);

  return (
    <div className="flex flex-col h-full animate-fade-in-up transition-colors duration-300 p-6 md:p-10">
      <div className="mb-10">
        <div className="inline-flex bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full mb-3 border border-emerald-100 dark:border-emerald-800 shadow-sm transition-all">
          <span className="text-[14px] font-black text-emerald-600 dark:text-emerald-400 tracking-[0.2em] uppercase flex items-center">
            <Globe size={16} className="mr-2" /> Impact Records
          </span>
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
          <div className="w-full lg:w-auto">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">
               Impact Summary
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-3 text-sm sm:text-lg font-bold tracking-tight max-w-2xl">
              Real-time analytics derived from your accepted listings and community distribution.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-900/5 transition-all">
            <button className="primary-button flex items-center text-[16px] px-6 py-2.5" type="button">
              <Calendar size={18} className="mr-2" /> Export (Demo)
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 flex-1">
        <div className="xl:col-span-8 space-y-8">
          
          {/* Rescue Volume Chart */}
          <BorderGlow
            borderRadius={32}
            backgroundColor="#060010"
            className="shadow-2xl shadow-slate-900/5 dark:shadow-none overflow-visible w-full"
          >
            <div className="p-6 md:p-10">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    Rescue Volume (last 10 days)
                  </h2>
                  <p className="text-[12px] sm:text-[13px] font-semibold text-slate-500 dark:text-slate-400 mt-1">
                    Daily quantity of food rescued in Kilograms.
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="px-4 py-2 rounded-2xl bg-white/60 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800">
                    <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 tracking-widest uppercase">
                       rescued
                    </p>
                    <p className="text-lg font-black text-slate-900 dark:text-white tabular-nums">
                      {fmtKg(stats.totalRescuedKg)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="h-[180px] sm:h-[220px] flex items-end gap-2">
                {series.points.map((p) => (
                  <div key={p.key} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full h-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-950/40 overflow-hidden flex items-end">
                      <div
                        className="w-full bg-emerald-600/75 dark:bg-emerald-500/60 transition-all duration-700 ease-out"
                        style={{ height: `${Math.round((p.kg / series.maxKg) * 100)}%` }}
                        title={`${p.kg.toFixed(1)} kg`}
                      />
                    </div>
                    <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">{p.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </BorderGlow>

          {/* Meals Distributed Chart */}
          <BorderGlow
            borderRadius={32}
            backgroundColor="#060010"
            className="shadow-2xl shadow-slate-900/5 dark:shadow-none overflow-visible w-full"
          >
            <div className="p-6 md:p-10">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    Meals Shared (last 10 days)
                  </h2>
                  <p className="text-[12px] sm:text-[13px] font-semibold text-slate-500 dark:text-slate-400 mt-1">
                    Computed daily meal equivalents distributed to those in need.
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="px-4 py-2 rounded-2xl bg-white/60 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800">
                    <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 tracking-widest uppercase">
                       Total Meals
                    </p>
                    <p className="text-lg font-black text-slate-900 dark:text-white tabular-nums">
                      {fmtInt(stats.mealsEquivalents)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="h-[180px] sm:h-[220px] flex items-end gap-2">
                {series.points.map((p) => (
                  <div key={p.key} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full h-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-950/40 overflow-hidden flex items-end">
                      <div
                        className="w-full bg-blue-600/75 dark:bg-blue-500/60 transition-all duration-700 ease-out"
                        style={{ height: `${Math.round(((p.kg * 2) / series.maxMeals) * 100)}%` }}
                        title={`${Math.round(p.kg * 2)} meals`}
                      />
                    </div>
                    <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">{p.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </BorderGlow>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <BorderGlow borderRadius={28} backgroundColor="#060010" className="shadow-xl">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 tracking-widest uppercase flex items-center gap-2">
                    <Users size={14} /> Partners Engaged
                  </p>
                  <span className="text-[11px] font-black text-slate-500 dark:text-slate-400">From entered data</span>
                </div>
                <p className="mt-3 text-4xl font-black text-slate-900 dark:text-white tabular-nums">{fmtInt(stats.partnersEngaged)}</p>
              </div>
            </BorderGlow>

            <BorderGlow borderRadius={28} backgroundColor="#060010" className="shadow-xl">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 tracking-widest uppercase flex items-center gap-2">
                    <Zap size={14} /> Water Saved (L)
                  </p>
                  <span className="text-[11px] font-black text-slate-500 dark:text-slate-400">From accepted KG</span>
                </div>
                <p className="mt-3 text-4xl font-black text-slate-900 dark:text-white tabular-nums">{fmtInt(stats.waterSavedLiters)}</p>
              </div>
            </BorderGlow>

            <BorderGlow borderRadius={28} backgroundColor="#060010" className="shadow-xl">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 tracking-widest uppercase flex items-center gap-2">
                    <Leaf size={14} /> Meal-Equivalents
                  </p>
                  <span className="text-[11px] font-black text-slate-500 dark:text-slate-400">From accepted KG</span>
                </div>
                <p className="mt-3 text-4xl font-black text-slate-900 dark:text-white tabular-nums">{fmtInt(stats.mealsEquivalents)}</p>
              </div>
            </BorderGlow>
          </div>
        </div>

        <div className="xl:col-span-4 space-y-8">
          <BorderGlow borderRadius={32} backgroundColor="#060010" className="shadow-2xl">
            <div className="p-8">
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-6">
                Recent Accepted Listings
              </h2>
              {acceptedListings.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-950/40 p-6">
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    No accepted listings yet. Accept a request from Dashboard to populate impact records.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {acceptedListings.slice(0, 8).map((it) => (
                    <div
                      key={it.id}
                      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-950/40 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{it.title}</p>
                          <p className="mt-1 text-[12px] text-slate-500 dark:text-slate-400">
                            {it.donorName ? `Donor: ${it.donorName}` : 'Donor: —'} •{' '}
                            {it.receiverName ? `Receiver: ${it.receiverName}` : 'Receiver: —'}
                          </p>
                        </div>
                        <p className="text-sm font-black text-slate-900 dark:text-slate-100 tabular-nums whitespace-nowrap">
                          {fmtKg(it.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </BorderGlow>
        </div>
      </div>
    </div>
  );
};

export default Impact;
