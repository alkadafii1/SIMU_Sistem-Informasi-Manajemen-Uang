import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { useLanguage } from '../context/LanguageContext';
import Sidebar from '../components/Sidebar';

function AboutPage() {
  const navigate = useNavigate();
  const { isDarkMode, bgColor, cardBg, borderColor, textPrimary, textSecondary } = useThemeStyles();
  const { t } = useLanguage();

  // User data
  const userData = {
    name: localStorage.getItem('user_name') || 'Pengguna',
    email: localStorage.getItem('user_email') || 'email@example.com',
  };
  const userAvatar = localStorage.getItem('user_avatar');
  const userInitial = userData.name.charAt(0).toUpperCase();

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
    <div className={`min-h-screen ${bgColor}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          vertical-align: middle;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      <div className="flex h-screen overflow-hidden">
        <Sidebar userData={userData} userAvatar={userAvatar} userInitial={userInitial} />

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className={`${cardBg} border-b ${borderColor} px-6 py-4 sticky top-0 z-10 flex-shrink-0`}>
            <div className="flex justify-between items-center">
              <div>
                <h1 className={`text-xl font-bold ${textPrimary}`}>Tentang Aplikasi</h1>
                <p className={`text-xs ${textSecondary} mt-0.5`}>
                  Informasi tentang SIMU dan tim pengembang
                </p>
              </div>
              <button
                onClick={() => navigate('/settings')}
                className={`flex items-center gap-2 ${borderColor} ${textSecondary} px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-all`}
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Kembali
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
            <div className="max-w-3xl mx-auto">
              
              {/* Hero Section - Logo & Deskripsi */}
              <div className={`${cardBg} rounded-xl border ${borderColor} shadow-sm p-6 mb-6`}>
                <div className="flex flex-col items-center text-center">
                  <div className="w-15 h-15 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg">
                    <img src="/favicon.webp" alt="SIMU Logo" className="w-16 h-16 object-contain" />
                  </div>
                  <h2 className={`text-2xl font-bold ${textPrimary}`}>SIMU</h2>
                  <p className={`text-sm ${textSecondary} mt-1`}>
                    Sistem Informasi Manajemen Uang
                  </p>
                  <div className={`w-16 h-0.5 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} my-4`}></div>
                  <p className={`text-sm ${textSecondary} leading-relaxed text-left`}>
                    SIMU adalah aplikasi pencatat dan perencana keuangan pribadi yang dirancang khusus 
                    untuk generasi muda. Dengan fitur alokasi anggaran otomatis (50/30/20), AI Financial Assistant, 
                    dan target tabungan, SIMU membantu Anda mengelola keuangan dengan lebih cerdas dan terstruktur.
                  </p>
                </div>
              </div>

              {/* Features Section */}
              <div className={`${cardBg} rounded-xl border ${borderColor} shadow-sm p-6 mb-6`}>
                <h3 className={`text-base font-bold ${textPrimary} mb-4 flex items-center gap-2`}>
                  <span className="material-symbols-outlined text-[#00685f]">star</span>
                  Fitur Utama
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[#00685f] text-sm">check_circle</span>
                    <div>
                      <p className={`text-sm font-semibold ${textPrimary}`}>Pencatatan Transaksi</p>
                      <p className={`text-xs ${textSecondary}`}>Catat pemasukan & pengeluaran dengan mudah</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[#00685f] text-sm">check_circle</span>
                    <div>
                      <p className={`text-sm font-semibold ${textPrimary}`}>Alokasi Anggaran Otomatis</p>
                      <p className={`text-xs ${textSecondary}`}>Metode 50/30/20 atau custom</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[#00685f] text-sm">check_circle</span>
                    <div>
                      <p className={`text-sm font-semibold ${textPrimary}`}>AI Financial Assistant</p>
                      <p className={`text-xs ${textSecondary}`}>Rekomendasi personal berbasis Gemini AI</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[#00685f] text-sm">check_circle</span>
                    <div>
                      <p className={`text-sm font-semibold ${textPrimary}`}>Target Tabungan</p>
                      <p className={`text-xs ${textSecondary}`}>Kelola target finansial impian</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[#00685f] text-sm">check_circle</span>
                    <div>
                      <p className={`text-sm font-semibold ${textPrimary}`}>Laporan & Statistik</p>
                      <p className={`text-xs ${textSecondary}`}>Visualisasi data keuangan</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[#00685f] text-sm">check_circle</span>
                    <div>
                      <p className={`text-sm font-semibold ${textPrimary}`}>Dark Mode Support</p>
                      <p className={`text-xs ${textSecondary}`}>Tampilan nyaman siang & malam</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Team Section */}
              <div className={`${cardBg} rounded-xl border ${borderColor} shadow-sm p-6 mb-6`}>
                <h3 className={`text-base font-bold ${textPrimary} mb-4 flex items-center gap-2`}>
                  <span className="material-symbols-outlined text-[#00685f]">groups</span>
                  Tim Pengembang
                </h3>
                <p className={`text-xs ${textSecondary} mb-4`}>
                  Proyek Capstone CC26-PSU171 - Coding Camp 2026 powered by DBS Foundation
                </p>
                <div className="space-y-4">
                  {teamMembers.map((team, idx) => (
                    <div key={idx} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-[#00685f] text-sm">{team.icon}</span>
                        <span className={`text-sm font-semibold ${textPrimary}`}>{team.role}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {team.members.map((member, mIdx) => (
                          <span key={mIdx} className={`text-xs px-2.5 py-1 rounded-full ${
                            isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-600 border border-gray-200'
                          }`}>
                            {member}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Section */}
              <div className={`${cardBg} rounded-xl border ${borderColor} shadow-sm p-6 mb-6`}>
                <h3 className={`text-base font-bold ${textPrimary} mb-4 flex items-center gap-2`}>
                  <span className="material-symbols-outlined text-[#00685f]">contact_support</span>
                  Kontak & Informasi
                </h3>
                <div className="space-y-3">
                  <a 
                    href="mailto:simu.finance@example.com" 
                    className={`flex items-center gap-3 p-3 rounded-lg ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'} transition-all`}
                  >
                    <span className="material-symbols-outlined text-[#00685f]">mail</span>
                    <div>
                      <p className={`text-sm font-medium ${textPrimary}`}>Email</p>
                      <p className={`text-xs ${textSecondary}`}>simu.finance@example.com</p>
                    </div>
                  </a>
                  <a 
                    href="https://github.com/alkadafii1/SIMU_Sistem-Informasi-Manajemen-Uang" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`flex items-center gap-3 p-3 rounded-lg ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'} transition-all`}
                  >
                    <span className="material-symbols-outlined text-[#00685f]">code</span>
                    <div>
                      <p className={`text-sm font-medium ${textPrimary}`}>GitHub</p>
                      <p className={`text-xs ${textSecondary}`}>github.com/simu-finance</p>
                    </div>
                  </a>
                </div>
              </div>

              {/* Version Footer */}
              <div className="text-center py-4">
                <p className={`text-[10px] ${textSecondary}`}>
                  Version 1.0.0 • © 2024 SIMU
                </p>
                <p className={`text-[9px] ${textSecondary} mt-1`}>
                  Coding Camp 2026 powered by DBS Foundation
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutPage;