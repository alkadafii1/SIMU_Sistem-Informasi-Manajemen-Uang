import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function SettingsPage() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({ name: 'Celvin Alfiansyah', email: 'celvin@email.com' });
  const [userAvatar, setUserAvatar] = useState(null); // Tambah State Foto
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState('id');

  useEffect(() => {
    const storedName = localStorage.getItem('user_name');
    const storedEmail = localStorage.getItem('user_email');
    const storedAvatar = localStorage.getItem('user_avatar'); // Ambil foto
    
    if (storedName || storedEmail) {
      setUserData({ name: storedName || 'Celvin Alfiansyah', email: storedEmail || 'celvin@email.com' });
    }
    if (storedAvatar) setUserAvatar(storedAvatar);
  }, []);

  const userInitial = userData.name ? userData.name.charAt(0).toUpperCase() : 'U';

  const text = {
    id: {
      title: 'Pengaturan', sub: 'Aplikasi Finansial', profile: 'Pengaturan Profil',
      theme: `Mode Tema: ${isDarkMode ? 'Gelap' : 'Terang'}`, lang: `Bahasa: ${language === 'id' ? 'Indonesia' : 'English'}`,
      logout: 'Keluar dari Akun', navDash: 'Dashboard', navStat: 'Statistik Analisis', navHist: 'Riwayat Aktivitas', navTarget: 'Target Tabungan', navSet: 'Pengaturan'
    },
    en: {
      title: 'Settings', sub: 'Financial Application', profile: 'Profile Settings',
      theme: `Theme Mode: ${isDarkMode ? 'Dark' : 'Light'}`, lang: `Language: ${language === 'id' ? 'Indonesia' : 'English'}`,
      logout: 'Log Out Account', navDash: 'Dashboard', navStat: 'Analytical Statistics', navHist: 'Activity History', navTarget: 'Savings Goal', navSet: 'Settings'
    }
  }[language];

  return (
    <div className={`h-screen flex overflow-hidden font-sans antialiased transition-colors duration-300 ${isDarkMode ? 'bg-[#111827] text-white' : 'bg-[#f9f9ff] text-[#151c27]'}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; display: inline-block; line-height: 1; vertical-align: middle; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* SIDEBAR */}
      <aside className={`w-64 border-r flex flex-col justify-between p-6 h-full flex-shrink-0 hidden md:flex ${isDarkMode ? 'bg-[#1f2937] border-gray-700' : 'bg-white border-slate-100'}`}>
        <div className="space-y-8">
          <div onClick={() => navigate('/dashboard')} className="cursor-pointer flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-xl bg-[#00685f] flex items-center justify-center text-white shadow-xs">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
            </div>
            <span className="text-xl font-extrabold text-[#00685f] tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>WealthFlow</span>
          </div>

          <nav className="space-y-1.5">
            <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-slate-400 hover:text-[#00685f] hover:bg-slate-50 font-medium text-sm border-none cursor-pointer text-left transition-all">
              <span className="material-symbols-outlined">dashboard</span>
              <span>{text.navDash}</span>
            </button>
            <button onClick={() => navigate('/statistics')} className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-slate-400 hover:text-[#00685f] hover:bg-slate-50 font-medium text-sm border-none cursor-pointer text-left transition-all">
              <span className="material-symbols-outlined">analytics</span>
              <span>{text.navStat}</span>
            </button>
            <button onClick={() => navigate('/history')} className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-slate-400 hover:text-[#00685f] hover:bg-slate-50 font-medium text-sm border-none cursor-pointer text-left transition-all">
              <span className="material-symbols-outlined">receipt_long</span>
              <span>{text.navHist}</span>
            </button>
            <button onClick={() => navigate('/transaction')} className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-slate-400 hover:text-[#00685f] hover:bg-slate-50 font-medium text-sm border-none cursor-pointer text-left transition-all">
              <span className="material-symbols-outlined">payments</span>
              <span>{text.navTarget}</span>
            </button>
            <button onClick={() => navigate('/settings')} className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl bg-[#00685f]/10 text-[#00685f] font-semibold text-sm border-none cursor-pointer text-left">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>settings</span>
              <span>{text.navSet}</span>
            </button>
          </nav>
        </div>

        <div className={`pt-4 border-t flex items-center gap-3 ${isDarkMode ? 'border-gray-700' : 'border-slate-100'}`}>
          <div className="w-10 h-10 rounded-full overflow-hidden border border-[#00685f]/20 bg-[#d8e5e2] flex items-center justify-center font-bold text-[#00685f] flex-shrink-0">
            {userAvatar ? <img src={userAvatar} className="w-full h-full object-cover" alt="avatar" /> : userInitial}
          </div>
          <div className="flex flex-col text-left overflow-hidden">
            <span className={`text-xs font-bold truncate ${isDarkMode ? 'text-gray-200' : 'text-slate-800'}`}>{userData.name}</span>
            <span className="text-[10px] text-slate-400 font-medium truncate">{userData.email}</span>
          </div>
        </div>
      </aside>

      {/* MAIN KONTEN */}
      <div className="flex-1 flex flex-col h-full overflow-hidden pb-20 md:pb-0">
        <header className={`px-8 py-4 flex items-center justify-between border-b z-20 flex-shrink-0 ${isDarkMode ? 'bg-[#1f2937]/80 border-gray-700' : 'bg-white/80 border-slate-100'} backdrop-blur-md`}>
          <h2 className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>{text.title}</h2>
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
            {text.sub}
          </span>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 no-scrollbar flex flex-col items-center">
          <div className="max-w-xl w-full space-y-5">
            
            {/* Bento Card */}
            <div className={`p-5 rounded-2xl border flex items-center gap-4 text-left ${isDarkMode ? 'bg-[#1f2937] border-gray-700' : 'bg-white border-slate-100'}`}>
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#00685f] bg-[#d8e5e2] flex items-center justify-center font-bold text-lg text-[#00685f] flex-shrink-0">
                {userAvatar ? <img src={userAvatar} className="w-full h-full object-cover" alt="avatar" /> : userInitial}
              </div>
              <div>
                <h3 className="text-base font-bold" style={{ fontFamily: 'Manrope, sans-serif' }}>{userData.name}</h3>
                <p className="text-xs font-medium text-slate-400">{userData.email}</p>
              </div>
            </div>

            <div className={`rounded-2xl border overflow-hidden flex flex-col ${isDarkMode ? 'bg-[#1f2937] border-gray-700' : 'bg-white border-slate-100'}`}>
              <button onClick={() => navigate('/profile')} className="w-full flex items-center justify-between p-5 hover:bg-slate-500/5 transition-all border-none bg-transparent cursor-pointer text-left text-inherit">
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-slate-400">person</span>
                  <span className="text-xs font-bold">{text.profile}</span>
                </div>
                <span className="material-symbols-outlined text-slate-300 text-sm">chevron_right</span>
              </button>
              
              <div className={`h-[1px] mx-5 ${isDarkMode ? 'bg-gray-700' : 'bg-slate-100'}`}></div>

              <button onClick={() => setIsDarkMode(!isDarkMode)} className="w-full flex items-center justify-between p-5 hover:bg-slate-500/5 transition-all border-none bg-transparent cursor-pointer text-left text-inherit">
                <div className="flex items-center gap-4">
                  <span className={`material-symbols-outlined ${isDarkMode ? 'text-amber-400' : 'text-slate-400'}`}>{isDarkMode ? 'dark_mode' : 'light_mode'}</span>
                  <span className="text-xs font-bold">{text.theme}</span>
                </div>
                <div className={`w-8 h-4 rounded-full p-0.5 transition-colors cursor-pointer ${isDarkMode ? 'bg-[#00685f]' : 'bg-slate-200'}`}>
                  <div className={`w-3 h-3 bg-white rounded-full transition-transform ${isDarkMode ? 'translate-x-4' : 'translate-x-0'}`}></div>
                </div>
              </button>

              <div className={`h-[1px] mx-5 ${isDarkMode ? 'bg-gray-700' : 'bg-slate-100'}`}></div>

              <button onClick={() => setLanguage(language === 'id' ? 'en' : 'id')} className="w-full flex items-center justify-between p-5 hover:bg-slate-500/5 transition-all border-none bg-transparent cursor-pointer text-left text-inherit">
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-slate-400">language</span>
                  <span className="text-xs font-bold">{text.lang}</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#00685f]/10 text-[#00685f] px-2 py-0.5 rounded">{language}</span>
              </button>
            </div>

            <button onClick={() => { if(window.confirm('Apakah anda ingin keluar dari akun?')) navigate('/login'); }} className="w-full flex items-center justify-center gap-2 p-4 bg-rose-50 hover:bg-rose-100 text-rose-600 transition-all rounded-2xl text-xs font-bold border-none cursor-pointer">
              <span className="material-symbols-outlined text-base">logout</span>
              <span>{text.logout}</span>
            </button>
          </div>
        </main>
      </div>

      {/* BOTTOM NAV BAR */}
      <nav className={`fixed bottom-0 left-0 right-0 z-50 border-t flex justify-around items-center h-20 px-4 md:hidden ${isDarkMode ? 'bg-[#1f2937] border-gray-700' : 'bg-white border-slate-100'}`}>
        <button onClick={() => navigate('/dashboard')} className="flex flex-col items-center justify-center text-slate-400 hover:text-[#00685f] border-none bg-transparent cursor-pointer">
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-[11px] font-medium mt-1">{text.navDash}</span>
        </button>
        <button onClick={() => navigate('/statistics')} className="flex flex-col items-center justify-center text-slate-400 hover:text-[#00685f] border-none bg-transparent cursor-pointer">
          <span className="material-symbols-outlined">analytics</span>
          <span className="text-[11px] font-medium mt-1">{text.navStat}</span>
        </button>
        <button onClick={() => navigate('/history')} className="flex flex-col items-center justify-center text-slate-400 hover:text-[#00685f] border-none bg-transparent cursor-pointer">
          <span className="material-symbols-outlined">receipt_long</span>
          <span className="text-[11px] font-medium mt-1">{text.navHist}</span>
        </button>
        <button onClick={() => navigate('/settings')} className="flex flex-col items-center justify-center text-[#00685f] font-semibold border-none bg-transparent cursor-pointer">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>settings</span>
          <span className="text-[11px] font-bold mt-1">{text.navSet}</span>
        </button>
      </nav>
    </div>
  );
}

export default SettingsPage;