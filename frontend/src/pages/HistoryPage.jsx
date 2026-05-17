import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function HistoryPage({ monthlyIncome, transactions = [] }) {
  const navigate = useNavigate();
  
  // State data user disinkronkan dengan localStorage (termasuk Avatar)
  const [userData, setUserData] = useState({ name: 'Celvin Alfiansyah', email: 'celvin@email.com' });
  const [userAvatar, setUserAvatar] = useState(null);

  // State untuk Pencarian dan Filter Waktu
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState('semua'); // pilihan: 'semua', 'hariIni', 'mingguIni', 'bulanIni'

  useEffect(() => {
    const storedName = localStorage.getItem('user_name');
    const storedEmail = localStorage.getItem('user_email');
    const storedAvatar = localStorage.getItem('user_avatar'); // Ambil foto profil dari localStorage
    
    if (storedName || storedEmail) {
      setUserData({ 
        name: storedName || 'Celvin Alfiansyah', 
        email: storedEmail || 'celvin@email.com' 
      });
    }
    
    if (storedAvatar) {
      setUserAvatar(storedAvatar); // Set foto profil jika ada
    }
  }, []);

  const userInitial = userData.name ? userData.name.charAt(0).toUpperCase() : 'U';

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(angka);
  };

  // LOGIKA FILTERING TRANSAKSI (Search & Time Filter)
  const filteredTransactions = transactions.filter((trx) => {
    // 1. Filter berdasarkan Pencarian (Note atau Kategori)
    const matchesSearch = 
      (trx.note && trx.note.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (trx.category && trx.category.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    // 2. Filter berdasarkan Waktu (Hari Ini, Minggu Ini, Bulan Ini)
    // Menggunakan fallback jika trx.date tidak ada atau "Baru Saja"
    const trxDate = trx.date && trx.date !== 'Baru Saja' ? new Date(trx.date) : new Date();
    const today = new Date();

    if (timeFilter === 'hariIni') {
      return trxDate.toDateString() === today.toDateString();
    } 
    
    if (timeFilter === 'mingguIni') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(today.getDate() - 7);
      return trxDate >= oneWeekAgo && trxDate <= today;
    } 
    
    if (timeFilter === 'bulanIni') {
      return trxDate.getMonth() === today.getMonth() && trxDate.getFullYear() === today.getFullYear();
    }

    return true; // Untuk pilihan 'semua'
  });

  return (
    <div className="bg-[#f9f9ff] text-[#151c27] h-screen flex overflow-hidden font-sans antialiased">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; display: inline-block; line-height: 1; vertical-align: middle; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* SIDEBAR - Persis Identik Layout Utama */}
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
            {/* Navigasi Ketiga: Riwayat Aktivitas (Active State) */}
            <button onClick={() => navigate('/history')} className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl bg-[#00685f]/10 text-[#00685f] font-semibold text-sm border-none cursor-pointer text-left">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>receipt_long</span>
              <span>Riwayat Aktivitas</span>
            </button>
            <button onClick={() => navigate('/transaction')} className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-slate-500 hover:text-[#00685f] hover:bg-slate-50 font-medium text-sm border-none cursor-pointer text-left transition-all">
              <span className="material-symbols-outlined">payments</span>
              <span>Target Tabungan</span>
            </button>
            <button onClick={() => navigate('/settings')} className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-slate-500 hover:text-[#00685f] hover:bg-slate-50 font-medium text-sm border-none cursor-pointer text-left transition-all">
              <span className="material-symbols-outlined">settings</span>
              <span>Pengaturan</span>
            </button>
          </nav>
        </div>

        {/* PROFILE FOOTER SIDEBAR (SINKRON AVATAR & NAMA) */}
        <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
          {userAvatar ? (
            <img 
              src={userAvatar} 
              alt="Profile" 
              className="w-10 h-10 rounded-full object-cover border border-slate-100"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#d8e5e2] flex items-center justify-center font-bold text-[#00685f]">
              {userInitial}
            </div>
          )}
          <div className="flex flex-col text-left overflow-hidden">
            <span className="text-xs font-bold text-slate-800 truncate">{userData.name}</span>
            <span className="text-[10px] text-slate-400 font-medium truncate">{userData.email}</span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="bg-white/80 backdrop-blur-md px-8 py-4 flex items-center justify-between border-b border-slate-100 z-20 flex-shrink-0">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>Riwayat Aktivitas</h2>
          <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
            Total Sisa: <span className="text-[#00685f] font-bold">{formatRupiah(monthlyIncome)}</span>
          </span>
        </header>

        <main className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar">
          <div className="max-w-4xl mx-auto w-full space-y-5">
            
            {/* TOOLBAR BARU: SEARCH & FILTER WAKTU */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-[0px_4px_20px_rgba(0,0,0,0.01)]">
              {/* Kolom Pencarian */}
              <div className="flex-1 relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-slate-400 text-lg">search</span>
                <input 
                  type="text"
                  placeholder="Cari catatan transaksi atau kategori..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 pl-11 pr-4 py-2.5 rounded-xl text-xs font-medium border border-slate-100 text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#00685f] focus:bg-white transition-all"
                />
              </div>

              {/* Tab Sortir Waktu */}
              <div className="flex p-1 bg-slate-100 rounded-xl gap-1 self-start sm:self-auto">
                <button 
                  onClick={() => setTimeFilter('semua')}
                  className={`px-3 py-2 text-xs font-bold rounded-lg border-none cursor-pointer transition-all ${timeFilter === 'semua' ? 'bg-white text-[#00685f] shadow-xs' : 'text-slate-500 hover:text-slate-800 bg-transparent'}`}
                >
                  Semua
                </button>
                <button 
                  onClick={() => setTimeFilter('hariIni')}
                  className={`px-3 py-2 text-xs font-bold rounded-lg border-none cursor-pointer transition-all ${timeFilter === 'hariIni' ? 'bg-white text-[#00685f] shadow-xs' : 'text-slate-500 hover:text-slate-800 bg-transparent'}`}
                >
                  Hari Ini
                </button>
                <button 
                  onClick={() => setTimeFilter('mingguIni')}
                  className={`px-3 py-2 text-xs font-bold rounded-lg border-none cursor-pointer transition-all ${timeFilter === 'mingguIni' ? 'bg-white text-[#00685f] shadow-xs' : 'text-slate-500 hover:text-slate-800 bg-transparent'}`}
                >
                  Minggu Ini
                </button>
                <button 
                  onClick={() => setTimeFilter('bulanIni')}
                  className={`px-3 py-2 text-xs font-bold rounded-lg border-none cursor-pointer transition-all ${timeFilter === 'bulanIni' ? 'bg-white text-[#00685f] shadow-xs' : 'text-slate-500 hover:text-slate-800 bg-transparent'}`}
                >
                  Bulan Ini
                </button>
              </div>
            </div>

            <h3 className="font-bold text-sm text-slate-400 uppercase tracking-wider mb-2 text-left">Daftar Transaksi Terbaru</h3>
            
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-16 text-slate-400 font-medium bg-white rounded-2xl border border-slate-100 flex flex-col items-center justify-center gap-2">
                <span className="material-symbols-outlined text-3xl text-slate-300">layers_clear</span>
                <p className="text-xs">Tidak ada mutasi transaksi yang cocok dengan filter saat ini.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTransactions.map((trx, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between shadow-[0px_4px_20px_rgba(0,0,0,0.01)]">
                    <div className="flex items-center gap-4">
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center ${trx.type === 'pengeluaran' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-[#00685f]'}`}>
                        <span className="material-symbols-outlined">
                          {trx.type === 'pengeluaran' ? 'shopping_bag' : 'payments'}
                        </span>
                      </div>
                      <div className="text-left">
                        <h4 className="text-sm font-bold text-slate-800">{trx.note || trx.category}</h4>
                        <p className="text-[11px] text-slate-400 font-medium">{trx.category} • {trx.date || 'Baru Saja'}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-extrabold ${trx.type === 'pengeluaran' ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {trx.type === 'pengeluaran' ? '-' : '+'} {formatRupiah(trx.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}

export default HistoryPage;