import { useState } from 'react';
import { useAppData } from '../context/appDataContext';
import BorderGlow from '../components/ui/BorderGlow';
import { useOverlay } from '../components/ui/overlayContext';
import { Settings as SettingsIcon, Building2, Truck, Lock, ChevronRight, Mail, Smartphone, BellRing, Save, ShieldAlert, ChevronDown } from 'lucide-react';

const Settings = () => {
    const { user, updateUser, changePassword, toggle2FA, deleteAccount } = useAppData();
    const { confirm, prompt, toast } = useOverlay();
    const [notifications, setNotifications] = useState({
        email: true,
        sms: false,
        urgent: true,
        weekly: true
    });
    const [showSuccess, setShowSuccess] = useState(false);
    const [profile, setProfile] = useState({
        name: user?.name || '',
        email: user?.email || 'contact@hungerxchange.org',
        bio: user?.bio || 'Committed to reducing food waste and supporting our local community shelters with high-quality surplus inventory.'
    });

    const toggleNotification = (key) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = async () => {
        try {
            await updateUser(profile);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
            toast({ variant: 'success', title: 'Saved', description: 'Profile updated successfully.' });
        } catch (err) {
            toast({ variant: 'danger', title: 'Save failed', description: err?.response?.data?.message || 'Could not save profile.' });
        }
    };

    const handleChangePassword = async () => {
        const newPass = await prompt({
          title: 'Change password',
          description: 'For this demo, the password is stored only in local session state. Use 8+ characters.',
          inputLabel: 'New password',
          placeholder: 'Enter a new password',
          defaultValue: '',
          confirmText: 'Update',
          cancelText: 'Cancel',
          confirmVariant: 'primary',
        });

        if (newPass === null) return;
        if (!newPass || newPass.length < 8) {
          toast({ variant: 'danger', title: 'Invalid password', description: 'Use at least 8 characters.' });
          return;
        }

        try {
            await changePassword(newPass);
            toast({ variant: 'success', title: 'Password updated', description: 'You can now sign in with the new password.' });
        } catch (err) {
            toast({ variant: 'danger', title: 'Failed', description: err?.response?.data?.message || 'Could not update password.' });
        }
    };

    const handleToggle2FA = async () => {
        if (user?.is2FAEnabled) {
            const ok = await confirm({
                title: 'Disable 2FA?',
                description: 'Turning off Two-Factor Authentication reduces account security. Disable anyway?',
                confirmText: 'Disable 2FA',
                cancelText: 'Cancel',
                confirmVariant: 'danger',
            });
            if (ok) {
                try {
                    await toggle2FA();
                    toast({ variant: 'success', title: '2FA Disabled', description: 'Two-factor authentication deactivated.' });
                } catch (err) {
                    toast({ variant: 'danger', title: 'Failed', description: err?.response?.data?.message || 'Could not update 2FA.' });
                }
            }
        } else {
            const code = await prompt({
                title: 'Set up 2FA',
                description: 'To enable 2FA for this demo, enter the 6-digit verification code below. Try entering "123456" as a test code.',
                inputLabel: 'Verification Code',
                placeholder: '123456',
                defaultValue: '',
                confirmText: 'Verify & Enable',
                cancelText: 'Cancel',
                confirmVariant: 'primary',
            });
            if (code === null) return;
            if (code.length < 5) {
                toast({ variant: 'danger', title: 'Invalid code', description: 'Please enter a valid verification code.' });
                return;
            }
            try {
                await toggle2FA();
                toast({ variant: 'success', title: '2FA Enabled', description: 'Your account is now secured with two-factor authentication.' });
            } catch (err) {
                toast({ variant: 'danger', title: 'Failed', description: err?.response?.data?.message || 'Could not enable 2FA.' });
            }
        }
    };

    const handleDelete = async () => {
        const ok = await confirm({
          title: 'Decommission workspace?',
          description: 'This will clear your local session and profile data in this demo UI.',
          confirmText: 'Decommission',
          cancelText: 'Cancel',
          confirmVariant: 'danger',
        });
        if (!ok) return;
        try {
            await deleteAccount();
        } catch (err) {
            toast({ variant: 'danger', title: 'Failed', description: err?.response?.data?.message || 'Could not delete account.' });
        }
    };

    return (
      <div className="flex flex-col h-full animate-fade-in-up transition-colors duration-300">
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="w-full md:w-auto">
                <div className="inline-flex glass px-4 py-2 rounded-full mb-4 border border-slate-200/50 dark:border-white/5 shadow-sm">
                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 tracking-[0.3em] uppercase flex items-center"><SettingsIcon size={14} className="mr-3 text-emerald-500" /> Preferences</span>
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">Account Settings</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-3 text-sm sm:text-lg font-bold tracking-tight max-w-2xl">Manage your organization profile, notification preferences, and security configurations.</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center w-full md:w-auto gap-4">
                {showSuccess && (
                  <div className="bg-emerald-500 text-white px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest animate-fade-in-up border border-emerald-400 shadow-xl shadow-emerald-500/20 text-center">
                     Settings Updated
                  </div>
                )}
                <button onClick={handleSave} className="primary-button flex items-center justify-center text-sm px-8 py-4 w-full sm:w-auto">
                    <Save size={18} className="mr-3" /> Save Changes
                </button>
            </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-8 flex-1">
            
            {/* Left Column - Profile & Account */}
            <div className="flex-1 space-y-8">
                
                {/* Profile Card */}
                <BorderGlow 
                  borderRadius={32}
                  backgroundColor="#060010"
                  className="shadow-xl shadow-slate-900/5 dark:shadow-none overflow-visible group transition-all"
                >
                  <div className="p-6 md:p-10 relative">
                    <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-emerald-500/5 rounded-bl-full mix-blend-multiply filter blur-[80px] sm:blur-3xl opacity-50 group-hover:scale-110 transition-all pointer-events-none"></div>
                    
                    <h2 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center relative z-10 uppercase tracking-tight">
                        <Building2 size={24} className="text-emerald-500 mr-3" /> Organization Profile
                    </h2>
 
                    <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-10 relative z-10 w-full">
                        <div className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 text-white flex items-center justify-center font-black text-3xl sm:text-4xl shadow-lg border-[4px] sm:border-[6px] border-white dark:border-slate-800 group-hover:scale-105 transition-transform duration-500 shadow-emerald-500/10">
                            {user?.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 w-full space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-500 tracking-[0.2em] uppercase px-1">Display Name</label>
                                    <input 
                                        type="text" 
                                        value={profile.name}
                                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-sm font-black text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:focus:bg-slate-800 transition-all shadow-inner" 
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-500 tracking-[0.2em] uppercase px-1">Contact Email</label>
                                    <input 
                                        type="email" 
                                        value={profile.email}
                                        onChange={(e) => setProfile({...profile, email: e.target.value})}
                                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-sm font-black text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:focus:bg-slate-800 transition-all shadow-inner" 
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-500 tracking-[0.2em] uppercase px-1">Organization Bio</label>
                                <textarea 
                                    value={profile.bio}
                                    onChange={(e) => setProfile({...profile, bio: e.target.value})}
                                    rows="3"
                                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:focus:bg-slate-800 transition-all shadow-inner resize-none" 
                                />
                            </div>
                        </div>
                    </div>
                  </div>
                </BorderGlow>
 
                {/* Logistics Preferences */}
                <BorderGlow 
                  borderRadius={32}
                  backgroundColor="#060010"
                  className="shadow-xl shadow-slate-900/5 dark:shadow-none animate-fade-in-up delay-100 transition-all overflow-visible"
                >
                  <div className="p-6 md:p-10">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center uppercase tracking-tight">
                        <Truck size={24} className="text-blue-500 mr-3" /> Network Logistics
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 tracking-[0.2em] uppercase px-1">Operating Radius</label>
                            <div className="relative">
                                <select className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-sm font-black text-slate-900 dark:text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all shadow-inner">
                                    <option>Local Neighborhood (5 km)</option>
                                    <option>City District (15 km)</option>
                                    <option>Metro Area (50 km)</option>
                                </select>
                                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 tracking-[0.2em] uppercase px-1">Measurement Standard</label>
                            <div className="relative">
                                <select className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-sm font-black text-slate-900 dark:text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all shadow-inner">
                                    <option>Kilograms (kg)</option>
                                    <option>Pounds (lbs)</option>
                                    <option>Meal Units</option>
                                </select>
                                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                  </div>
                </BorderGlow>
 
            </div>
 
            {/* Right Column - Toggles & Security */}
            <div className="w-full xl:w-96 space-y-8 animate-fade-in-up delay-200">
                
                {/* Notification Toggles */}
                <BorderGlow 
                  borderRadius={32}
                  backgroundColor="#060010"
                  className="shadow-xl shadow-slate-900/5 dark:shadow-none transition-all overflow-visible"
                >
                  <div className="p-6 md:p-8">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white mb-8 tracking-tight flex items-center uppercase">
                        <BellRing size={20} className="text-orange-500 mr-3" /> Notifications
                    </h2>
                    
                    <div className="space-y-6">
                        <div className="flex items-center justify-between group cursor-pointer" onClick={() => toggleNotification('email')}>
                            <div className="flex items-center">
                                <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl mr-4 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-all border border-slate-200 dark:border-slate-800">
                                   <Mail size={18} className="text-slate-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none mb-1">Email Reports</h3>
                                    <p className="text-[10px] text-slate-500 font-black tracking-[0.2em] uppercase leading-none">Daily impact stats</p>
                                </div>
                            </div>
                            <div className={`w-10 h-5 rounded-full p-0.5 transition-all duration-500 ease-in-out ${notifications.email ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`}>
                                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-500 ease-in-out ${notifications.email ? 'translate-x-5' : 'translate-x-0'}`}></div>
                            </div>
                        </div>
 
                        <div className="flex items-center justify-between group cursor-pointer" onClick={() => toggleNotification('sms')}>
                            <div className="flex items-center">
                                <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl mr-4 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all border border-slate-200 dark:border-slate-800">
                                   <Smartphone size={18} className="text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none mb-1">SMS Alerts</h3>
                                    <p className="text-[10px] text-slate-500 font-black tracking-[0.2em] uppercase leading-none">Pickup confirmations</p>
                                </div>
                            </div>
                            <div className={`w-10 h-5 rounded-full p-0.5 transition-all duration-500 ease-in-out ${notifications.sms ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`}>
                                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-500 ease-in-out ${notifications.sms ? 'translate-x-5' : 'translate-x-0'}`}></div>
                            </div>
                        </div>
 
                        <div className="flex items-center justify-between group cursor-pointer" onClick={() => toggleNotification('urgent')}>
                            <div className="flex items-center">
                                <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl mr-4 group-hover:bg-red-50 dark:group-hover:bg-red-900/20 group-hover:text-red-500 dark:group-hover:text-red-400 transition-all border border-slate-200 dark:border-slate-800">
                                   <ShieldAlert size={18} className="text-slate-500 group-hover:text-red-500 dark:group-hover:text-red-400" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none mb-1">Urgent Tasks</h3>
                                    <p className="text-[10px] text-slate-500 font-black tracking-[0.2em] uppercase leading-none">Food expirations</p>
                                </div>
                            </div>
                            <div className={`w-10 h-5 rounded-full p-0.5 transition-all duration-500 ease-in-out ${notifications.urgent ? 'bg-red-500' : 'bg-slate-200 dark:bg-slate-800'}`}>
                                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-500 ease-in-out ${notifications.urgent ? 'translate-x-5' : 'translate-x-0'}`}></div>
                            </div>
                        </div>
                    </div>
                  </div>
                </BorderGlow>
 
                {/* Security Card */}
                <BorderGlow 
                  borderRadius={32}
                  backgroundColor="#060010"
                  className="relative group shadow-2xl transition-all overflow-visible"
                >
                  <div className="p-6 md:p-10">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-bl-full filter blur-2xl group-hover:bg-red-500/20 transition-all pointer-events-none"></div>
                    
                    <h2 className="text-xl font-black text-slate-900 dark:text-white mb-8 relative z-10 flex items-center uppercase tracking-tight">
                        <Lock size={22} className="text-red-500 mr-3" /> Security
                    </h2>
                    
                    <div className="space-y-4 relative z-10">
                        <button onClick={handleChangePassword} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 py-4 rounded-2xl text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex justify-between items-center px-6 hover:border-slate-400 dark:hover:border-slate-500">
                            Change Password <ChevronRight size={16} />
                        </button>
                        <button onClick={handleToggle2FA} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 py-4 rounded-2xl text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex justify-between items-center px-6 hover:border-slate-400 dark:hover:border-slate-500">
                            2FA Auth 
                            {user?.is2FAEnabled ? (
                              <span className="text-[9px] bg-emerald-500/20 text-emerald-500 px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-500/30 font-black ml-4">ACTIVE</span>
                            ) : (
                              <span className="text-[9px] bg-red-500/20 text-red-500 px-3 py-1 rounded-full uppercase tracking-widest border border-red-500/30 font-black ml-4">INACTIVE</span>
                            )}
                        </button>
                    </div>
 
                    <div className="mt-10 pt-8 border-t border-slate-200 dark:border-slate-800 relative z-10">
                        <button onClick={handleDelete} className="w-full text-red-500/80 text-[10px] font-black hover:text-red-600 dark:hover:text-red-400 transition-all tracking-[0.2em] uppercase flex items-center justify-center">
                            Close Account Handle
                        </button>
                    </div>
                  </div>
                </BorderGlow>
            </div>
        </div>
      </div>
    );
};
  
export default Settings;
