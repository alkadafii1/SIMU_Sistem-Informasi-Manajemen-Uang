import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

// Components
const Toast = ({ type, title, message, onClose }) => {
  const isSuccess = type === 'success';
  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 animate-slideDown">
      <div className={`bg-white rounded-2xl shadow-2xl border-l-4 ${isSuccess ? 'border-emerald-500' : 'border-rose-500'} p-4 flex items-center gap-3`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isSuccess ? 'bg-emerald-100' : 'bg-rose-100'}`}>
          <span className={`material-symbols-outlined text-lg ${isSuccess ? 'text-emerald-600' : 'text-rose-600'}`}>
            {isSuccess ? 'check_circle' : 'error'}
          </span>
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-slate-800">{title}</p>
          <p className="text-xs text-slate-500 mt-0.5">{message}</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        )}
      </div>
    </div>
  );
};

const LoadingOverlay = () => (
  <div className="fixed inset-0 bg-slate-900/60 z-[60] flex items-center justify-center backdrop-blur-sm">
    <div className="bg-white rounded-2xl px-8 py-6 flex flex-col items-center gap-4 shadow-2xl">
      <div className="w-12 h-12 border-4 border-slate-100 border-t-teal-600 rounded-full animate-spin"></div>
      <p className="text-sm font-semibold text-slate-600">Membuat akun...</p>
    </div>
  </div>
);

// Main Components
function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successToast, setSuccessToast] = useState({ show: false, message: '' });
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Validasi email
  const isValidEmail = useCallback((email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }, []);

  const showError = useCallback((message) => {
    setErrorMsg(message);
    setTimeout(() => setErrorMsg(''), 3500);
  }, []);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Validasi nama
    if (!name.trim()) {
      showError('Nama lengkap harus diisi');
      return;
    }
    if (name.length < 3) {
      showError('Nama minimal 3 karakter');
      return;
    }

    // Validasi email
    if (!email.trim()) {
      showError('Email harus diisi');
      return;
    }
    if (!isValidEmail(email)) {
      showError('Format email tidak valid');
      return;
    }

    // Validasi password
    if (!password) {
      showError('Password harus diisi');
      return;
    }
    if (password.length < 6) {
      showError('Password minimal 6 karakter');
      return;
    }
    if (password.length > 50) {
      showError('Password maksimal 50 karakter');
      return;
    }

    // Validasi konfirmasi password
    if (password !== confirmPassword) {
      showError('Konfirmasi password tidak cocok');
      return;
    }

    // Validasi terms
    if (!termsAccepted) {
      showError('Anda harus menyetujui Syarat dan Ketentuan');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/auth/register', {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      if (response.data.success) {
        // Tampilkan Toast Sukses
        setSuccessToast({ 
          show: true, 
          message: 'Akun berhasil dibuat! Mengalihkan ke halaman login...' 
        });
        
        // ARAHKAN KE LOGIN (BUKAN SETUP FINANCIAL)
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              fromRegister: true, 
              email: email.trim().toLowerCase(),
              name: name.trim()
            } 
          });
        }, 1500);
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Registrasi gagal. Silakan coba lagi.';
      showError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans bg-gradient-to-br from-white via-teal-50/30 to-emerald-50/20">
      
      {/* Toast Error */}
      {errorMsg && (
        <Toast
          type="error"
          title="Registrasi gagal"
          message={errorMsg}
          onClose={() => setErrorMsg('')}
        />
      )}

      {/* Toast Success */}
      {successToast.show && (
        <Toast
          type="success"
          title="Akun berhasil dibuat!"
          message={successToast.message}
          onClose={() => setSuccessToast({ show: false, message: '' })}
        />
      )}

      {/* Loading Overlay */}
      {isLoading && <LoadingOverlay />}

      {/* Left Panel - Branding */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-teal-700 via-teal-800 to-emerald-900 relative overflow-hidden flex-col items-center justify-center p-10 lg:p-12">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-emerald-400/10 blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-teal-400/10 blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-white/5 blur-3xl"></div>
        </div>
        
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 text-center max-w-md">
          <div className="flex justify-center mb-6">
            <div className="bg-white/90 backdrop-blur-sm rounded-full shadow-xl border border-white/20 inline-flex p-1">
              <img src="/favicon.webp" alt="Logo" className="w-12 h-12 object-contain rounded-full" />
            </div>
          </div>

          <h1 className="text-4xl lg:text-5xl font-black text-white mb-5 leading-tight tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Mulai perjalanan<br />
            <span className="bg-gradient-to-r from-teal-300 via-emerald-300 to-teal-200 bg-clip-text text-transparent">finansialmu</span><br />
            bersama SIMU
          </h1>
          
          <p className="text-teal-100/80 text-sm leading-relaxed max-w-sm mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
            Daftar sekarang dan nikmati kemudahan mengelola keuangan dengan metode alokasi yang terbukti efektif.
          </p>
        </div>
      </div>

      {/* Right Panel - Register Form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-8 py-10">

        {/* Mobile logo */}
        <div className="flex md:hidden items-center gap-3 mb-8 self-start">
          <div className="bg-white/90 backdrop-blur-sm rounded-full shadow-xl border border-white/20 inline-flex p-1">
            <img src="/favicon.webp" alt="Logo" className="w-12 h-12 object-contain rounded-full" />
          </div>
          <span className="text-teal-700 font-black text-xl tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>
            SIMU
          </span>
        </div>

        <div className="w-full max-w-[420px]">

          {/* Heading */}
          <div className="mb-8 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-2 tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Buat Akun Baru
            </h2>
            <p className="text-sm text-slate-500" style={{ fontFamily: 'Inter, sans-serif' }}>
              Mulai kelola keuanganmu lebih baik hari ini
            </p>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleRegisterSubmit}>
            
            {/* Nama Lengkap Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-600 pl-1" htmlFor="name">
                Nama Lengkap
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-slate-400 text-lg group-focus-within:text-teal-500 transition-colors">person</span>
                </div>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masukkan nama lengkap"
                  className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-slate-100 rounded-xl text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100 transition-all"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-600 pl-1" htmlFor="email">
                Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-slate-400 text-lg group-focus-within:text-teal-500 transition-colors">mail</span>
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan email"
                  className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-slate-100 rounded-xl text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-600 pl-1" htmlFor="password">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-slate-400 text-lg group-focus-within:text-teal-500 transition-colors">lock</span>
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password (min. 6 karakter)"
                  className="w-full pl-12 pr-12 py-3.5 bg-white border-2 border-slate-100 rounded-xl text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-teal-500 bg-transparent border-none cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Konfirmasi Password Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-600 pl-1" htmlFor="confirmPassword">
                Konfirmasi Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-slate-400 text-lg group-focus-within:text-teal-500 transition-colors">lock_clock</span>
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Konfirmasi password"
                  className="w-full pl-12 pr-12 py-3.5 bg-white border-2 border-slate-100 rounded-xl text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-teal-500 bg-transparent border-none cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">
                    {showConfirmPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="flex items-start gap-3 py-2">
              <input
                id="terms"
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
              />
              <label htmlFor="terms" className="text-xs text-slate-500 cursor-pointer leading-relaxed">
                Saya menyetujui <span className="text-teal-600 font-semibold hover:underline">Syarat dan Ketentuan</span> serta{' '}
                <span className="text-teal-600 font-semibold hover:underline">Kebijakan Privasi</span> SIMU.
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !name || !email || !password || !confirmPassword || !termsAccepted}
              className="w-full bg-[#1E4D4A] hover:bg-[#143533] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm mt-4"
            >
              {isLoading ? 'Memproses...' : 'Daftar Sekarang'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-gradient-to-br from-white via-teal-50/30 to-emerald-50/20 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Atau
              </span>
            </div>
          </div>

          {/* Login Link */}
          <p className="text-center text-sm text-slate-500">
            Sudah punya akun?{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-teal-600 font-bold hover:text-teal-700 hover:underline bg-transparent border-none p-0 cursor-pointer transition-colors"
            >
              Masuk sekarang
            </button>
          </p>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap');
        
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24;
          display: inline-block;
          line-height: 1;
          vertical-align: middle;
        }
        
        @keyframes slideDown {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-slideDown {
          animation: slideDown 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}

export default Register;