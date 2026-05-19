import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import api from '../services/api';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [typedEmail, setTypedEmail] = useState('');
  const [typedPassword, setTypedPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState(false);

  useEffect(() => {
    if (location.state && location.state.fromRegister && location.state.email) {
      setTypedEmail(location.state.email);
      setShowSuccessPopup(true);
      const timer = setTimeout(() => setShowSuccessPopup(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleManualLogin = async (e) => {
    e.preventDefault();
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
        navigate('/setup-financial');
      }
    } catch (error) {
      setLoginError(true);
      setTimeout(() => setLoginError(false), 3000);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const { credential } = credentialResponse;
      const response = await api.post('/auth/google', { idToken: credential });

      if (response.data.success) {
        const { user, token } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user_name', user.name);
        localStorage.setItem('user_email', user.email);
        navigate('/setup-financial');
      }
    } catch (error) {
      console.error('Google login error:', error);
      setLoginError(true);
      setTimeout(() => setLoginError(false), 3000);
    }
  };

  const handleGoogleFailure = (error) => {
    console.error('Google login failed:', error);
    setLoginError(true);
    setTimeout(() => setLoginError(false), 3000);
  };

  return (
    <div className="bg-[#f9f9ff] text-[#151c27] min-h-screen flex flex-col md:flex-row antialiased font-sans relative">
      {/* Pop-up sukses registrasi */}
      {showSuccessPopup && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 max-w-sm w-full px-4 animate-fadeInDown">
          <div className="bg-white p-5 rounded-2xl shadow-[0px_10px_30px_rgba(0,0,0,0.15)] border-l-4 border-emerald-500 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-emerald-500 text-3xl">check_circle</span>
              <div>
                <h4 className="font-bold text-[#151c27] text-sm">Akun Telah Dibuat!</h4>
                <p className="text-xs text-slate-500">Silakan masuk dengan email kamu.</p>
              </div>
            </div>
            <button onClick={() => setShowSuccessPopup(false)} className="text-slate-400 hover:text-slate-600">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        </div>
      )}

      {/* Notifikasi gagal login */}
      {loginError && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 max-w-sm w-full px-4 animate-fadeInDown">
          <div className="bg-white p-5 rounded-2xl shadow-[0px_10px_30px_rgba(0,0,0,0.15)] border-l-4 border-red-500 flex items-center gap-3">
            <span className="material-symbols-outlined text-red-500 text-3xl">error</span>
            <div>
              <h4 className="font-bold text-[#151c27] text-sm">Masuk Gagal</h4>
              <p className="text-xs text-slate-500">Email atau kata sandi Anda salah/kurang lengkap.</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading overlay */}
      {isLoggingIn && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center backdrop-blur-xs">
          <div className="bg-white p-6 rounded-2xl flex flex-col items-center gap-3 shadow-xl">
            <div className="w-9 h-9 border-4 border-slate-200 border-t-[#00685f] rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-[#151c27]">Memproses Otentikasi...</p>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Manrope:wght@600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          display: inline-block;
          line-height: 1;
          vertical-align: middle;
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-fadeInDown {
          animation: fadeInDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Left panel (branding) */}
      <div className="hidden md:flex md:w-1/2 bg-[#00685f] relative overflow-hidden items-center justify-center p-10">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#6bd8cb] blur-3xl"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#d8e5e2] blur-3xl"></div>
        </div>
        <div className="relative z-10 text-center max-w-md flex flex-col items-center">
          <span className="material-symbols-outlined text-[64px] text-[#89f5e7]" style={{ fontVariationSettings: "'FILL' 1" }}>
            account_balance_wallet
          </span>
          <h1 className="text-[40px] font-bold text-[#f4fffc] mb-4 tracking-tight" style={{ fontFamily: 'Manrope, sans-serif', lineHeight: '48px' }}>
            WealthFlow
          </h1>
          <p className="text-[18px] text-[#6bd8cb] opacity-90 leading-relaxed px-4" style={{ fontFamily: 'Inter, sans-serif' }}>
            Sederhanakan manajemen keuangan Anda dengan kejernihan dan kepercayaan yang belum pernah ada sebelumnya.
          </p>
        </div>
      </div>

      {/* Right panel (form) */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-8 py-10 bg-[#f9f9ff]">
        <div className="w-full max-w-[400px]">
          <div className="mb-10">
            <h2 className="text-[32px] font-semibold text-[#151c27] mb-1 tracking-tight" style={{ fontFamily: 'Manrope, sans-serif', lineHeight: '40px' }}>
              Selamat Datang Kembali
            </h2>
            <p className="text-[16px] text-[#3d4947]" style={{ fontFamily: 'Inter, sans-serif' }}>
              Silakan masuk untuk mengelola portofolio Anda.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleManualLogin}>
            <div className="space-y-2">
              <label className="block text-[12px] font-medium text-[#3d4947] px-1" htmlFor="email">
                Email atau Nama Pengguna
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-[#6d7a77] text-[20px]">mail</span>
                </span>
                <input
                  id="email"
                  type="text"
                  required
                  value={typedEmail}
                  onChange={(e) => setTypedEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full pl-12 pr-4 py-3 bg-white border border-[#bcc9c6] rounded-xl focus:ring-2 focus:ring-[#d8e5e2] focus:border-[#00685f] outline-none transition-all text-[16px]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[12px] font-medium text-[#3d4947]" htmlFor="password">
                  Kata Sandi
                </label>
                <a className="text-[12px] font-semibold text-[#00685f] hover:underline" href="#">
                  Lupa Kata Sandi?
                </a>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-[#6d7a77] text-[20px]">lock</span>
                </span>
                <input
                  id="password"
                  type="password"
                  required
                  value={typedPassword}
                  onChange={(e) => setTypedPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3 bg-white border border-[#bcc9c6] rounded-xl focus:ring-2 focus:ring-[#d8e5e2] focus:border-[#00685f] outline-none transition-all text-[16px]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#00685f] hover:bg-[#008378] text-white font-semibold py-4 rounded-xl shadow-[0px_4px_20px_rgba(13,148,136,0.2)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer border-none"
            >
              <span>Masuk</span>
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#bcc9c6]/50"></div>
            </div>
            <div className="relative flex justify-center text-[12px] uppercase">
              <span className="bg-[#f9f9ff] px-4 text-[#3d4947]">Atau masuk dengan</span>
            </div>
          </div>

          {/* Google Login Button - Menggunakan komponen dari library */}
          <div className="flex justify-center w-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleFailure}
              useOneTap={false}
              theme="outline"
              size="large"
              shape="rectangular"
              text="signin_with"
              width="100%"
            />
          </div>

          <p className="mt-10 text-center text-[14px] text-[#3d4947]">
            Belum punya akun?{' '}
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="text-[#00685f] font-semibold hover:underline cursor-pointer bg-transparent border-none p-0"
            >
              Daftar Sekarang
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;