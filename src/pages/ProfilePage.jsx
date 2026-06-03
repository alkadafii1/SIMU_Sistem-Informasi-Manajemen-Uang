import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { useLanguage } from '../context/LanguageContext';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

function ProfilePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { isDarkMode, bgColor, cardBg, borderColor, textPrimary, textSecondary } = useThemeStyles();
  const { t } = useLanguage();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [birthday, setBirthday] = useState('');
  const [profilePreview, setProfilePreview] = useState(null);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Fetch user data from backend
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Ambil data user dari localStorage
        const storedName = localStorage.getItem('user_name');
        const storedEmail = localStorage.getItem('user_email');
        const storedAvatar = localStorage.getItem('user_avatar');
        const storedPhone = localStorage.getItem('user_phone');
        const storedBirthday = localStorage.getItem('user_birthday');
        
        if (storedName) setName(storedName);
        if (storedEmail) setEmail(storedEmail);
        if (storedAvatar) setProfilePreview(storedAvatar);
        if (storedPhone) setPhone(storedPhone);
        if (storedBirthday) setBirthday(storedBirthday);
        
        // Ambil data setup dari backend
        const response = await api.get('/user/setup');
        if (response.data.success && response.data.setup) {
          setMonthlyIncome(response.data.setup.income || 0);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Validasi file gambar
  const validateImageFile = (file) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    const maxSize = 2 * 1024 * 1024; // 2MB
    
    if (!allowedTypes.includes(file.type)) {
      showToast('Format file tidak didukung. Gunakan JPG, PNG, atau WEBP', 'error');
      return false;
    }
    if (file.size > maxSize) {
      showToast('Ukuran file maksimal 2MB', 'error');
      return false;
    }
    return true;
  };

  // Menangani upload foto
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && validateImageFile(file)) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setProfilePreview(base64String);
        localStorage.setItem('user_avatar', base64String);
        showToast('Foto profil berhasil diunggah!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setProfilePreview(null);
    localStorage.removeItem('user_avatar');
    showToast('Foto profil dihapus', 'success');
  };

  // Validasi form
  const validateForm = () => {
    if (!name.trim()) {
      showToast('Nama lengkap harus diisi', 'error');
      return false;
    }
    if (name.length < 3) {
      showToast('Nama minimal 3 karakter', 'error');
      return false;
    }
    if (!email.trim()) {
      showToast('Email harus diisi', 'error');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast('Format email tidak valid', 'error');
      return false;
    }
    if (phone && !/^[\d\s\+-]+$/.test(phone)) {
      showToast('Format nomor telepon tidak valid', 'error');
      return false;
    }
    return true;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setSaving(true);
    try {
      // Simpan ke localStorage
      localStorage.setItem('user_name', name);
      localStorage.setItem('user_email', email);
      if (phone) localStorage.setItem('user_phone', phone);
      if (birthday) localStorage.setItem('user_birthday', birthday);
      
      // TODO: Update ke backend jika ada endpoint profile update
      // await api.put('/user/profile', { name, email, phone, birthday });
      
      showToast('Profil berhasil diperbarui!', 'success');
      setTimeout(() => navigate('/settings'), 1500);
    } catch (error) {
      console.error('Error saving profile:', error);
      showToast('Gagal menyimpan profil', 'error');
    } finally {
      setSaving(false);
    }
  };

  const userInitial = name ? name.charAt(0).toUpperCase() : 'U';

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(angka);
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${bgColor} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#00685f]"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgColor}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          vertical-align: middle;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
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
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 toast-slide w-auto max-w-md px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 ${
          toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
        }`}>
          <span className="material-symbols-outlined text-xl">
            {toast.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
      )}

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/jpeg,image/png,image/jpg,image/webp" 
        className="hidden" 
      />

      <div className="flex h-screen overflow-hidden">
        <Sidebar userData={{ name, email }} userAvatar={profilePreview} userInitial={userInitial} />

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className={`${cardBg} border-b ${borderColor} px-6 py-4 sticky top-0 z-10 flex-shrink-0`}>
            <div className="flex justify-between items-center">
              <div>
                <h1 className={`text-xl font-bold ${textPrimary}`}>Edit Profil</h1>
                <p className={`text-xs ${textSecondary} mt-0.5`}>
                  Kelola informasi akun Anda
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

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
            <div className="max-w-2xl mx-auto space-y-6">

              {/* Avatar Section */}
              <div className={`${cardBg} rounded-xl border ${borderColor} shadow-sm p-6`}>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className={`w-24 h-24 rounded-full border-4 border-[#00685f]/20 overflow-hidden flex items-center justify-center font-bold text-3xl text-[#00685f] flex-shrink-0 ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                  }`}>
                    {profilePreview ? (
                      <img src={profilePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      userInitial
                    )}
                  </div>
                  <div className="space-y-2 text-center sm:text-left">
                    <h3 className={`text-sm font-bold ${textPrimary}`}>Foto Profil</h3>
                    <p className={`text-xs ${textSecondary}`}>
                      Upload foto profil untuk mempersonalisasi akun Anda. (Max 2MB, format JPG/PNG/WEBP)
                    </p>
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <button 
                        type="button" 
                        onClick={triggerFileInput}
                        className="px-4 py-2 bg-[#00685f] hover:bg-[#005049] text-white font-semibold text-xs rounded-lg transition-all"
                      >
                        Upload Foto
                      </button>
                      {profilePreview && (
                        <button 
                          type="button" 
                          onClick={handleRemovePhoto}
                          className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold text-xs rounded-lg transition-all"
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Data Diri */}
              <form onSubmit={handleSave} className={`${cardBg} rounded-xl border ${borderColor} shadow-sm p-6 space-y-5`}>
                <h3 className={`text-sm font-bold ${textPrimary}`}>Informasi Pribadi</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nama Lengkap */}
                  <div className="space-y-1.5">
                    <label className={`text-[10px] font-bold ${textSecondary} uppercase tracking-wider block`}>
                      Nama Lengkap <span className="text-rose-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-lg text-sm transition-all ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-[#00685f] focus:ring-1 focus:ring-[#00685f]'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-[#00685f] focus:ring-1 focus:ring-[#00685f]'
                      } border focus:outline-none`}
                      placeholder="Masukkan nama lengkap"
                      required
                    />
                  </div>

                  {/* Tanggal Lahir */}
                  <div className="space-y-1.5">
                    <label className={`text-[10px] font-bold ${textSecondary} uppercase tracking-wider block`}>
                      Tanggal Lahir
                    </label>
                    <input 
                      type="date" 
                      value={birthday}
                      onChange={(e) => setBirthday(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-lg text-sm transition-all ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-[#00685f] focus:ring-1 focus:ring-[#00685f]'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-[#00685f] focus:ring-1 focus:ring-[#00685f]'
                      } border focus:outline-none`}
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className={`text-[10px] font-bold ${textSecondary} uppercase tracking-wider block`}>
                      Alamat Email <span className="text-rose-500">*</span>
                    </label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-lg text-sm transition-all ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-[#00685f] focus:ring-1 focus:ring-[#00685f]'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-[#00685f] focus:ring-1 focus:ring-[#00685f]'
                      } border focus:outline-none`}
                      placeholder="email@example.com"
                      required
                    />
                  </div>

                  {/* Nomor Telepon */}
                  <div className="space-y-1.5">
                    <label className={`text-[10px] font-bold ${textSecondary} uppercase tracking-wider block`}>
                      Nomor Telepon
                    </label>
                    <input 
                      type="tel" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-lg text-sm transition-all ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-[#00685f] focus:ring-1 focus:ring-[#00685f]'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-[#00685f] focus:ring-1 focus:ring-[#00685f]'
                      } border focus:outline-none`}
                      placeholder="+62 812-3456-7890"
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t ${borderColor}">
                  <button 
                    type="button" 
                    onClick={() => navigate('/settings')}
                    className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isDarkMode 
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-[#00685f] hover:bg-[#005049] text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Menyimpan...
                      </div>
                    ) : (
                      'Simpan Perubahan'
                    )}
                  </button>
                </div>
              </form>
            </div>
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

export default ProfilePage;