import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppData } from '../context/appDataContext';
import { Store, HandHeart, LogIn, UserPlus, ArrowLeft, ShieldAlert, Sparkles, ShieldCheck, ArrowUpRight, CheckCircle } from 'lucide-react';
import Brand from '../components/ui/Brand';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('DONOR');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAppData();
  const navigate = useNavigate();

  // Switch to sign-up tab, carry the email over
  const switchToSignup = (prefilledEmail = '') => {
    setIsLogin(false);
    setError('');
    setSuccessMsg('');
    if (prefilledEmail) setEmail(prefilledEmail);
    setPassword('');
  };

  // Switch to sign-in tab, carry the email over
  const switchToSignin = (prefilledEmail = '') => {
    setIsLogin(true);
    setError('');
    setSuccessMsg('');
    if (prefilledEmail) setEmail(prefilledEmail);
    setPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (!isLogin && !name.trim()) {
      setError('Please enter your name.');
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        // ── SIGN IN ────────────────────────────────────────────────
        await login(email, password);
        navigate('/dashboard');
      } else {
        // ── SIGN UP ────────────────────────────────────────────────
        await register(email, password, role, name.trim());
        // After successful signup → go back to sign-in
        setSuccessMsg(`Account created! Sign in with your new credentials.`);
        switchToSignin(email);
      }
    } catch (err) {
      const code = err?.response?.data?.code;
      const msg = err?.response?.data?.message || err.message || 'Something went wrong.';

      if (isLogin && code === 'USER_NOT_FOUND') {
        // No account with this email → redirect to signup automatically
        setError('');
        switchToSignup(email);
        // Small delay so the tab switches first, then show the info
        setTimeout(() => {
          setSuccessMsg(`No account found for "${email}". Create one below.`);
        }, 50);
      } else {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.14),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.12),_transparent_28%),linear-gradient(180deg,_#f8fbfa_0%,_#eef4f5_100%)] px-4 py-4 transition-colors duration-300 dark:bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.14),_transparent_28%),linear-gradient(180deg,_#020617_0%,_#0f172a_100%)]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[8%] top-[10%] h-72 w-72 rounded-full bg-emerald-400/15 blur-[110px]" />
        <div className="absolute bottom-[8%] right-[10%] h-80 w-80 rounded-full bg-sky-400/10 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-6xl">
        <Link to="/" className="group mb-4 inline-flex items-center text-[11px] font-black uppercase tracking-[0.22em] text-slate-500 transition-colors hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-300">
          <ArrowLeft size={18} className="mr-3 transition-transform group-hover:-translate-x-1" /> Back to hub home
        </Link>

        <div className="grid overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-2xl shadow-slate-900/10 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/75 lg:grid-cols-[0.95fr_1.05fr]">
          {/* ── Left panel ── */}
          <div className="relative hidden overflow-hidden border-r border-slate-200/70 p-8 dark:border-slate-800/70 lg:flex lg:flex-col lg:justify-between">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.14),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.12),_transparent_30%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.14),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.16),_transparent_30%)]" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/70 bg-emerald-50/80 px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">
                <Sparkles size={14} /> HungerXchange Access
              </div>
              <div className="mt-6 flex items-center gap-4">
                <Brand size="md" showText={false} />
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Redistribution OS</p>
                  <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-900 dark:text-white">Move food faster.</h1>
                </div>
              </div>
              <p className="mt-6 max-w-md text-base font-medium leading-7 text-slate-600 dark:text-slate-300">
                Simple access for donors and receivers coordinating surplus food in real time.
              </p>
            </div>

            <div className="relative mt-8 space-y-3">
              <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/75 p-5 shadow-lg dark:border-slate-800/70 dark:bg-slate-950/40">
                <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                  <ShieldCheck size={14} className="text-emerald-500" /> Secure partner access
                </p>
                <p className="mt-2 text-xl font-black tracking-tight text-slate-900 dark:text-white">
                  One entry point for donors and rescue teams
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Choose your console, authenticate, and jump directly into listings, requests, pickups, and impact records.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.35rem] border border-slate-200/80 bg-white/70 p-4 dark:border-slate-800/70 dark:bg-slate-950/35">
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Donor</p>
                  <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-200">List available food, verify requests, and assign pickups in minutes.</p>
                </div>
                <div className="rounded-[1.35rem] border border-slate-200/80 bg-white/70 p-4 dark:border-slate-800/70 dark:bg-slate-950/35">
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Receiver</p>
                  <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-200">Request nearby items, track approvals, and manage live pickup queues.</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right panel (form) ── */}
          <div className="p-6 sm:p-8 md:p-9">
            <div className="mx-auto w-full max-w-md">
              <div className="mb-5 lg:hidden">
                <div className="flex items-center justify-center">
                  <Brand size="md" showText={false} />
                </div>
              </div>

              {/* Tab switcher */}
              <div className="rounded-full border border-slate-200/80 bg-slate-100/80 p-1.5 dark:border-slate-800/80 dark:bg-slate-950/50">
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => switchToSignin()}
                    className={`rounded-full px-4 py-2.5 text-sm font-black tracking-tight transition-all ${
                      isLogin
                        ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    Sign in
                  </button>
                  <button
                    type="button"
                    onClick={() => switchToSignup()}
                    className={`rounded-full px-4 py-2.5 text-sm font-black tracking-tight transition-all ${
                      !isLogin
                        ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    Sign up
                  </button>
                </div>
              </div>

              <div className="mt-5">
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-emerald-600 dark:text-emerald-300">
                  {isLogin ? 'Welcome back' : 'Create account'}
                </p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                  {isLogin ? 'Sign in to your workspace' : 'Join the redistribution network'}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  {isLogin
                    ? 'Enter your credentials to continue. New here? Switch to Sign up.'
                    : 'Create your account, then sign in to start coordinating.'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-5 space-y-4">

                {/* Role chooser — shown on BOTH tabs */}
                <div>
                  <label className="px-1 text-[11px] font-black uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                    Choose console
                  </label>
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('DONOR')}
                      className={`rounded-[1.35rem] border p-4 text-left transition-all ${
                        role === 'DONOR'
                          ? 'border-emerald-300 bg-emerald-50 shadow-sm dark:border-emerald-900/70 dark:bg-emerald-950/30'
                          : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950/35 dark:hover:border-slate-700'
                      }`}
                    >
                      <Store size={20} className={role === 'DONOR' ? 'text-emerald-600 dark:text-emerald-300' : 'text-slate-400'} />
                      <p className="mt-3 text-sm font-black uppercase tracking-[0.18em] text-slate-900 dark:text-white">Donor</p>
                      <p className="mt-1.5 text-xs leading-5 text-slate-500 dark:text-slate-400">List food and manage requests.</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('RECEIVER')}
                      className={`rounded-[1.35rem] border p-4 text-left transition-all ${
                        role === 'RECEIVER'
                          ? 'border-sky-300 bg-sky-50 shadow-sm dark:border-sky-900/70 dark:bg-sky-950/30'
                          : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950/35 dark:hover:border-slate-700'
                      }`}
                    >
                      <HandHeart size={20} className={role === 'RECEIVER' ? 'text-sky-600 dark:text-sky-300' : 'text-slate-400'} />
                      <p className="mt-3 text-sm font-black uppercase tracking-[0.18em] text-slate-900 dark:text-white">Receiver</p>
                      <p className="mt-1.5 text-xs leading-5 text-slate-500 dark:text-slate-400">Request items and track pickups.</p>
                    </button>
                  </div>
                </div>

                {/* Success banner */}
                {successMsg && (
                  <div className="flex items-start gap-3 rounded-[1.25rem] border border-emerald-200 bg-emerald-50/90 p-3.5 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">
                    <CheckCircle size={18} className="mt-0.5 shrink-0" />
                    <p className="text-sm font-semibold leading-5">{successMsg}</p>
                  </div>
                )}

                {/* Error banner */}
                {error && (
                  <div className="flex items-start gap-3 rounded-[1.25rem] border border-rose-200 bg-rose-50/90 p-3.5 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">
                    <ShieldAlert size={18} className="mt-0.5 shrink-0" />
                    <p className="text-sm font-semibold leading-5">{error}</p>
                  </div>
                )}

                <div className="space-y-3">
                  {/* Name field — only on sign-up */}
                  {!isLogin && (
                    <div>
                      <label className="px-1 text-[11px] font-black uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                        Your name / Organisation
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Green Table Bistro"
                        className="mt-2 h-12 w-full rounded-[1.15rem] border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 shadow-inner shadow-slate-900/5 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-800 dark:bg-slate-950/60 dark:text-white"
                      />
                    </div>
                  )}

                  <div>
                    <label className="px-1 text-[11px] font-black uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={isLogin ? 'partner@hungerxchange.org' : 'your@workspace.org'}
                      className="mt-2 h-12 w-full rounded-[1.15rem] border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 shadow-inner shadow-slate-900/5 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-800 dark:bg-slate-950/60 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="px-1 text-[11px] font-black uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={isLogin ? 'Enter your password' : 'Min. 8 characters'}
                      className="mt-2 h-12 w-full rounded-[1.15rem] border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 shadow-inner shadow-slate-900/5 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-800 dark:bg-slate-950/60 dark:text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="group inline-flex h-12 w-full items-center justify-center rounded-[1.15rem] bg-slate-900 px-5 text-sm font-black tracking-[0.04em] text-white transition-all hover:bg-emerald-600 disabled:opacity-60 dark:bg-white dark:text-slate-900 dark:hover:bg-emerald-400"
                >
                  {isLoading ? (
                    <span className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin dark:border-slate-900 dark:border-t-transparent" />
                  ) : isLogin ? (
                    <>
                      <LogIn size={18} className="mr-3" /> Sign in
                      <ArrowUpRight size={16} className="ml-2 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </>
                  ) : (
                    <>
                      <UserPlus size={18} className="mr-3" /> Create account
                      <ArrowUpRight size={16} className="ml-2 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-5 border-t border-slate-200/80 pt-4 text-center dark:border-slate-800/80">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  {isLogin ? 'New here?' : 'Already have an account?'}{' '}
                  <button
                    onClick={() => isLogin ? switchToSignup() : switchToSignin()}
                    className="font-black text-emerald-600 transition-colors hover:text-emerald-700 dark:text-emerald-300 dark:hover:text-emerald-200"
                  >
                    {isLogin ? 'Create an account' : 'Sign in instead'}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
