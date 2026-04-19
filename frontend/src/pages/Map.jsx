import { useState } from 'react';
import { Truck, Navigation, Search, MapPin, Leaf, Star, ChevronRight, Loader2, LocateFixed, ExternalLink } from 'lucide-react';
import BorderGlow from '../components/ui/BorderGlow';
import { useOverlay } from '../components/ui/overlayContext';

const MapPage = () => {
    // States
    const [userLocation, setUserLocation] = useState(null);
    const [sourceQuery, setSourceQuery] = useState("");
    const [destQuery, setDestQuery] = useState("");
    const { toast } = useOverlay();
    
    // Active validated route payload
    const [activeRoute, setActiveRoute] = useState(null);
    
    const [distanceKm, setDistanceKm] = useState(null);
    const [durationMin, setDurationMin] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const formatDuration = (minutes) => {
      const m = Number(minutes);
      if (!Number.isFinite(m) || m <= 0) return null;
      const rounded = Math.round(m);
      if (rounded < 60) return `${rounded} MIN`;
      const hours = Math.floor(rounded / 60);
      const mins = rounded % 60;
      if (mins === 0) return `${hours} HR`;
      return `${hours} HR ${mins} MIN`;
    };

    const haversineKm = (a, b) => {
      const toRad = (v) => (v * Math.PI) / 180;
      const R = 6371;
      const dLat = toRad(b.lat - a.lat);
      const dLon = toRad(b.lon - a.lon);
      const lat1 = toRad(a.lat);
      const lat2 = toRad(b.lat);
      const s =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
      return 2 * R * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
    };

    const geocode = async (query) => {
      const q = (query || '').trim();
      if (!q) return null;
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`,
        { headers: { Accept: 'application/json' } },
      );
      if (!res.ok) return null;
      const data = await res.json();
      const top = Array.isArray(data) ? data[0] : null;
      if (!top?.lat || !top?.lon) return null;
      return { lat: Number(top.lat), lon: Number(top.lon), label: top.display_name };
    };

    const routeByOSRM = async (src, dst) => {
      const url = `https://router.project-osrm.org/route/v1/driving/${src.lon},${src.lat};${dst.lon},${dst.lat}?overview=false&alternatives=false&steps=false`;
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!res.ok) return null;
      const data = await res.json();
      const r = data?.routes?.[0];
      if (!r) return null;
      return { distanceMeters: r.distance, durationSeconds: r.duration };
    };

    // Initial Geolocation Capture parsing straight to Source Input + Reverse Geocoding
    const locateUser = () => {
        setIsLoading(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    setUserLocation({ lat, lng });
                    
                    try {
                        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
                          headers: { Accept: 'application/json' },
                        });
                        const data = await response.json();
                        if (data && data.display_name) {
                            const addressParts = data.display_name.split(', ');
                            const cleanAddress = addressParts.slice(0, 4).join(', ');
                            setSourceQuery(cleanAddress);
                        } else {
                            setSourceQuery(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
                        }
                    } catch {
                        setSourceQuery(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
                        toast({
                          variant: 'danger',
                          title: 'Reverse geocoding unavailable',
                          description: 'Using coordinates. You can still type a source address manually.',
                        });
                    }
                    
                    setIsLoading(false);
                },
                (error) => {
                    console.error("Geolocation failed:", error);
                    setIsLoading(false);
                    toast({
                      variant: 'danger',
                      title: 'Location permission blocked',
                      description: 'Type a source address manually to create a route.',
                    });
                }
            );
        } else {
            setIsLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!destQuery.trim()) return;
        
        setIsLoading(true);
        
        // Define fallback source if user didn't enter anything but we have GPS
        let finalSource = sourceQuery;
        if (!finalSource && userLocation) {
            finalSource = `${userLocation.lat},${userLocation.lng}`;
        } else if (!finalSource) {
            finalSource = "India"; // safe fallback
        }

        try {
          const [src, dst] = await Promise.all([geocode(finalSource), geocode(destQuery)]);
          if (!src || !dst) {
            toast({
              variant: 'danger',
              title: 'Route lookup failed',
              description: 'Could not find coordinates for the entered locations. Try a more specific address.',
            });
            setIsLoading(false);
            return;
          }

          const route = await routeByOSRM(src, dst);
          const fallbackKm = haversineKm(src, dst);
          const nextKm = route?.distanceMeters ? route.distanceMeters / 1000 : fallbackKm;
          const nextMin = route?.durationSeconds ? route.durationSeconds / 60 : null;

          setActiveRoute({ source: finalSource, dest: destQuery });
          setDistanceKm(Number(nextKm.toFixed(1)));
          setDurationMin(nextMin ? Math.round(nextMin) : null);
        } catch {
          toast({
            variant: 'danger',
            title: 'Routing unavailable',
            description: 'Showing the map route, but distance calculation is temporarily unavailable.',
          });
          setDistanceKm(null);
          setDurationMin(null);
          setActiveRoute({ source: finalSource, dest: destQuery });
        } finally {
          setIsLoading(false);
        }
    };

    const fleetRecommendation = (() => {
      if (!distanceKm || distanceKm <= 0) return { fleetsNeeded: 0, tier: 'IDLE', tips: [] };
      const fleetsNeeded = distanceKm > 120 ? 3 : distanceKm > 60 ? 2 : 1;
      const tier = distanceKm > 120 ? 'LONG-HAUL' : distanceKm > 30 ? 'MID-ROUTE' : 'LOCAL';
      const tips = [];
      if (distanceKm > 60) tips.push('Batch pickups and schedule a fixed ETA window.');
      if (distanceKm > 120) tips.push('Use a larger vehicle + cold-chain if needed.');
      if (distanceKm <= 15) tips.push('Prefer same-hour pickup to reduce spoilage risk.');
      tips.push('Share route link with receiver before departure.');
      return { fleetsNeeded, tier, tips };
    })();

    const emissionEstimateKg = distanceKm && distanceKm > 0 ? Number((distanceKm * 0.18).toFixed(1)) : null;

    // Embed structure for native Google Map Pins & Routes
    let mapSrc = `https://maps.google.com/maps?q=India&t=&z=5&ie=UTF8&iwloc=&output=embed`;
    
    // If we have an active dual route mapping
    if (activeRoute) {
        mapSrc = `https://maps.google.com/maps?saddr=${encodeURIComponent(activeRoute.source)}&daddr=${encodeURIComponent(activeRoute.dest)}&ie=UTF8&output=embed`;
    } else if (userLocation) {
        // Just show their location if no dest entered yet. Uses higher zoom.
        mapSrc = `https://maps.google.com/maps?q=${userLocation.lat},${userLocation.lng}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
    }

    return (
      <div className="flex flex-col h-full animate-fade-in-up transition-colors duration-300">
        
        <div className="mb-10">
          <div className="inline-flex bg-orange-50 dark:bg-orange-900/30 px-3 py-1 rounded-full mb-3 border border-orange-100 dark:border-orange-800 shadow-sm transition-all">
             <span className="text-[10px] font-black text-orange-600 dark:text-orange-400 tracking-[0.2em] uppercase flex items-center"><Truck size={12} className="mr-2" /> Dispatch Systems & Routing</span>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex-1 w-full md:w-auto">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">Google Maps Router</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-3 text-sm sm:text-lg font-bold tracking-tight max-w-2xl">Push food rescue assignments straight to Google Navigation within Tamil Nadu bounds.</p>
            </div>
            
            {/* Split Dual-Routing Form */}
            <form onSubmit={handleSearch} className="w-full md:w-[450px] flex flex-col gap-3 group bg-white/50 dark:bg-slate-900/50 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-none">
               
               {/* SOURCE INPUT */}
               <div className="relative w-full">
                   <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] pointer-events-none"></div>
                   <input 
                     type="text"
                     placeholder="Pickup Source (Use GPS or Type)..."
                     className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3.5 pl-10 pr-14 text-[15px] font-semibold tracking-tight text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500/50 transition-all"
                     value={sourceQuery}
                     onChange={(e) => setSourceQuery(e.target.value)}
                     disabled={isLoading}
                   />
                   <button 
                     type="button" 
                     onClick={locateUser}
                     title="Fetch Live GPS Location"
                     className={`absolute right-1.5 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${userLocation ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-blue-50 hover:text-blue-500'}`}
                   >
                     <LocateFixed size={18} className={isLoading ? "animate-pulse" : ""} />
                   </button>
               </div>
               
               {/* Visual Path Connector */}
               <div className="absolute top-[38%] transform -translate-y-1/2 left-8 w-0.5 h-6 bg-slate-200 dark:bg-slate-700 mx-auto hidden md:block z-0"></div>
               
               {/* DESTINATION INPUT */}
               <div className="relative w-full z-10">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors pointer-events-none" size={16} />
                   <input 
                     type="text"
                     placeholder="Dropoff Destination (e.g. Madurai)..."
                     className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3.5 pl-10 pr-14 text-[15px] font-semibold tracking-tight text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-500/50 transition-all shadow-sm"
                     value={destQuery}
                     onChange={(e) => setDestQuery(e.target.value)}
                     disabled={isLoading}
                   />
                   <button 
                     type="submit" 
                     disabled={isLoading || !destQuery.trim()}
                     className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
                   >
                     {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Navigation size={16} />}
                   </button>
               </div>

            </form>
          </div>
        </div>
  
        {/* Significantly expanded min tracking map height up to 800px constraint */}
        <div className="flex flex-col xl:flex-row gap-6 md:gap-8 flex-1 min-h-[500px] lg:min-h-[700px] xl:min-h-[800px] relative z-0">
          
          {/* Main Embedded Google Maps Full Canvas */}
          <BorderGlow 
            borderRadius={32}
            backgroundColor="#060010"
            className="flex-[2_2_0%] relative overflow-hidden shadow-2xl shadow-emerald-900/10 dark:shadow-none group transition-all w-full h-[400px] sm:h-auto"
          >
            <div className="absolute inset-x-0 inset-y-0 rounded-[2rem] bg-slate-100 dark:bg-slate-950 overflow-hidden border border-slate-200 dark:border-slate-800/50 z-10 p-2">
                
                {/* Embed container ensuring responsiveness and clean clipping over maximum width */}
                <div className="w-full h-full rounded-[2.5rem] overflow-hidden relative bg-slate-200 dark:bg-slate-900">
                    <iframe 
                        title="Google Navigation Features"
                        className={`w-full h-full transition-opacity duration-700 ${isLoading ? 'opacity-50 blur-sm' : 'opacity-100'}`}
                        frameBorder="0" 
                        scrolling="yes" 
                        marginHeight="0" 
                        marginWidth="0" 
                        src={mapSrc}
                        style={{ border: 0 }}
                        referrerPolicy="no-referrer-when-downgrade"
                        allow="geolocation"
                        allowFullScreen
                    ></iframe>
                </div>
               
               {/* Moved status board down to avoid overlapping core Google map routing navigation clicks */}
               {activeRoute && (
               <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-full px-6 py-3 flex items-center shadow-2xl z-[400] border border-slate-200/50 dark:border-slate-700/50 pointer-events-none">
                 <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                     <Navigation size={14} className="animate-pulse" />
                 </div>
                 <div className="ml-4 flex items-center gap-4">
                     <div>
                       <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 tracking-widest uppercase">Target Vector</p>
                       <p className="text-sm font-black text-slate-900 dark:text-white leading-none tracking-tight">
                           {destQuery.slice(0, 20)}
                       </p>
                     </div>
                     <div className="h-6 w-px bg-slate-200 dark:bg-slate-700"></div>
                     <div>
                       <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                           Live Tracking{' '}
                           <span className="text-xs text-slate-400 dark:text-slate-500 font-bold ml-1 uppercase">
                             | {distanceKm ? `${distanceKm} KM` : '—'}
                           </span>
                       </p>
                     </div>
                 </div>
               </div>
               )}
            </div>
          </BorderGlow>
     
          {/* Right Data Strip - Pushed to the side taking less priority visually now */}
          <div className="w-full xl:w-80 flex flex-col gap-8 h-full">
             
             {/* Impact Stats */}
             <BorderGlow 
                borderRadius={32}
                backgroundColor="#060010"
                className="transition-all overflow-visible shadow-xl shadow-slate-900/5 dark:shadow-none w-full"
             >
                <div className="p-6 md:p-8">
                  <h3 className="font-black text-xl text-slate-900 dark:text-white mb-8 tracking-tight uppercase">Live Dispatch Network</h3>
                  <div className="space-y-8">
                    
                    <div className="flex items-center justify-between group cursor-pointer">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mr-5 shadow-sm group-hover:scale-110 transition-all"><Truck size={24} /></div>
                        <div>
                          <p className="font-black text-xl text-slate-900 dark:text-white leading-none mb-1 uppercase tracking-tight tabular-nums">34</p>
                          <p className="text-[10px] font-black text-slate-500 tracking-widest uppercase">Active Fleets</p>
                        </div>
                      </div>
                      <span className="bg-emerald-50 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 text-[10px] font-black tracking-widest px-2.5 py-1 rounded-lg border border-emerald-100 dark:border-emerald-800">{fleetRecommendation.tier}</span>
                    </div>
                    
                    <div className="flex items-center justify-between group cursor-pointer">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center mr-5 shadow-sm group-hover:scale-110 transition-all"><MapPin size={24} /></div>
                        <div>
                          <p className="font-black text-xl text-slate-900 dark:text-white leading-none mb-1 uppercase tracking-tight tabular-nums">
                            {distanceKm ? distanceKm : '—'} <span className="text-xs text-slate-500 dark:text-slate-400">KM</span>
                          </p>
                          <p className="text-[10px] font-black text-slate-500 tracking-widest uppercase">Route Distance</p>
                        </div>
                      </div>
                      <span className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 text-[10px] font-black tracking-widest px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800">
                        {formatDuration(durationMin) || 'LIVE'}
                      </span>
                    </div>
      
                    <div className="flex items-center justify-between group cursor-pointer">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-900/30 border border-orange-100 dark:border-orange-800 text-orange-600 dark:text-orange-400 flex items-center justify-center mr-5 shadow-sm group-hover:scale-110 transition-all"><Leaf size={24} /></div>
                        <div>
                          <p className="font-black text-xl text-slate-900 dark:text-white leading-none mb-1 uppercase tracking-tight tabular-nums">
                            {emissionEstimateKg ? emissionEstimateKg : '—'} <span className="text-xs text-slate-500 dark:text-slate-400">KG</span>
                          </p>
                          <p className="text-[10px] font-black text-slate-500 tracking-widest uppercase">Estimated CO2 (Trip)</p>
                        </div>
                      </div>
                      <span className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 text-[10px] font-black tracking-widest px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 uppercase">
                        {distanceKm ? 'RECOMMENDED' : 'IDLE'}
                      </span>
                    </div>

                    <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                      <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 tracking-widest uppercase mb-3">Recommendations</p>
                      <ul className="space-y-2">
                        {distanceKm ? (
                          <li className="text-[13px] text-slate-700 dark:text-slate-300 leading-snug">
                            <span className="mr-2 text-emerald-500">•</span>
                            Dispatch plan: <span className="font-semibold">{fleetRecommendation.fleetsNeeded} vehicle(s)</span> for this route.
                          </li>
                        ) : null}
                        {(fleetRecommendation.tips || []).slice(0, 4).map((t, idx) => (
                          <li key={idx} className="text-[13px] text-slate-700 dark:text-slate-300 leading-snug">
                            <span className="mr-2 text-emerald-500">•</span>
                            {t}
                          </li>
                        ))}
                        {!distanceKm && (
                          <li className="text-[13px] text-slate-500 dark:text-slate-400 leading-snug">
                            Enter a destination to compute route distance and get recommendations.
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
             </BorderGlow>
              
             {/* Open in full App */}
             <a  
                href={`https://www.google.com/maps/dir/${activeRoute ? encodeURIComponent(activeRoute.source) + '/' + encodeURIComponent(activeRoute.dest) : ''}`}
                target="_blank" rel="noopener noreferrer"
                className="group relative h-[180px] w-full overflow-hidden rounded-[40px] border border-blue-200 dark:border-blue-800/50 shadow-2xl flex flex-col justify-center items-center cursor-pointer transition-all hover:scale-[1.02] bg-white dark:bg-slate-900"
             >
                  {/* Decorative Background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent pointer-events-none"></div>
                  <div className="absolute right-0 bottom-0 text-9xl opacity-5 transform group-hover:scale-110 transition-transform duration-1000 text-blue-400 pointer-events-none"><Navigation size={160} fill="currentColor" /></div>
                  
                  <div className="relative z-10 text-center px-6">
                    <h3 className="text-xl font-black text-blue-600 dark:text-blue-400 mb-2 leading-tight tracking-tight uppercase flex items-center justify-center gap-2">Full Navigation <ExternalLink size={16} /></h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold leading-relaxed">Open this exact route inside the full Google Maps application for turn-by-turn routing.</p>
                  </div>
             </a>
          </div>
        </div>
      </div>
    );
};
  
export default MapPage;

