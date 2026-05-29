import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

function SettingsPage() {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [userData, setUserData] = useState({ name: '', email: '' });
  const [userAvatar, setUserAvatar] = useState(null);
  const [language, setLanguage] = useState('id');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const storedName = localStorage.getItem('user_name');
    const storedEmail = localStorage.getItem('user_email');
    const storedAvatar = localStorage.getItem('user_avatar');
    const storedLanguage = localStorage.getItem('language');
    
    setUserData({
      name: storedName || 'Pengguna',
      email: storedEmail || 'email@example.com'
    });
    if (storedAvatar) setUserAvatar(storedAvatar);
    if (storedLanguage) setLanguage(storedLanguage);
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      // Clear local storage
      localStorage.clear();
      
      showToast('Berhasil keluar dari akun', 'success');
      setTimeout(() => {
        navigate('/login');
      }, 1000);
    } catch (error) {
      console.error('Logout error:', error);
      showToast('Gagal keluar dari akun', 'error');
    } finally {
      setLoading(false);
      setShowLogoutConfirm(false);
    }
  };

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    localStorage.setItem('language', newLang);
    showToast(`Bahasa diubah ke ${newLang === 'id' ? 'Indonesia' : 'English'}`, 'success');
    // Reload page to apply language changes
    setTimeout(() => window.location.reload(), 1000);
  };

  const text = {
    id: {
      title: 'Pengaturan',
      sub: 'Aplikasi Finansial',
      profile: 'Pengaturan Profil',
      theme: `Mode Tema: ${isDarkMode ? 'Gelap' : 'Terang'}`,
      lang: `Bahasa: ${language === 'id' ? 'Indonesia' : 'English'}`,
      logout: 'Keluar dari Akun',
      deleteAccount: 'Hapus Akun',
      about: 'Tentang Aplikasi',
      version: 'Versi 1.0.0',
      logoutConfirm: 'Apakah Anda yakin ingin keluar?',
      logoutCancel: 'Batal',
      logoutConfirmBtn: 'Keluar',
      darkModeDesc: 'Mode gelap untuk kenyamanan mata',
      languageDesc: 'Pilih bahasa yang Anda inginkan',
    },
    en: {
      title: 'Settings',
      sub: 'Financial Application',
      profile: 'Profile Settings',
      theme: `Theme Mode: ${isDarkMode ? 'Dark' : 'Light'}`,
      lang: `Language: ${language === 'id' ? 'Indonesia' : 'English'}`,
      logout: 'Log Out',
      deleteAccount: 'Delete Account',
      about: 'About',
      version: 'Version 1.0.0',
      logoutConfirm: 'Are you sure you want to logout?',
      logoutCancel: 'Cancel',
      logoutConfirmBtn: 'Logout',
      darkModeDesc: 'Dark mode for eye comfort',
      languageDesc: 'Choose your preferred language',
    }
  }[language];

  const userInitial = userData.name ? userData.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className={`h-screen flex overflow-hidden font-sans antialiased transition-colors duration-300 ${
      isDarkMode ? 'bg-[#111827] text-white' : 'bg-[#f9f9ff] text-[#151c27]'
    }`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        .material-symbols-outlined { 
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; 
          display: inline-block; 
          line-height: 1; 
          vertical-align: middle; 
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .toast-slide {
          animation: slideDown 0.3s ease forwards;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-5 left-1/2 transform -translate-x-1/2 z-50 toast-slide w-auto max-w-md px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 ${
          toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
        }`}>
          <span className="material-symbols-outlined text-xl">
            {toast.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
      )}

      {/* Logout Confirm Dialog */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`rounded-2xl p-6 max-w-md mx-4 shadow-xl ${
            isDarkMode ? 'bg-[#1f2937]' : 'bg-white'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-3xl text-rose-600">logout</span>
              <h3 className="text-lg font-bold">{text.logoutConfirm}</h3>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 font-medium hover:bg-gray-50"
              >
                {text.logoutCancel}
              </button>
              <button
                onClick={handleLogout}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 disabled:opacity-50"
              >
                {loading ? 'Memproses...' : text.logoutConfirmBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar - Akan mengikuti theme dari Context */}
      <Sidebar userData={userData} userAvatar={userAvatar} userInitial={userInitial} />

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className={`px-8 py-5 flex items-center justify-between border-b z-20 flex-shrink-0 ${
          isDarkMode ? 'bg-[#1f2937]/80 border-gray-700' : 'bg-white/80 border-gray-200'
        } backdrop-blur-md`}>
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'Manrope, sans-serif' }}>
              {text.title}
            </h1>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Kelola preferensi akun dan aplikasi Anda
            </p>
          </div>
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-lg border ${
            isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-500'
          }`}>
            {text.version}
          </span>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
          <div className="max-w-2xl mx-auto space-y-6">
            
            {/* Profile Card */}
            <div className={`p-6 rounded-xl border shadow-sm ${
              isDarkMode ? 'bg-[#1f2937] border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#00685f] bg-[#d8e5e2] flex items-center justify-center font-bold text-xl text-[#00685f] flex-shrink-0">
                  {userAvatar ? <img src={userAvatar} className="w-full h-full object-cover" alt="avatar" /> : userInitial}
                </div>
                <div>
                  <h3 className="text-lg font-bold" style={{ fontFamily: 'Manrope, sans-serif' }}>
                    {userData.name}
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {userData.email}
                  </p>
                  <button
                    onClick={() => navigate('/profile')}
                    className="mt-2 text-xs text-[#00685f] font-medium hover:underline"
                  >
                    Edit Profil →
                  </button>
                </div>
              </div>
            </div>

            {/* Settings Options */}
            <div className={`rounded-xl border overflow-hidden ${
              isDarkMode ? 'bg-[#1f2937] border-gray-700' : 'bg-white border-gray-200'
            }`}>
              
              {/* Dark Mode Toggle */}
              <div className="flex items-center justify-between p-5 hover:bg-black/5 transition-all">
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-slate-400">
                    {isDarkMode ? 'dark_mode' : 'light_mode'}
                  </span>
                  <div>
                    <div className="text-sm font-semibold">{text.theme}</div>
                    <div className={`text-xs mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}>
                      {text.darkModeDesc}
                    </div>
                  </div>
                </div>
                <button
                  onClick={toggleDarkMode}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${
                    isDarkMode ? 'bg-[#00685f]' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                    isDarkMode ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              <div className={`h-px mx-5 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`} />

              {/* Language Selection */}
              <div className="flex items-center justify-between p-5 hover:bg-black/5 transition-all">
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-slate-400">language</span>
                  <div>
                    <div className="text-sm font-semibold">{text.lang}</div>
                    <div className={`text-xs mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}>
                      {text.languageDesc}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleLanguageChange('id')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      language === 'id'
                        ? 'bg-[#00685f] text-white'
                        : isDarkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    ID
                  </button>
                  <button
                    onClick={() => handleLanguageChange('en')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      language === 'en'
                        ? 'bg-[#00685f] text-white'
                        : isDarkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    EN
                  </button>
                </div>
              </div>

              <div className={`h-px mx-5 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`} />

              {/* About */}
              <button className="w-full flex items-center justify-between p-5 hover:bg-black/5 transition-all">
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-slate-400">info</span>
                  <div>
                    <div className="text-sm font-semibold">{text.about}</div>
                    <div className={`text-xs mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}>
                      WealthFlow - Kelola keuangan dengan bijak
                    </div>
                  </div>
                </div>
                <span className="material-symbols-outlined text-slate-400 text-sm">chevron_right</span>
              </button>
            </div>

            {/* Danger Zone */}
            <div className={`rounded-xl border border-rose-200 overflow-hidden ${
              isDarkMode ? 'bg-[#1f2937]' : 'bg-white'
            }`}>
              <div className="p-5 border-b border-rose-100">
                <h4 className="text-sm font-bold text-rose-600">⚠️ Danger Zone</h4>
                <p className="text-xs text-gray-500 mt-1">
                  Tindakan ini tidak dapat dibatalkan
                </p>
              </div>
              
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full flex items-center justify-between p-5 hover:bg-rose-50 transition-all"
              >
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-rose-600">logout</span>
                  <span className="text-sm font-semibold text-rose-600">{text.logout}</span>
                </div>
                <span className="material-symbols-outlined text-rose-400 text-sm">logout</span>
              </button>
            </div>

            {/* Footer Note */}
            <p className={`text-center text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} py-4`}>
              &copy; 2024 WealthFlow. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Navigation for Mobile */}
      <nav className={`fixed bottom-0 left-0 right-0 z-50 border-t flex justify-around items-center h-20 px-4 md:hidden ${
        isDarkMode ? 'bg-[#1f2937] border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <button onClick={() => navigate('/dashboard')} className="flex flex-col items-center justify-center text-slate-400 hover:text-[#00685f]">
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-[11px] font-medium mt-1">Beranda</span>
        </button>
        <button onClick={() => navigate('/statistics')} className="flex flex-col items-center justify-center text-slate-400 hover:text-[#00685f]">
          <span className="material-symbols-outlined">analytics</span>
          <span className="text-[11px] font-medium mt-1">Statistik</span>
        </button>
        <button onClick={() => navigate('/history')} className="flex flex-col items-center justify-center text-slate-400 hover:text-[#00685f]">
          <span className="material-symbols-outlined">receipt_long</span>
          <span className="text-[11px] font-medium mt-1">Riwayat</span>
        </button>
        <button onClick={() => navigate('/settings')} className="flex flex-col items-center justify-center text-[#00685f]">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>settings</span>
          <span className="text-[11px] font-bold mt-1">Setelan</span>
        </button>
      </nav>
    </div>
  );
}

export default SettingsPage;