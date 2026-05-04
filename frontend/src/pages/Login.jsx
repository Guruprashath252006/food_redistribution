import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAppData } from '../context/appDataContext';
import {
  Store, HandHeart, LogIn, UserPlus, ArrowLeft,
  ShieldAlert, Sparkles, CheckCircle, Eye, EyeOff, Leaf
} from 'lucide-react';

/* ─── Google "G" icon ─────────────────────────────────────────── */
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M47.532 24.5528C47.532 22.9214 47.3997 21.2811 47.1175 19.6761H24.48V28.9181H37.4434C36.8717 31.8988 35.1753 34.5478 32.6711 36.2691V42.2078H40.3801C44.9217 38.0278 47.532 31.8547 47.532 24.5528Z" fill="#4285F4"/>
    <path d="M24.48 48.0016C30.9529 48.0016 36.4116 45.8764 40.3888 42.2078L32.6798 36.2691C30.5307 37.7271 27.7616 38.5583 24.4888 38.5583C18.2275 38.5583 12.9187 34.3303 11.0139 28.6006H3.03296V34.7183C7.10718 42.8431 15.4056 48.0016 24.48 48.0016Z" fill="#34A853"/>
    <path d="M11.0051 28.6006C10.0023 25.6199 10.0023 22.3922 11.0051 19.4115V13.2938H3.03298C-0.371021 20.0036 -0.371021 28.0085 3.03298 34.7183L11.0051 28.6006Z" fill="#FBBC04"/>
    <path d="M24.48 9.44961C27.9016 9.39427 31.2086 10.7079 33.6866 13.0973L40.5387 6.24523C36.2 2.17101 30.4414 -0.068932 24.48 0.00161733C15.4055 0.00161733 7.10718 5.16011 3.03296 13.2938L11.005 19.4115C12.901 13.6731 18.2187 9.44961 24.48 9.44961Z" fill="#EA4335"/>
  </svg>
);

/* ─── Floating orb background ─────────────────────────────────── */
const Background = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    <div style={{
      position: 'absolute', top: '-10%', left: '-5%',
      width: 480, height: 480, borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 70%)',
      filter: 'blur(40px)'
    }} />
    <div style={{
      position: 'absolute', bottom: '-8%', right: '-8%',
      width: 520, height: 520, borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
      filter: 'blur(40px)'
    }} />
    <div style={{
      position: 'absolute', top: '40%', right: '20%',
      width: 280, height: 280, borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)',
      filter: 'blur(40px)'
    }} />
    {/* Grid pattern */}
    <div style={{
      position: 'absolute', inset: 0,
      backgroundImage: 'linear-gradient(rgba(16,185,129,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.04) 1px, transparent 1px)',
      backgroundSize: '48px 48px'
    }} />
  </div>
);

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('DONOR');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { login, register, googleLogin } = useAppData();
  const navigate = useNavigate();

  const switchToSignup = (pre = '') => {
    setIsLogin(false); setError(''); setSuccessMsg('');
    if (pre) setEmail(pre);
    setPassword('');
  };
  const switchToSignin = (pre = '') => {
    setIsLogin(true); setError(''); setSuccessMsg('');
    if (pre) setEmail(pre);
    setPassword('');
  };

  /* ─── Google OAuth ──────────────────────────────────────────── */
  const handleGoogleSuccess = async (tokenResponse) => {
    setGoogleLoading(true);
    setError('');
    try {
      // Exchange access_token for user info, then send to backend
      const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
      });
      const userInfo = await userInfoRes.json();
      // We pass the sub (google id) + email + name directly — backend uses ID token verify
      // Use implicit flow: send access token to get credential
      await googleLogin(tokenResponse.access_token, role);
      navigate('/dashboard');
    } catch (err) {
      setError(err?.response?.data?.message || 'Google sign-in failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const triggerGoogleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => setError('Google sign-in was cancelled or failed.'),
  });

  /* ─── Email/Password submit ─────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccessMsg('');
    if (!email || !email.includes('@')) { setError('Please enter a valid email address.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (!isLogin && !name.trim()) { setError('Please enter your name.'); return; }

    setIsLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
        navigate('/dashboard');
      } else {
        await register(email, password, role, name.trim());
        setSuccessMsg('Account created! Sign in with your new credentials.');
        switchToSignin(email);
      }
    } catch (err) {
      const code = err?.response?.data?.code;
      const msg = err?.response?.data?.message || err.message || 'Something went wrong.';
      if (isLogin && code === 'USER_NOT_FOUND') {
        setError('');
        switchToSignup(email);
        setTimeout(() => setSuccessMsg(`No account for "${email}". Create one below.`), 50);
      } else {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  /* ─── Styles ────────────────────────────────────────────────── */
  const inputCls = `
    w-full h-12 rounded-2xl border px-4 text-sm font-medium outline-none transition-all duration-200
    bg-white/60 dark:bg-slate-900/60
    border-slate-200 dark:border-slate-700/70
    text-slate-900 dark:text-white
    placeholder:text-slate-400 dark:placeholder:text-slate-500
    focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/15
    backdrop-blur-sm
  `;

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px',
      background: 'linear-gradient(135deg, #f0fdf8 0%, #eff6ff 50%, #faf5ff 100%)',
      position: 'relative'
    }} className="dark:bg-[linear-gradient(135deg,#020617_0%,#0a0f1e_50%,#0d0a1e_100%)]">

      <Background />

      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 1100 }}>

        {/* Back link */}
        <Link to="/" className="group mb-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
          <ArrowLeft size={15} className="transition-transform group-hover:-translate-x-1" />
          Back to home
        </Link>

        {/* Card */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1fr)',
          borderRadius: 28,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.7)',
          boxShadow: '0 32px 64px -12px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.05)',
          backdropFilter: 'blur(24px)',
          background: 'rgba(255,255,255,0.75)'
        }} className="dark:border-slate-800/60 dark:bg-slate-900/70 lg:grid-cols-[0.9fr_1.1fr]">

          {/* ── Left panel ── */}
          <div style={{
            display: 'none', flexDirection: 'column', justifyContent: 'space-between',
            padding: '44px', position: 'relative',
            borderRight: '1px solid rgba(226,232,240,0.6)',
            background: 'linear-gradient(145deg, rgba(16,185,129,0.06) 0%, rgba(99,102,241,0.04) 100%)'
          }} className="lg:flex dark:border-slate-800/60">

            <div>
              {/* Badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '6px 14px', borderRadius: 100,
                background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
                fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', color: '#059669',
                textTransform: 'uppercase', marginBottom: 28
              }} className="dark:bg-emerald-950/30 dark:border-emerald-900/50 dark:text-emerald-400">
                <Sparkles size={13} /> HungerXchange Access
              </div>

              {/* Brand */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  boxShadow: '0 8px 24px rgba(16,185,129,0.3)'
                }}>
                  <Leaf size={26} color="white" />
                </div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 4 }} className="dark:text-slate-500">
                    Redistribution OS
                  </p>
                  <h1 style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-0.03em', color: '#0f172a', lineHeight: 1.1 }} className="dark:text-white">
                    Move food.<br />Save lives.
                  </h1>
                </div>
              </div>

              <p style={{ fontSize: 15, lineHeight: 1.7, color: '#64748b', maxWidth: 340 }} className="dark:text-slate-400">
                A real-time platform connecting food donors and receivers to eliminate waste and fight hunger across communities.
              </p>
            </div>

            {/* Feature cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { emoji: '🏪', title: 'Donor Console', desc: 'List surplus food, manage pickup requests, and track your impact in real time.' },
                { emoji: '🤝', title: 'Receiver Console', desc: 'Browse available donations, submit requests, and coordinate pickups nearby.' },
                { emoji: '📊', title: 'Live Impact', desc: 'Watch kg saved, carbon offset, and community reach grow with every transaction.' },
              ].map((f) => (
                <div key={f.title} style={{
                  padding: '16px 20px', borderRadius: 18,
                  background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(226,232,240,0.7)',
                  display: 'flex', gap: 14, alignItems: 'flex-start'
                }} className="dark:bg-slate-950/40 dark:border-slate-800/60">
                  <span style={{ fontSize: 22 }}>{f.emoji}</span>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 800, color: '#1e293b', marginBottom: 3 }} className="dark:text-white">{f.title}</p>
                    <p style={{ fontSize: 12, lineHeight: 1.6, color: '#64748b' }} className="dark:text-slate-400">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right panel (form) ── */}
          <div style={{ padding: '44px 40px' }} className="sm:p-12">
            <div style={{ maxWidth: 420, margin: '0 auto' }}>

              {/* Mobile brand */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 28, gap: 12 }} className="lg:hidden">
                <div style={{
                  width: 44, height: 44, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  boxShadow: '0 6px 20px rgba(16,185,129,0.3)'
                }}>
                  <Leaf size={22} color="white" />
                </div>
                <span style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }} className="dark:text-white">HungerXchange</span>
              </div>

              {/* Tab switcher */}
              <div style={{
                background: 'rgba(241,245,249,0.8)', borderRadius: 100,
                padding: 5, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4,
                border: '1px solid rgba(226,232,240,0.6)', marginBottom: 28
              }} className="dark:bg-slate-950/60 dark:border-slate-800/70">
                {['Sign in', 'Sign up'].map((label, i) => {
                  const active = i === 0 ? isLogin : !isLogin;
                  return (
                    <button
                      key={label} type="button"
                      onClick={() => i === 0 ? switchToSignin() : switchToSignup()}
                      style={{
                        borderRadius: 100, padding: '10px 16px', fontSize: 14, fontWeight: 800,
                        transition: 'all 0.2s',
                        background: active ? 'white' : 'transparent',
                        color: active ? '#0f172a' : '#94a3b8',
                        boxShadow: active ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                        border: 'none', cursor: 'pointer'
                      }}
                      className={active ? 'dark:bg-slate-800 dark:text-white' : 'dark:text-slate-500 dark:hover:text-slate-300'}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Heading */}
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#10b981', marginBottom: 6 }}>
                  {isLogin ? 'Welcome back' : 'Get started'}
                </p>
                <h2 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.03em', color: '#0f172a', marginBottom: 6 }} className="dark:text-white">
                  {isLogin ? 'Sign in to your workspace' : 'Join the network'}
                </h2>
                <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }} className="dark:text-slate-400">
                  {isLogin ? 'Enter your credentials below or use Google.' : 'Create your account and start redistributing food.'}
                </p>
              </div>

              {/* Google button */}
              <button
                type="button"
                onClick={() => triggerGoogleLogin()}
                disabled={googleLoading || isLoading}
                style={{
                  width: '100%', height: 48, borderRadius: 16, border: '1.5px solid rgba(226,232,240,0.9)',
                  background: 'rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: 12, fontSize: 14, fontWeight: 700, color: '#1e293b', cursor: 'pointer',
                  transition: 'all 0.2s', marginBottom: 20,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  backdropFilter: 'blur(8px)'
                }}
                className="dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-white hover:shadow-lg hover:border-emerald-300 dark:hover:border-emerald-700 disabled:opacity-50"
              >
                {googleLoading ? (
                  <span style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid #e2e8f0', borderTopColor: '#10b981', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                ) : <GoogleIcon />}
                Continue with Google
              </button>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(226,232,240,0.7)' }} className="dark:bg-slate-800/70" />
                <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, letterSpacing: '0.06em' }}>or</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(226,232,240,0.7)' }} className="dark:bg-slate-800/70" />
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                {/* Role selector */}
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#94a3b8', display: 'block', marginBottom: 8 }}>
                    Choose your role
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {[
                      { value: 'DONOR', label: 'Donor', desc: 'List & share food', Icon: Store, color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.3)' },
                      { value: 'RECEIVER', label: 'Receiver', desc: 'Request pickups', Icon: HandHeart, color: '#6366f1', bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.3)' },
                    ].map(({ value, label, desc, Icon, color, bg, border }) => {
                      const selected = role === value;
                      return (
                        <button
                          key={value} type="button" onClick={() => setRole(value)}
                          style={{
                            padding: '14px 12px', borderRadius: 16, textAlign: 'left', cursor: 'pointer',
                            border: `1.5px solid ${selected ? border : 'rgba(226,232,240,0.7)'}`,
                            background: selected ? bg : 'rgba(255,255,255,0.7)',
                            transition: 'all 0.2s',
                            boxShadow: selected ? `0 4px 16px ${color}20` : 'none'
                          }}
                          className={!selected ? 'dark:border-slate-800 dark:bg-slate-950/40 hover:border-slate-300 dark:hover:border-slate-700' : 'dark:bg-opacity-20'}
                        >
                          <Icon size={20} style={{ color: selected ? color : '#94a3b8', marginBottom: 8 }} />
                          <p style={{ fontSize: 13, fontWeight: 800, color: '#1e293b', marginBottom: 2 }} className="dark:text-white">{label}</p>
                          <p style={{ fontSize: 11, color: '#94a3b8' }}>{desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Alerts */}
                {successMsg && (
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '12px 14px', borderRadius: 14, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#059669' }} className="dark:bg-emerald-950/30 dark:border-emerald-900/50 dark:text-emerald-400">
                    <CheckCircle size={16} style={{ marginTop: 1, flexShrink: 0 }} />
                    <p style={{ fontSize: 13, fontWeight: 600 }}>{successMsg}</p>
                  </div>
                )}
                {error && (
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '12px 14px', borderRadius: 14, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626' }} className="dark:bg-rose-950/30 dark:border-rose-900/50 dark:text-rose-400">
                    <ShieldAlert size={16} style={{ marginTop: 1, flexShrink: 0 }} />
                    <p style={{ fontSize: 13, fontWeight: 600 }}>{error}</p>
                  </div>
                )}

                {/* Name (signup only) */}
                {!isLogin && (
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#94a3b8', display: 'block', marginBottom: 6 }}>
                      Name / Organisation
                    </label>
                    <input
                      type="text" value={name} onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Green Table Bistro"
                      className={inputCls}
                    />
                  </div>
                )}

                {/* Email */}
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#94a3b8', display: 'block', marginBottom: 6 }}>
                    Email
                  </label>
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder={isLogin ? 'you@example.com' : 'your@workspace.org'}
                    className={inputCls}
                  />
                </div>

                {/* Password */}
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#94a3b8', display: 'block', marginBottom: 6 }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password} onChange={(e) => setPassword(e.target.value)}
                      placeholder={isLogin ? 'Enter your password' : 'Min. 8 characters'}
                      className={inputCls}
                      style={{ paddingRight: 44 }}
                    />
                    <button
                      type="button" onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 0 }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit" disabled={isLoading || googleLoading}
                  style={{
                    width: '100%', height: 50, borderRadius: 16, border: 'none', cursor: 'pointer',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white', fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    transition: 'all 0.2s',
                    boxShadow: '0 8px 24px rgba(16,185,129,0.35)',
                    marginTop: 4
                  }}
                  className="hover:brightness-110 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <span style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                  ) : isLogin ? (
                    <><LogIn size={18} /> Sign in</>
                  ) : (
                    <><UserPlus size={18} /> Create account</>
                  )}
                </button>
              </form>

              {/* Toggle */}
              <p style={{ textAlign: 'center', fontSize: 13, color: '#94a3b8', marginTop: 20 }} className="dark:text-slate-500">
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                <button
                  onClick={() => isLogin ? switchToSignup() : switchToSignin()}
                  style={{ color: '#10b981', fontWeight: 800, background: 'none', border: 'none', cursor: 'pointer' }}
                  className="hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-300"
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Spin animation */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Login;
