import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State manajemen data dan notifikasi pop-up
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [typedEmail, setTypedEmail] = useState('');
  const [typedPassword, setTypedPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState(false);

  useEffect(() => {
    // Memeriksa jika perpindahan berasal dari Register dengan membawa status sukses
    if (location.state && location.state.fromRegister && location.state.email) {
      setTypedEmail(location.state.email); // Auto-fill kolom input email
      setShowSuccessPopup(true);
      
      // Sembunyikan pop-up sukses otomatis setelah 5 detik
      const timer = setTimeout(() => {
        setShowSuccessPopup(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // 🔑 Handle untuk Tombol MASUK Manual
  const handleManualLogin = (e) => {
    e.preventDefault();
    setLoginError(false);
    
    // Validasi input sederhana
    if (typedEmail && typedPassword.length >= 6) {
      setIsLoggingIn(true);
      
      // Simulasi loading autentikasi selama 1.5 detik
      setTimeout(() => {
        setIsLoggingIn(false);

        // 🔗 1. EKSTRAKSI NAMA DARI EMAIL (Contoh: celvin@email.com -> Celvin)
        // Jika input berupa email, kita ambil bagian depan lalu kapitalisasi huruf pertamanya
        let username = typedEmail.split('@')[0];
        username = username.charAt(0).toUpperCase() + username.slice(1);

        // 💾 2. SIMPAN DATA KE LOCALSTORAGE AGAR DIBACA DASHBOARD
        localStorage.setItem('user_name', username);
        localStorage.setItem('user_email', typedEmail.includes('@') ? typedEmail : `${typedEmail}@email.com`);
        
        // 🔗 DIHUBUNGKAN LANGSUNG KE HALAMAN SETUP PENDAPATAN & TUJUAN
        navigate('/setup-financial'); 
      }, 1500);
    } else {
      setLoginError(true);
      setTimeout(() => setLoginError(false), 3000);
    }
  };

  // 🔑 Handle untuk Tombol LOGIN WITH GOOGLE
  const handleGoogleLogin = () => {
    console.log("Menghubungkan ke Google Auth API...");
    setIsLoggingIn(true);
    
    // Simulasi loading penanganan login Google selama 1.5 detik
    setTimeout(() => {
      setIsLoggingIn(false);
      
      // 💾 SIMPAN DATA DUMMY GOOGLE KE LOCALSTORAGE
      // Jika nanti sudah pakai Real API, isi ini dengan response dari Google Auth
      localStorage.setItem('user_name', 'Celvin Alfiansyah');
      localStorage.setItem('user_email', 'celvin.alfiansyah@gmail.com');

      // 🔗 DIHUBUNGKAN LANGSUNG KE HALAMAN SETUP PENDAPATAN & TUJUAN
      navigate('/setup-financial');
    }, 1500);
  };

  return (
    <div className="bg-[#f9f9ff] text-[#151c27] min-h-screen flex flex-col md:flex-row antialiased font-sans relative">
      
      {/* 🟢 Pop-up Notifikasi Sukses Registrasi Akun */}
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
            <button onClick={() => setShowSuccessPopup(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        </div>
      )}
      
      {/* 🔴 Notifikasi Gagal Log In */}
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
      
      {/* ⏳ Overlay Indikator Memuat Verifikasi */}
      {isLoggingIn && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center backdrop-blur-xs">
          <div className="bg-white p-6 rounded-2xl flex flex-col items-center gap-3 shadow-xl">
            <div className="w-9 h-9 border-4 border-slate-200 border-t-[#00685f] rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-[#151c27]">Memproses Otentikasi...</p>
          </div>
        </div>
      )}

      {/* Font & Gaya Animasi Transisi */}
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

      {/* Sisi Kiri: Panel Branding */}
      <div className="hidden md:flex md:w-1/2 bg-[#00685f] relative overflow-hidden items-center justify-center p-10">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#6bd8cb] blur-3xl"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#d8e5e2] blur-3xl"></div>
        </div>
        <div className="relative z-10 text-center max-w-md flex flex-col items-center">
          <div className="flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-[64px] text-[#89f5e7]" style={{ fontVariationSettings: "'FILL' 1" }}>
              account_balance_wallet
            </span>
          </div>
          <h1 className="text-[40px] font-bold text-[#f4fffc] mb-4 tracking-tight" style={{ fontFamily: 'Manrope, sans-serif', lineHeight: '48px' }}>
            WealthFlow
          </h1>
          <p className="text-[18px] text-[#6bd8cb] opacity-90 leading-relaxed px-4" style={{ fontFamily: 'Inter, sans-serif' }}>
            Sederhanakan manajemen keuangan Anda dengan kejernihan dan kepercayaan yang belum pernah ada sebelumnya.
          </p>
        </div>
      </div>

      {/* Sisi Kanan: Area Formulir Login */}
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
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-[#6d7a77] text-[20px]">mail</span>
                </div>
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
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-[#6d7a77] text-[20px]">lock</span>
                </div>
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

            {/* Tombol Masuk Utama */}
            <button 
              type="submit" 
              className="w-full bg-[#00685f] hover:bg-[#008378] text-white font-semibold py-4 rounded-xl shadow-[0px_4px_20px_rgba(13,148,136,0.2)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer border-none"
            >
              <span>Masuk</span>
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
          </form>

          {/* Garis Pembatas */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#bcc9c6]/50"></div>
            </div>
            <div className="relative flex justify-center text-[12px] uppercase">
              <span className="bg-[#f9f9ff] px-4 text-[#3d4947]">Atau masuk dengan</span>
            </div>
          </div>

          {/* Tombol Google Login Terhubung */}
          <div className="flex justify-center w-full">
            <button 
              type="button"
              onClick={handleGoogleLogin} 
              className="flex items-center justify-center gap-3 py-3.5 px-6 border border-[#bcc9c6] rounded-xl bg-white hover:bg-[#f4fffc] hover:border-[#00685f] transition-all active:scale-95 duration-200 cursor-pointer shadow-xs w-full"
            >
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              <span className="text-[14px] font-semibold text-[#151c27]" style={{ fontFamily: 'Inter, sans-serif' }}>
                Masuk dengan Google
              </span>
            </button>
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