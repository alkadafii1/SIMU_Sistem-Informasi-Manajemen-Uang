import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import api from '../services/api';

// COMPONENTS
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
      <p className="text-sm font-semibold text-slate-600">Memverifikasi akun...</p>
    </div>
  </div>
);

// MAIN COMPONENT
function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [typedEmail, setTypedEmail] = useState('');
  const [typedPassword, setTypedPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('Email atau kata sandi salah');

  useEffect(() => {
    if (location.state?.fromRegister && location.state?.email) {
      setTypedEmail(location.state.email);
      setShowSuccessPopup(true);
      const timer = setTimeout(() => setShowSuccessPopup(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  const isValidEmail = useCallback((email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }, []);

  const showError = useCallback((message) => {
    setErrorMessage(message);
    setLoginError(true);
    setTimeout(() => setLoginError(false), 3500);
  }, []);

  // Cek apakah user sudah pernah setup
  const checkUserSetup = async (token) => {
    try {
      const response = await api.get('/user/setup', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Jika response 200 (setup ditemukan)
      return response.data.success && response.data.setup;
    } catch (error) {
      // Jika 404 (setup not found)
      if (error.response?.status === 404) {
        return false;
      }
      throw error;
    }
  };

  const handleManualLogin = useCallback(async (e) => {
    e.preventDefault();
    
    if (!isValidEmail(typedEmail)) {
      showError('Format email tidak valid');
      return;
    }
    
    if (typedPassword.length < 6) {
      showError('Password minimal 6 karakter');
      return;
    }

    setLoginError(false);
    setIsLoggingIn(true);
    
    try {
      const response = await api.post('/auth/login', {
        email: typedEmail,
        password: typedPassword,
      });
      
      if (response.data.success) {
        const { user, token } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user_name', user.name);
        localStorage.setItem('user_email', user.email);
        localStorage.setItem('user_id', user.id);
        
        // Cek apakah user pernah setup
        const hasSetup = await checkUserSetup(token);
        
        if (hasSetup) {
          // Jika sudah, redirect dashboard
          navigate('/dashboard');
        } else {
          // Jika belum, redirect setup finansial
          navigate('/setup-financial');
        }
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Email atau password salah';
      showError(message);
    } finally {
      setIsLoggingIn(false);
    }
  }, [typedEmail, typedPassword, isValidEmail, showError, navigate]);

  const handleGoogleSuccess = useCallback(async (credentialResponse) => {
    setIsLoggingIn(true);
    
    try {
      const response = await api.post('/auth/google', { 
        idToken: credentialResponse.credential 
      });
      
      if (response.data.success) {
        const { user, token } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user_name', user.name);
        localStorage.setItem('user_email', user.email);
        localStorage.setItem('user_id', user.id);
        
        // Cek apakah sudah pernah setup
        const hasSetup = await checkUserSetup(token);
        
        if (hasSetup) {
          // Jika sudah, redirect dashboard
          navigate('/dashboard');
        } else {
          // Jika belum, redirect setup finansial
          navigate('/setup-financial');
        }
      }
    } catch (error) {
      console.error('Google login error:', error);
      showError('Login dengan Google gagal, silakan coba lagi');
    } finally {
      setIsLoggingIn(false);
    }
  }, [navigate, showError]);

  const handleGoogleFailure = useCallback(() => {
    showError('Login dengan Google dibatalkan atau gagal');
  }, [showError]);

  const isFormValid = typedEmail.trim().length > 0 && typedPassword.length >= 6;

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans bg-gradient-to-br from-white via-teal-50/30 to-emerald-50/20">
      
      {/* Toast Notifications */}
      {showSuccessPopup && (
        <Toast
          type="success"
          title="Akun berhasil dibuat!"
          message="Silakan masuk dengan email kamu."
          onClose={() => setShowSuccessPopup(false)}
        />
      )}
      
      {loginError && (
        <Toast
          type="error"
          title="Masuk gagal"
          message={errorMessage}
        />
      )}

      {/* Loading Overlay */}
      {isLoggingIn && <LoadingOverlay />}

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
            Kelola keuangan<br />
            <span className="bg-gradient-to-r from-teal-300 via-emerald-300 to-teal-200 bg-clip-text text-transparent">lebih cerdas</span><br />
            bersama SIMU
          </h1>
          
          <p className="text-teal-100/80 text-sm leading-relaxed max-w-sm mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
            Catat, rencanakan, dan analisis keuanganmu dengan metode alokasi yang terbukti efektif.
          </p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
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
              Hai, Selamat datang
            </h2>
            <p className="text-sm text-slate-500" style={{ fontFamily: 'Inter, sans-serif' }}>
              Masuk untuk melanjutkan mengelola keuanganmu
            </p>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleManualLogin}>
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
                  value={typedEmail}
                  onChange={(e) => setTypedEmail(e.target.value)}
                  placeholder="Masukkan Email"
                  className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-slate-100 rounded-xl text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100 transition-all
                    [&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_white]"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center pl-1">
                <label className="text-xs font-bold text-slate-600" htmlFor="password">
                  Kata sandi
                </label>
                <button
                  type="button"
                  onClick={() => alert('Fitur lupa password akan segera hadir')}
                  className="text-xs font-semibold text-teal-600 hover:text-teal-700 bg-transparent border-none p-0 cursor-pointer transition-colors"
                >
                  Lupa kata sandi?
                </button>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-slate-400 text-lg group-focus-within:text-teal-500 transition-colors">lock</span>
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={typedPassword}
                  onChange={(e) => setTypedPassword(e.target.value)}
                  placeholder="Masukkan Password"
                  className="w-full pl-12 pr-12 py-3.5 bg-white border-2 border-slate-100 rounded-xl text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100 transition-all
                    [&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_white]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-teal-500 bg-transparent border-none cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isFormValid || isLoggingIn}
              className="w-full bg-[#1E4D4A] hover:bg-[#143533] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm mt-4"
            >
              <span>Masuk ke Akun</span>
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-gradient-to-br from-white via-teal-50/30 to-emerald-50/20 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Atau masuk dengan
              </span>
            </div>
          </div>

          {/* Google Login Button */}
          <div className="flex justify-center w-full transform transition-all hover:scale-[1.02]">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleFailure}
              useOneTap={false}
              theme="outline"
              size="large"
              shape="pill"
              text="signin_with"
              width="100%"
            />
          </div>

          {/* Register Link */}
          <p className="mt-8 text-center text-sm text-slate-500">
            Belum punya akun?{' '}
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="text-teal-600 font-bold hover:text-teal-700 hover:underline bg-transparent border-none p-0 cursor-pointer transition-colors"
            >
              Daftar sekarang
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

export default Login;