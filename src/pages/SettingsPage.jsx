import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

function SettingsPage() {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { language, changeLanguage, t } = useLanguage();
  const [userData, setUserData] = useState({ name: '', email: '' });
  const [userAvatar, setUserAvatar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);

  useEffect(() => {
    const storedName = localStorage.getItem('user_name');
    const storedEmail = localStorage.getItem('user_email');
    const storedAvatar = localStorage.getItem('user_avatar');
    
    setUserData({
      name: storedName || 'Pengguna',
      email: storedEmail || 'email@example.com'
    });
    if (storedAvatar) setUserAvatar(storedAvatar);
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      localStorage.clear();
      showToast(t('saveSuccess'), 'success');
      setTimeout(() => {
        navigate('/login');
      }, 1000);
    } catch (error) {
      console.error('Logout error:', error);
      showToast(t('errorOccurred'), 'error');
    } finally {
      setLoading(false);
      setShowLogoutConfirm(false);
    }
  };

  const handleLanguageChange = (newLang) => {
    changeLanguage(newLang);
    showToast(`Bahasa diubah ke ${newLang === 'id' ? 'Indonesia' : 'English'}`, 'success');
  };

  const userInitial = userData.name ? userData.name.charAt(0).toUpperCase() : 'U';

  // Data tim capstone
  const teamMembers = [
    { 
      role: 'Full-Stack Web Developer', 
      members: ['Celvin Alfiansyah', 'Alkadafi Firnawan'],
      icon: 'code'
    },
    { 
      role: 'AI Engineer', 
      members: ['Anisa Nabila', 'Izzatul Aliya Nisa'],
      icon: 'robot_2'
    },
    { 
      role: 'Data Scientist', 
      members: ['Meilani Bulandari Hasibuan', 'Yelly Ambarwaty'],
      icon: 'analytics'
    }
  ];

  return (
    <div className={`h-screen flex overflow-hidden font-sans antialiased transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'
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
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-3xl text-rose-600">logout</span>
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                {t('logoutConfirm')}
              </h3>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className={`flex-1 px-4 py-2 border rounded-lg font-medium transition-all ${
                  isDarkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleLogout}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 disabled:opacity-50 transition-all"
              >
                {loading ? t('processing') : t('confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* About Modal */}
      {showAboutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl max-w-md w-full shadow-xl overflow-hidden ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className={`p-5 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center`}>
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Tentang SIMU
              </h3>
              <button 
                onClick={() => setShowAboutModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              {/* Logo & Deskripsi */}
              <div className="text-center">
                <div className="w-16 h-16 bg-[#00685f] rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <img src="/favicon.webp" alt="SIMU Logo" className="w-full h-full object-cover rounded-lg"/>
                </div>
                <h4 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>SIMU</h4>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                  Sistem Informasi Manajemen Uang
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-2`}>
                  Aplikasi pencatat dan perencana keuangan pribadi untuk generasi muda.
                </p>
              </div>

              {/* Team Members */}
              <div className={`pt-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                <p className={`text-xs font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-3`}>
                  Dibuat oleh Tim Capstone CC26-PSU171:
                </p>
                <div className="space-y-3">
                  {teamMembers.map((team, idx) => (
                    <div key={idx} className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-[#00685f] text-sm">{team.icon}</span>
                        <span className={`text-xs font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          {team.role}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {team.members.map((member, mIdx) => (
                          <span key={mIdx} className={`text-[10px] px-2 py-0.5 rounded-full ${
                            isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-white text-gray-600 border border-gray-200'
                          }`}>
                            {member}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact */}
              <div className={`pt-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                <p className={`text-xs font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                  Kontak:
                </p>
                <div className="space-y-1">
                  <a 
                    href="mailto:simu.finance@example.com" 
                    className={`flex items-center gap-2 text-xs ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-[#00685f]'} transition-colors`}
                  >
                    <span className="material-symbols-outlined text-sm">mail</span>
                    simu.finance@example.com
                  </a>
                  <a 
                    href="https://github.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 text-xs ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-[#00685f]'} transition-colors`}
                  >
                    <span className="material-symbols-outlined text-sm">code</span>
                    GitHub Repository
                  </a>
                </div>
              </div>

              {/* Version */}
              <div className={`pt-3 text-center border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                <p className={`text-[9px] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Version 1.0.0 • © 2024 SIMU
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <Sidebar userData={userData} userAvatar={userAvatar} userInitial={userInitial} />

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className={`px-6 py-4 flex items-center justify-between border-b z-20 flex-shrink-0 ${
          isDarkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-gray-200'
        } backdrop-blur-md`}>
          <div>
            <h1 className="text-xl font-bold" style={{ fontFamily: 'Manrope, sans-serif' }}>
              {t('settingsTitle')}
            </h1>
            <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('settingsSub')}
            </p>
          </div>
          <span className={`text-[10px] font-semibold px-3 py-1.5 rounded-lg border ${
            isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-500'
          }`}>
            {t('version')}
          </span>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
          <div className="max-w-2xl mx-auto space-y-5">
            
            {/* Profile Card */}
            <div className={`p-5 rounded-xl border shadow-sm ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#00685f] bg-[#d8e5e2] flex items-center justify-center font-bold text-lg text-[#00685f] flex-shrink-0">
                  {userAvatar ? <img src={userAvatar} className="w-full h-full object-cover" alt="avatar" /> : userInitial}
                </div>
                <div>
                  <h3 className="text-base font-bold" style={{ fontFamily: 'Manrope, sans-serif' }}>
                    {userData.name}
                  </h3>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {userData.email}
                  </p>
                  <button
                    onClick={() => navigate('/profile')}
                    className="mt-2 text-[11px] text-[#00685f] font-medium hover:underline"
                  >
                    {t('editProfile')} →
                  </button>
                </div>
              </div>
            </div>

            {/* Settings Options */}
            <div className={`rounded-xl border overflow-hidden ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              
              {/* Dark Mode Toggle */}
              <div className="flex items-center justify-between p-4 hover:bg-black/5 transition-all">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-gray-400">
                    {isDarkMode ? 'dark_mode' : 'light_mode'}
                  </span>
                  <div>
                    <div className="text-sm font-semibold">{isDarkMode ? t('darkMode') : t('lightMode')}</div>
                    <div className={`text-[10px] mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}>
                      {t('darkModeDesc')}
                    </div>
                  </div>
                </div>
                <button
                  onClick={toggleDarkMode}
                  className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                    isDarkMode ? 'bg-[#00685f]' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                    isDarkMode ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              <div className={`h-px mx-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`} />

              {/* Language Selection */}
              <div className="flex items-center justify-between p-4 hover:bg-black/5 transition-all">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-gray-400">language</span>
                  <div>
                    <div className="text-sm font-semibold">{t('language')}</div>
                    <div className={`text-[10px] mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}>
                      {t('languageDesc')}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleLanguageChange('id')}
                    className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all ${
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
                    className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all ${
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

              <div className={`h-px mx-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`} />

            {/* About */}
            <button 
              onClick={() => navigate('/about')}
              className="w-full flex items-center justify-between p-4 hover:bg-black/5 transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-gray-400">info</span>
                <div className="text-left">
                  <div className="text-sm font-semibold">{t('about')}</div>
                  <div className={`text-[10px] mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}>
                    {t('aboutDesc')}
                  </div>
                </div>
              </div>
              <span className="material-symbols-outlined text-gray-400 text-sm">chevron_right</span>
            </button>
            </div>

            {/* Danger Zone */}
            <div className={`rounded-xl border border-rose-200 overflow-hidden ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="p-4 border-b border-rose-100">
                <h4 className="text-sm font-bold text-rose-600">{t('dangerZone')}</h4>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  {t('dangerDesc')}
                </p>
              </div>
              
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full flex items-center justify-between p-4 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-rose-600">logout</span>
                  <span className="text-sm font-semibold text-rose-600">{t('logout')}</span>
                </div>
                <span className="material-symbols-outlined text-rose-400 text-sm">logout</span>
              </button>
            </div>

            {/* Footer Note */}
            <p className={`text-center text-[10px] ${isDarkMode ? 'text-gray-600' : 'text-gray-400'} py-3`}>
              &copy; 2024 SIMU. {t('aboutDesc')}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Navigation for Mobile */}
      <nav className={`fixed bottom-0 left-0 right-0 z-50 border-t flex justify-around items-center h-16 px-4 md:hidden ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <button onClick={() => navigate('/dashboard')} className="flex flex-col items-center justify-center text-gray-400 hover:text-[#00685f]">
          <span className="material-symbols-outlined text-base">dashboard</span>
          <span className="text-[9px] font-medium mt-0.5">{t('dashboard')}</span>
        </button>
        <button onClick={() => navigate('/statistics')} className="flex flex-col items-center justify-center text-gray-400 hover:text-[#00685f]">
          <span className="material-symbols-outlined text-base">analytics</span>
          <span className="text-[9px] font-medium mt-0.5">{t('statistics')}</span>
        </button>
        <button onClick={() => navigate('/history')} className="flex flex-col items-center justify-center text-gray-400 hover:text-[#00685f]">
          <span className="material-symbols-outlined text-base">receipt_long</span>
          <span className="text-[9px] font-medium mt-0.5">{t('history')}</span>
        </button>
        <button onClick={() => navigate('/settings')} className="flex flex-col items-center justify-center text-[#00685f]">
          <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>settings</span>
          <span className="text-[9px] font-bold mt-0.5">{t('settings')}</span>
        </button>
      </nav>
    </div>
  );
}

export default SettingsPage;