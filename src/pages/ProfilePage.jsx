import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function ProfilePage({ monthlyIncome }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [name, setName] = useState('Celvin Alfiansyah');
  const [email, setEmail] = useState('celvin@email.com');
  const [phone, setPhone] = useState('+62 812-3456-7890');
  const [birthday, setBirthday] = useState('2003-05-17');
  const [profilePreview, setProfilePreview] = useState(null);

  useEffect(() => {
    const storedName = localStorage.getItem('user_name');
    const storedEmail = localStorage.getItem('user_email');
    const storedAvatar = localStorage.getItem('user_avatar'); // Ambil foto dari localstorage
    
    if (storedName) setName(storedName);
    if (storedEmail) setEmail(storedEmail);
    if (storedAvatar) setProfilePreview(storedAvatar);
  }, []);

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Menangani upload foto dan mengubahnya ke Base64 agar tersimpan permanen
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setProfilePreview(base64String);
        localStorage.setItem('user_avatar', base64String); // Simpan foto langsung ke storage browser
        alert('Foto profil berhasil diunggah secara permanen!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setProfilePreview(null);
    localStorage.removeItem('user_avatar'); // Hapus foto dari storage browser
    alert('Foto profil dihapus.');
  };

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('user_name', name);
    localStorage.setItem('user_email', email);
    alert('Profil Anda berhasil diperbarui!');
    navigate('/settings');
  };

  const userInitial = name ? name.charAt(0).toUpperCase() : 'U';

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(angka);
  };

  return (
    <div className="bg-[#f9f9ff] text-[#151c27] h-screen flex overflow-hidden font-sans antialiased">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; display: inline-block; line-height: 1; vertical-align: middle; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      {/* SIDEBAR (Desktop) */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col justify-between p-6 h-full flex-shrink-0 hidden md:flex">
        <div className="space-y-8">
          <div onClick={() => navigate('/dashboard')} className="cursor-pointer flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-xl bg-[#00685f] flex items-center justify-center text-white shadow-xs">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
            </div>
            <span className="text-xl font-extrabold text-[#00685f] tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>WealthFlow</span>
          </div>

          <nav className="space-y-1.5">
            <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-slate-500 hover:text-[#00685f] hover:bg-slate-50 font-medium text-sm border-none cursor-pointer text-left transition-all">
              <span className="material-symbols-outlined">dashboard</span>
              <span>Dashboard</span>
            </button>
            <button onClick={() => navigate('/statistics')} className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-slate-500 hover:text-[#00685f] hover:bg-slate-50 font-medium text-sm border-none cursor-pointer text-left transition-all">
              <span className="material-symbols-outlined">analytics</span>
              <span>Statistik Analisis</span>
            </button>
            <button onClick={() => navigate('/history')} className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-slate-500 hover:text-[#00685f] hover:bg-slate-50 font-medium text-sm border-none cursor-pointer text-left transition-all">
              <span className="material-symbols-outlined">receipt_long</span>
              <span>Riwayat Aktivitas</span>
            </button>
            <button onClick={() => navigate('/transaction')} className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-slate-500 hover:text-[#00685f] hover:bg-slate-50 font-medium text-sm border-none cursor-pointer text-left transition-all">
              <span className="material-symbols-outlined">payments</span>
              <span>Target Tabungan</span>
            </button>
            <button onClick={() => navigate('/settings')} className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl bg-[#00685f]/10 text-[#00685f] font-semibold text-sm border-none cursor-pointer text-left">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>settings</span>
              <span>Pengaturan</span>
            </button>
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-[#00685f]/20 bg-[#d8e5e2] flex items-center justify-center font-bold text-[#00685f] flex-shrink-0">
            {profilePreview ? <img src={profilePreview} className="w-full h-full object-cover" alt="avatar" /> : userInitial}
          </div>
          <div className="flex flex-col text-left overflow-hidden">
            <span className="text-xs font-bold text-slate-800 truncate">{name}</span>
            <span className="text-[10px] text-slate-400 font-medium truncate">{email}</span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-full overflow-hidden pb-20 md:pb-0">
        <header className="bg-white/80 backdrop-blur-md px-8 py-4 flex items-center gap-3 border-b border-slate-100 z-20 flex-shrink-0">
          <button onClick={() => navigate('/settings')} className="flex items-center justify-center p-1 rounded-lg hover:bg-slate-100 border-none bg-transparent cursor-pointer">
            <span className="material-symbols-outlined text-slate-700">arrow_back</span>
          </button>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>Edit Profil</h2>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 no-scrollbar flex flex-col items-center">
          <div className="max-w-2xl w-full space-y-6 text-left">
            
            {/* LINK SETUP FINANCIAL */}
            <div className="bg-gradient-to-r from-[#00685f]/10 to-[#00685f]/5 p-5 rounded-3xl border border-[#00685f]/20 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Anggaran Bulanan Aktif</span>
                <span className="text-lg font-black text-[#00685f]" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  {formatRupiah(monthlyIncome)}
                </span>
              </div>
              <button 
                type="button"
                onClick={() => navigate('/setup-financial')}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#00685f] hover:bg-[#00534c] text-white font-bold text-xs rounded-xl border-none cursor-pointer shadow-sm transition-all"
              >
                <span className="material-symbols-outlined text-sm">tune</span>
                <span>Edit Alokasi Keuangan</span>
              </button>
            </div>

            {/* AVATAR & FOTO PROFIL */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0px_10px_30px_rgba(0,0,0,0.01)] flex flex-col sm:flex-row items-center gap-6">
              <div className="w-24 h-24 rounded-full border-4 border-[#00685f]/20 bg-[#d8e5e2] overflow-hidden flex items-center justify-center font-black text-3xl text-[#00685f] shadow-inner flex-shrink-0">
                {profilePreview ? (
                  <img src={profilePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  userInitial
                )}
              </div>
              <div className="space-y-2 text-center sm:text-left">
                <h3 className="text-sm font-bold text-slate-800" style={{ fontFamily: 'Manrope, sans-serif' }}>Foto Profil Akun</h3>
                <p className="text-xs text-slate-400 font-medium">Ubah foto profil untuk mempersonalisasi platform monitoring keuangan Anda.</p>
                <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                  <button 
                    type="button" 
                    onClick={triggerFileInput}
                    className="px-4 py-2 bg-[#00685f] hover:bg-[#00534c] text-white font-bold text-xs rounded-xl border-none cursor-pointer transition-all"
                  >
                    Upload Baru
                  </button>
                  {profilePreview && (
                    <button 
                      type="button" 
                      onClick={handleRemovePhoto}
                      className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl border-none cursor-pointer transition-all"
                    >
                      Hapus
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* FORM DATA */}
            <form onSubmit={handleSave} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0px_10px_30px_rgba(0,0,0,0.01)] space-y-5">
              <h4 className="text-xs font-bold text-slate-800 tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>Informasi Pribadi</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nama Lengkap</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#00685f] focus:bg-white transition-all"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tanggal Lahir</label>
                  <input 
                    type="date" 
                    value={birthday}
                    onChange={(e) => setBirthday(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#00685f] focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Alamat Email</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#00685f] focus:bg-white transition-all"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nomor Telepon</label>
                  <input 
                    type="text" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#00685f] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
                <button 
                  type="button" 
                  onClick={() => navigate('/settings')}
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs border-none cursor-pointer transition-all"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="px-6 py-3 text-white bg-[#00685f] hover:bg-[#00534c] font-bold shadow-md shadow-[#00685f]/10 rounded-xl text-xs border-none cursor-pointer transition-all"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>

          </div>
        </main>
      </div>

      {/* BOTTOM NAV BAR (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 flex justify-around items-center h-20 px-4 md:hidden">
        <button onClick={() => navigate('/dashboard')} className="flex flex-col items-center justify-center text-slate-400 hover:text-[#00685f] border-none bg-transparent cursor-pointer">
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-[11px] font-medium mt-1">Dashboard</span>
        </button>
        <button onClick={() => navigate('/statistics')} className="flex flex-col items-center justify-center text-slate-400 hover:text-[#00685f] border-none bg-transparent cursor-pointer">
          <span className="material-symbols-outlined">analytics</span>
          <span className="text-[11px] font-medium mt-1">Statistik</span>
        </button>
        <button onClick={() => navigate('/history')} className="flex flex-col items-center justify-center text-slate-400 hover:text-[#00685f] border-none bg-transparent cursor-pointer">
          <span className="material-symbols-outlined">receipt_long</span>
          <span className="text-[11px] font-medium mt-1">Riwayat</span>
        </button>
        <button onClick={() => navigate('/settings')} className="flex flex-col items-center justify-center text-[#00685f] font-semibold border-none bg-transparent cursor-pointer">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>settings</span>
          <span className="text-[11px] font-bold mt-1">Pengaturan</span>
        </button>
      </nav>
    </div>
  );
}

export default ProfilePage;