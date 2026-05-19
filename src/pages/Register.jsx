import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function Register() {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Validasi frontend
    if (!name || !email || !password) {
      setErrorMsg('Silakan isi semua data terlebih dahulu.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Konfirmasi password tidak cocok!');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password minimal 6 karakter.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
      });

      if (response.data.success) {
        // Simpan token dan data user (opsional: langsung login)
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user_name', response.data.user.name);
        localStorage.setItem('user_email', response.data.user.email);

        // Arahkan ke halaman setup pendapatan (atau ke login dengan pesan sukses)
        navigate('/setup-financial');
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Registrasi gagal. Coba lagi.';
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#f9f9ff] text-[#151c27] min-h-screen flex flex-col items-center font-sans antialiased">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@600;700&family=Inter:wght@400;500;600&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          display: inline-block;
          vertical-align: middle;
        }
      `}</style>

      <header className="w-full max-w-[1200px] flex justify-between items-center px-4 md:px-8 py-4">
        <button 
          onClick={() => navigate('/login')}
          className="flex items-center justify-center p-2 rounded-xl bg-[#f0f3ff] text-[#00685f] hover:bg-[#d8e5e2] transition-colors active:scale-95 duration-200 cursor-pointer"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="text-2xl font-bold text-[#00685f]" style={{ fontFamily: 'Manrope, sans-serif' }}>
          WealthFlow
        </div>
        <div className="w-10"></div>
      </header>

      <main className="flex-grow w-full max-w-[1200px] px-4 md:px-8 py-10 flex flex-col md:flex-row items-center justify-center gap-10">
        
        {/* Branding Side */}
        <div className="hidden md:flex flex-col w-1/2 space-y-6">
          <h1 className="text-[40px] font-bold text-[#00685f] max-w-md leading-[48px] tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Wujudkan Masa Depan Finansial yang Lebih Cerah.
          </h1>
          <p className="text-xl text-[#55615f] max-w-md leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
            Kelola pengeluaran, tabungan, dan investasi Anda dalam satu platform yang tenang dan terpercaya.
          </p>
          <div className="rounded-xl overflow-hidden shadow-[0px_4px_20px_rgba(13,148,136,0.08)] bg-white">
            <img 
              className="w-full h-[300px] object-cover" 
              alt="Workspace representation" 
              src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80" 
            />
          </div>
        </div>

        {/* Registration Form Card */}
        <div className="w-full md:w-[480px] bg-white p-6 md:p-10 rounded-xl shadow-[0px_4px_20px_rgba(13,148,136,0.04)]">
          <div className="mb-10">
            <h2 className="text-3xl font-semibold text-[#151c27] mb-1 tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Buat Akun Baru
            </h2>
            <p className="text-base text-[#55615f]" style={{ fontFamily: 'Inter, sans-serif' }}>
              Mulai kelola keuanganmu lebih baik hari ini.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {errorMsg}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleRegisterSubmit}>
            {/* Nama Lengkap */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-[#3d4947] px-1" htmlFor="name">
                Nama Lengkap
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#6d7a77]">person</span>
                <input 
                  id="name"
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe" 
                  className="w-full pl-12 pr-4 py-3 bg-[#f0f3ff] border border-[#bcc9c6]/30 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-[#00685f]/20 focus:border-[#00685f] transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-[#3d4947] px-1" htmlFor="email">
                Email
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#6d7a77]">mail</span>
                <input 
                  id="email"
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com" 
                  className="w-full pl-12 pr-4 py-3 bg-[#f0f3ff] border border-[#bcc9c6]/30 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-[#00685f]/20 focus:border-[#00685f] transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-[#3d4947] px-1" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#6d7a77]">lock</span>
                <input 
                  id="password"
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full pl-12 pr-12 py-3 bg-[#f0f3ff] border border-[#bcc9c6]/30 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-[#00685f]/20 focus:border-[#00685f] transition-all"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6d7a77] hover:text-[#00685f] transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Konfirmasi Password */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-[#3d4947] px-1" htmlFor="confirm-password">
                Konfirmasi Password
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#6d7a77]">lock_clock</span>
                <input 
                  id="confirm-password"
                  type={showPassword ? "text" : "password"} 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full pl-12 pr-4 py-3 bg-[#f0f3ff] border border-[#bcc9c6]/30 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-[#00685f]/20 focus:border-[#00685f] transition-all"
                />
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2 py-2">
              <input 
                id="terms"
                type="checkbox" 
                required
                className="mt-1 w-5 h-5 rounded border-[#bcc9c6] text-[#00685f] focus:ring-[#00685f] cursor-pointer accent-[#00685f]" 
              />
              <label htmlFor="terms" className="text-sm text-[#3d4947] cursor-pointer leading-tight">
                Saya menyetujui <span className="text-[#00685f] font-semibold hover:underline">Syarat dan Ketentuan</span> serta <span className="text-[#00685f] font-semibold hover:underline">Kebijakan Privasi</span> WealthFlow.
              </label>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-[#00685f] text-white font-semibold text-lg rounded-xl shadow-[0px_4px_12px_rgba(0,104,95,0.2)] hover:bg-[#005049] transition-all active:scale-[0.98] duration-200 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? 'Memproses...' : 'Daftar'}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-base text-[#55615f]">
              Sudah punya akun? 
              <button 
                onClick={() => navigate('/login')}
                className="text-[#00685f] font-bold hover:underline ml-1 cursor-pointer bg-transparent border-none"
              >
                Masuk
              </button>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Register;