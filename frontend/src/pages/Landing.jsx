import { Link } from 'react-router-dom';
import { Leaf, HandHeart, ArrowRight, Sparkles, Navigation, Globe, ShieldCheck, MessageCircle } from 'lucide-react';
import Brand from '../components/ui/Brand';

const Landing = () => {
  return (
    <div className="min-h-screen lg:h-screen w-full bg-white dark:bg-slate-950 transition-colors duration-300 relative lg:overflow-hidden overflow-x-hidden flex flex-col">
      {/* Background Decor */}
      <div className="absolute top-10 md:top-20 left-4 md:left-10 w-64 md:w-96 h-64 md:h-96 bg-emerald-500/10 rounded-full mix-blend-multiply filter blur-[80px] md:blur-[100px] pointer-events-none transition-all"></div>
      <div className="absolute bottom-10 md:bottom-20 right-4 md:right-10 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-blue-500/5 rounded-full mix-blend-multiply filter blur-[90px] md:blur-[120px] pointer-events-none transition-all"></div>

      {/* Header */}
      <header className="w-full max-w-[1300px] mx-auto flex justify-between items-center py-4 sm:py-5 md:py-6 px-5 sm:px-6 md:px-8 relative z-20 animate-fade-in-up shrink-0">
        <Brand size="md" />
        <nav className="hidden lg:flex bg-white/50 dark:bg-slate-900/50 backdrop-blur-md space-x-1 px-5 py-2 rounded-full text-[13px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 shadow-sm transition-all scale-95">
          <Link to="/dashboard" className="px-4 py-2 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all">Dashboard</Link>
          <Link to="/marketplace" className="px-4 py-2 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all">Marketplace</Link>
          <Link to="/impact" className="px-4 py-2 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all">Impact</Link>
          <Link to="/community" className="px-4 py-2 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all">Community</Link>
        </nav>
        <div className="flex items-center space-x-3 md:space-x-4">
          <Link to="/login" className="primary-button px-6 md:px-8 py-2 text-[14px]">
             Sign In
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 w-full max-w-[1300px] mx-auto flex flex-col lg:flex-row items-center justify-center px-5 sm:px-6 md:px-8 relative z-10 gap-10 lg:gap-16 xl:gap-24 overflow-y-visible lg:overflow-hidden pb-16 lg:pb-0 mt-4 lg:mt-0">
        
        {/* Text Content */}
        <div className="lg:w-[48%] flex flex-col justify-center items-center lg:items-start text-center lg:text-left space-y-5 sm:space-y-6 animate-fade-in-up delay-100 pt-2 lg:pt-0 shrink-0">
          <div>
            <div className="inline-flex bg-emerald-50 dark:bg-emerald-900/30 px-4 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-800 shadow-sm transition-all text-left">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2.5 animate-pulse shrink-0 mt-0.5"></span>
              <span className="text-emerald-700 dark:text-emerald-400 text-[10px] sm:text-[12px] font-black tracking-[0.2em] uppercase flex items-center flex-wrap">Redistributing hope Network</span>
            </div>
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-[4.8rem] font-black text-slate-900 dark:text-white leading-[1.05] tracking-tight transition-colors uppercase">
            Reduce Food<br />Waste, <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-500">
              Feed Lives.
            </span>
          </h1>
          
          <p className="text-slate-500 dark:text-slate-400 text-[15px] sm:text-[17px] md:text-[19px] max-w-[90%] leading-relaxed font-bold tracking-tight transition-colors">
            Connecting surplus from retailers to those who need it most through real-time logistics and transparent impact tracking.
          </p>
          
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-2 w-full sm:w-auto px-4 sm:px-0">
            <Link to="/login" className="w-full sm:w-auto bg-emerald-500 text-white px-8 py-4 rounded-[1rem] font-black uppercase tracking-widest text-[14px] hover:shadow-xl hover:shadow-emerald-500/40 hover:-translate-y-1 transition-all flex items-center justify-center border border-emerald-400">
              Donate Food <ArrowRight size={18} className="ml-2" />
            </Link>
            <Link to="/login" className="w-full sm:w-auto secondary-button px-8 py-4 rounded-[1rem] text-[14px] text-center flex items-center justify-center">
              Request Rescue
            </Link>
          </div>
          
          <div className="pt-6 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 opacity-95 transition-all mt-4 lg:mt-0">
            <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-900/20 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] sm:text-[11px] font-black tracking-[0.15em] uppercase text-emerald-700 dark:text-emerald-400">Network Live</span>
            </div>
            <div className="hidden sm:block h-4 w-[1px] bg-slate-300 dark:bg-slate-800"></div>
            <p className="text-[12px] sm:text-[13px] font-semibold text-slate-500 dark:text-slate-400 tracking-tight text-center">
              Currently tracking <span className="font-black text-emerald-600 dark:text-emerald-400">24 active</span> logistics routes.
            </p>
          </div>
        </div>
        
        {/* Educational/Impact Statistics Area */}
        <div className="lg:w-[48%] relative flex justify-center lg:justify-start animate-fade-in-up delay-300 w-full shrink-0">
          
          <div className="w-full max-w-[500px] relative flex flex-col justify-center">
             
             {/* Abstract Glows */}
             <div className="absolute top-[10%] right-[10%] w-64 h-64 bg-emerald-400/15 rounded-full filter blur-[80px] pointer-events-none group-hover:bg-emerald-500/25 transition-all duration-700"></div>
             <div className="absolute bottom-[10%] left-[10%] w-48 h-48 bg-sky-400/15 rounded-full filter blur-[80px] pointer-events-none"></div>
             
             {/* The "Why It Matters" Stack */}
             <div className="relative w-full space-y-3 lg:space-y-4 z-10">
                
                {/* Intro Title */}
                <div className="mb-4 text-center lg:text-left">
                   <h2 className="text-[11px] font-black uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-400 mb-1.5 flex items-center justify-center lg:justify-start gap-2">
                     <Globe size={12} className="animate-pulse" /> The Global Challenge
                   </h2>
                   <h3 className="text-3xl sm:text-4xl lg:text-[2.2rem] font-black text-slate-900 dark:text-white tracking-tight leading-[1.1]">
                     Why Rescue Matters
                   </h3>
                </div>

                {/* Stat Card 1 - Waste */}
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 sm:p-6 rounded-[1.5rem] border border-slate-200/60 dark:border-slate-800/60 shadow-lg shadow-slate-900/5 hover:-translate-y-1 hover:shadow-xl hover:border-rose-200 group/card1 relative overflow-hidden transition-all duration-300 ml-0 lg:ml-6 border-l-4 border-l-rose-400 hover:border-l-rose-500 transform hover:-rotate-1">
                   <div className="absolute -top-6 -right-4 p-4 opacity-[0.03] dark:opacity-[0.08] text-rose-500 transition-all duration-500 group-hover/card1:scale-110">
                     <span className="text-[110px] font-black leading-none tracking-tighter">1/3</span>
                   </div>
                   <div className="flex items-center gap-3 mb-2 relative z-10">
                     <div className="w-10 h-10 rounded-[1rem] bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center border border-rose-100 text-rose-500 group-hover/card1:rotate-12 transition-transform duration-500">
                       <span className="text-[13px] font-black tracking-tight">33%</span>
                     </div>
                     <h4 className="text-[16px] font-black uppercase tracking-tight text-slate-900 dark:text-white">Of All Food Is Wasted</h4>
                   </div>
                   <p className="text-slate-600 dark:text-slate-400 text-[13px] font-semibold leading-relaxed relative z-10 max-w-[92%]">
                     We throw away over 1.3 billion tons of edible food yearly while millions face extreme hunger.
                   </p>
                </div>

                {/* Stat Card 2 - Environment */}
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 sm:p-6 rounded-[1.5rem] border border-slate-200/60 dark:border-slate-800/60 shadow-lg shadow-slate-900/5 hover:-translate-y-1 hover:shadow-xl hover:border-emerald-200 group/card2 relative overflow-hidden transition-all duration-300 ml-0 lg:mr-6 border-l-4 border-l-emerald-400 hover:border-l-emerald-500 transform hover:rotate-1">
                   <div className="absolute -top-4 -right-6 p-4 opacity-[0.03] dark:opacity-[0.08] text-emerald-500 transition-all duration-500 group-hover/card2:scale-110 group-hover/card2:-rotate-12">
                     <Leaf size={110} />
                   </div>
                   <div className="flex items-center gap-3 mb-2 relative z-10">
                     <div className="w-10 h-10 rounded-[1rem] bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center border border-emerald-100 text-emerald-500 group-hover/card2:rotate-12 transition-transform duration-500">
                       <Sparkles size={16} />
                     </div>
                     <h4 className="text-[16px] font-black uppercase tracking-tight text-slate-900 dark:text-white">Ecological Impact</h4>
                   </div>
                   <p className="text-slate-600 dark:text-slate-400 text-[13px] font-semibold leading-relaxed relative z-10 max-w-[92%]">
                     Rotting food generates 10% of global greenhouse emissions. Saving food directly saves the planet.
                   </p>
                </div>

                {/* Stat Card 3 - Social */}
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 sm:p-6 rounded-[1.5rem] border border-slate-200/60 dark:border-slate-800/60 shadow-lg shadow-slate-900/5 hover:-translate-y-1 hover:shadow-xl hover:border-sky-200 group/card3 relative overflow-hidden transition-all duration-300 ml-0 lg:ml-12 border-l-4 border-l-sky-400 hover:border-l-sky-500 transform hover:-rotate-1">
                   <div className="absolute -top-4 right-[-10px] p-4 opacity-[0.03] dark:opacity-[0.08] text-sky-500 transition-all duration-500 group-hover/card3:scale-110 group-hover/card3:-rotate-6">
                     <span className="text-[110px] font-black tracking-tighter leading-none">1/9</span>
                   </div>
                   <div className="flex items-center gap-3 mb-2 relative z-10">
                     <div className="w-10 h-10 rounded-[1rem] bg-sky-50 dark:bg-sky-950/40 flex items-center justify-center border border-sky-100 text-sky-500 group-hover/card3:rotate-12 transition-transform duration-500">
                       <HandHeart size={16} />
                     </div>
                     <h4 className="text-[16px] font-black uppercase tracking-tight text-slate-900 dark:text-white">Nourishing Lives</h4>
                   </div>
                   <p className="text-slate-600 dark:text-slate-400 text-[13px] font-semibold leading-relaxed relative z-10 max-w-[92%]">
                     By redistributing meals, we actively bridge the gap between true abundance and starvation.
                   </p>
                </div>

             </div>
          </div>
          
        </div>
      </main>
    </div>
  );
};

export default Landing;
