import { useEffect, useMemo, useState } from 'react';
import { useAppData } from '../context/appDataContext';
import BorderGlow from '../components/ui/BorderGlow';
import { Activity, BrainCircuit, Globe, Leaf, Sparkles, TrendingUp, Users } from 'lucide-react';

const HISTORY_DAYS = 14;
const FORECAST_DAYS = 7;

const ImpactLive = () => {
  const { stats = {}, foodListings = [] } = useAppData();
  const [liveNow, setLiveNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setLiveNow(new Date()), 15000);
    return () => window.clearInterval(id);
  }, []);

  const acceptedListings = useMemo(
    () =>
      (foodListings || [])
        .filter((item) => item?.status === 'ACCEPTED')
        .slice()
        .sort((a, b) => Date.parse(b?.acceptedAt || b?.createdAt || 0) - Date.parse(a?.acceptedAt || a?.createdAt || 0)),
    [foodListings]
  );

  const fmtInt = (n) => {
    const num = Number(n || 0);
    return Number.isFinite(num) ? Math.round(num).toLocaleString() : '0';
  };

  const fmtKg = (n) => {
    const num = Number(n || 0);
    return Number.isFinite(num) ? `${num.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg` : '0 kg';
  };

  const timeline = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const history = [];
    for (let i = HISTORY_DAYS - 1; i >= 0; i -= 1) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      history.push({
        key: date.toISOString().slice(0, 10),
        label: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        kg: 0,
        type: 'actual',
      });
    }

    const historyMap = new Map(history.map((point) => [point.key, point]));
    acceptedListings.forEach((item) => {
      const stamp = Date.parse(item?.acceptedAt || item?.createdAt || '');
      if (!Number.isFinite(stamp)) return;
      const point = historyMap.get(new Date(stamp).toISOString().slice(0, 10));
      if (!point) return;
      point.kg += Number(item?.quantity) || 0;
    });

    const actuals = history.map((point) => point.kg);
    let ema = actuals[0] || 0;
    const emaSeries = actuals.map((value, index) => {
      ema = index === 0 ? value : (value * 0.45) + (ema * 0.55);
      return ema;
    });

    const recent = actuals.slice(-4);
    const previous = actuals.slice(-8, -4);
    const recentAvg = recent.length ? recent.reduce((sum, value) => sum + value, 0) / recent.length : 0;
    const previousAvg = previous.length ? previous.reduce((sum, value) => sum + value, 0) / previous.length : recentAvg;
    const momentum = recentAvg - previousAvg;

    const forecast = [];
    let forecastBase = emaSeries.at(-1) || 0;
    for (let i = 1; i <= FORECAST_DAYS; i += 1) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      forecastBase = Math.max(0, (forecastBase * 0.72) + (recentAvg * 0.28) + (momentum * 0.2));
      forecast.push({
        key: date.toISOString().slice(0, 10),
        label: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        kg: Number(forecastBase.toFixed(1)),
        type: 'forecast',
      });
    }

    const points = [...history, ...forecast];
    const max = Math.max(1, ...points.map((point) => point.kg));
    const projectedWeekKg = forecast.reduce((sum, point) => sum + point.kg, 0);
    const activeDays = history.filter((point) => point.kg > 0).length;
    const confidence = Math.max(58, Math.min(96, Math.round(65 + Math.min(activeDays, 10) * 2.5 - Math.abs(momentum) * 1.4)));

    return {
      points,
      max,
      confidence,
      projectedWeekKg,
      pacePerDay: history.reduce((sum, point) => sum + point.kg, 0) / HISTORY_DAYS,
      momentum,
    };
  }, [acceptedListings]);

  const chartPath = useMemo(() => {
    if (!timeline.points.length) return '';
    return timeline.points
      .map((point, index) => {
        // We calculate X and Y as percentages to be used in SVG viewBox="0 0 100 100".
        // The x-axis centers the dots directly over the column flex items.
        // There are `timeline.points.length` columns, so X needs to be at the center of each interval.
        const numPoints = timeline.points.length;
        const x = (index + 0.5) * (100 / numPoints);
        
        // The height maps exactly to the bar's `height` percentage (from bottom). 
        // We subtract from 100 because SVG's 0-y is at the top.
        // We use Math.max(2) just like the bars do.
        const barHeight = Math.max(2, (point.kg / timeline.max) * 100);
        const y = 100 - barHeight;
        
        return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(' ');
  }, [timeline]);

  return (
    <div className="flex flex-col h-full animate-fade-in-up transition-colors duration-300 p-6 md:p-10">
      <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[13px] font-black uppercase tracking-[0.2em] text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">
            <Globe size={15} /> Impact Records
          </div>
          <h1 className="mt-4 text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            Live impact intelligence
          </h1>
          <p className="mt-3 max-w-3xl text-sm font-semibold text-slate-600 dark:text-slate-300 md:text-base">
            Forecasts are generated from accepted listing history using adaptive smoothing and short-term momentum scoring, then refreshed live as new rescue activity appears.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white/80 px-5 py-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-950/35">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Last live sync</p>
          <p className="mt-2 text-lg font-black text-slate-900 dark:text-white">
            {liveNow.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Auto-refreshing every 15 seconds</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-8 space-y-8">
          <BorderGlow borderRadius={32} backgroundColor="#060010" className="overflow-visible shadow-2xl shadow-slate-900/5 dark:shadow-none">
            <div className="p-6 md:p-8">
              
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between mb-8">
                <div>
                  <p className="inline-flex items-center gap-2 rounded-full border border-sky-200/70 bg-sky-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/30 dark:text-sky-300">
                    <BrainCircuit size={14} /> Forecast Engine
                  </p>
                  <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                    Rescue Volume & Projection
                  </h2>
                  <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-300 max-w-md">
                    Real-time historical rescue volume mapped against a responsive 7-day algorithmic forecast.
                  </p>
                </div>

                <div className="flex flex-wrap gap-4 lg:justify-end">
                  <div className="rounded-[1.25rem] border border-slate-200/80 bg-white/70 p-5 min-w-[130px] dark:border-slate-800/80 dark:bg-slate-950/35 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">Total Rescued</p>
                    <p className="mt-1.5 text-2xl font-black text-slate-900 dark:text-white">{fmtKg(stats.totalRescuedKg)}</p>
                  </div>
                  <div className="rounded-[1.25rem] border border-slate-200/80 bg-white/70 p-5 min-w-[130px] dark:border-slate-800/80 dark:bg-slate-950/35 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-sky-600 dark:text-sky-400">Projected (7d)</p>
                    <p className="mt-1.5 text-2xl font-black text-slate-900 dark:text-white">{fmtKg(timeline.projectedWeekKg)}</p>
                  </div>
                  <div className="rounded-[1.25rem] border border-slate-200/80 bg-white/70 p-5 min-w-[130px] dark:border-slate-800/80 dark:bg-slate-950/35 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Model Conf.</p>
                    <p className="mt-1.5 text-2xl font-black text-slate-900 dark:text-white">{timeline.confidence}%</p>
                  </div>
                </div>
              </div>

              {/* Chart Body */}
              <div className="rounded-[2rem] border border-slate-200/80 bg-slate-50/50 p-6 sm:p-8 dark:border-slate-800/80 dark:bg-slate-950/20 relative pt-12">
                
                {/* Horizontal Grid lines */}
                <div className="absolute inset-x-8 top-12 bottom-12 flex flex-col justify-between pointer-events-none opacity-40 dark:opacity-20 z-0">
                   {[0, 1, 2, 3, 4].map((line) => (
                     <div key={line} className="w-full flex items-center justify-between border-b border-slate-300 dark:border-slate-700 h-[1px]"></div>
                   ))}
                </div>

                <div className="relative h-[280px] flex items-end gap-1 sm:gap-2 z-10 w-full">
                  
                  {timeline.points.map((point, i) => (
                    <div key={point.key} className="group relative flex h-full flex-1 flex-col items-center justify-end z-20">
                      
                      {/* Tooltip on Hover */}
                      <div className="absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[11px] font-bold px-3 py-1.5 rounded-lg whitespace-nowrap pointer-events-none z-50 transform -translate-y-full mb-2">
                        {fmtKg(point.kg)}
                      </div>

                      {/* Bar Container */}
                      <div className="flex-1 w-full flex flex-col justify-end items-center px-[5%] sm:px-[10%] relative z-10 w-[90%]">
                        <div
                          className={`w-full rounded-t-[8px] transition-all duration-700 ease-out 
                            ${point.type === 'forecast' 
                              ? 'bg-gradient-to-t from-sky-200/40 to-sky-400/60 dark:from-sky-900/40 dark:to-sky-500/60 border border-sky-400/50 border-b-0' 
                              : 'bg-gradient-to-t from-emerald-400 to-emerald-500 dark:from-emerald-700 dark:to-emerald-500 shadow-lg shadow-emerald-500/20'}
                            group-hover:opacity-80
                          `}
                          style={{ height: `${Math.max(2, (point.kg / timeline.max) * 100)}%` }}
                        />
                      </div>
                      
                      {/* X-Axis Label */}
                      <p className={`mt-3 text-center text-[10px] sm:text-[11px] font-black uppercase tracking-widest h-[20px] shrink-0
                        ${point.type === 'forecast' ? 'text-sky-600 dark:text-sky-400' : 'text-slate-500 dark:text-slate-400'}`}>
                        {i % 2 === 0 || window.innerWidth > 640 ? point.label.split(' ')[1] : ''}
                      </p>
                    </div>
                  ))}

                  {/* SVG Line Overlay */}
                  <div className="absolute inset-x-0 bottom-[32px] top-0 flex pointer-events-none z-30">
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full opacity-80">
                      <path d={chartPath} fill="none" stroke="#0ea5e9" strokeWidth="1.5" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>

            </div>
          </BorderGlow>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <BorderGlow borderRadius={28} backgroundColor="#060010" className="shadow-xl">
              <div className="p-6">
                <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                  <Users size={14} /> Partners engaged
                </p>
                <p className="mt-3 text-4xl font-black tabular-nums text-slate-900 dark:text-white">{fmtInt(stats.partnersEngaged)}</p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Unique donors and receivers participating in the active rescue graph.</p>
              </div>
            </BorderGlow>

            <BorderGlow borderRadius={28} backgroundColor="#060010" className="shadow-xl">
              <div className="p-6">
                <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                  <TrendingUp size={14} /> Daily rescue pace
                </p>
                <p className="mt-3 text-4xl font-black tabular-nums text-slate-900 dark:text-white">{fmtKg(timeline.pacePerDay)}</p>
                <p className={`mt-2 text-sm ${timeline.momentum >= 0 ? 'text-emerald-600 dark:text-emerald-300' : 'text-amber-600 dark:text-amber-300'}`}>
                  {timeline.momentum >= 0 ? 'Momentum is accelerating versus the previous window.' : 'Momentum is softer than the previous window.'}
                </p>
              </div>
            </BorderGlow>

            <BorderGlow borderRadius={28} backgroundColor="#060010" className="shadow-xl">
              <div className="p-6">
                <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                  <Sparkles size={14} /> Meal projection
                </p>
                <p className="mt-3 text-4xl font-black tabular-nums text-slate-900 dark:text-white">{fmtInt(timeline.projectedWeekKg * 2)}</p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Estimated next-week meal equivalents using the current rescue conversion model.</p>
              </div>
            </BorderGlow>
          </div>
        </div>

        <div className="xl:col-span-4 space-y-8">
          <BorderGlow borderRadius={32} backgroundColor="#060010" className="shadow-2xl">
            <div className="p-8">
              <h2 className="flex items-center gap-2 text-xl font-black tracking-tight text-slate-900 dark:text-white">
                <Activity size={20} /> Live impact ledger
              </h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Every accepted pickup updates this stream and the forecast model automatically.
              </p>

              {acceptedListings.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-slate-200 bg-white/60 p-6 dark:border-slate-800 dark:bg-slate-950/40">
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    No accepted listings yet. Accept a request from Dashboard to start generating live impact records.
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-3">
                  {acceptedListings.slice(0, 8).map((item) => (
                    <div key={item.id} className="rounded-2xl border border-slate-200/80 bg-white/70 p-4 dark:border-slate-800/80 dark:bg-slate-950/35">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{item.title}</p>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            {item.donorName || 'Donor'} to {item.receiverName || 'Receiver'}
                          </p>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            {new Date(item.acceptedAt || item.createdAt || Date.now()).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-slate-900 dark:text-slate-100">{fmtKg(item.quantity)}</p>
                          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-300">
                            ~{fmtInt((Number(item.quantity) || 0) * 2)} meals
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 rounded-2xl border border-emerald-200/70 bg-emerald-50/80 p-5 dark:border-emerald-900/50 dark:bg-emerald-950/20">
                <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.22em] text-emerald-700 dark:text-emerald-300">
                  <Leaf size={14} /> Why this forecast works
                </p>
                <p className="mt-3 text-sm text-emerald-900/80 dark:text-emerald-100/80">
                  The model blends recent accepted volume, activity frequency, and direction-of-change to keep projections responsive without overreacting to a single spike.
                </p>
              </div>
            </div>
          </BorderGlow>
        </div>
      </div>
    </div>
  );
};

export default ImpactLive;
