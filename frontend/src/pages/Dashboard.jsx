import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function Dashboard({ monthlyIncome, setMonthlyIncome, customPct, userSelectedGoals, transactions }) {
  const location = useLocation();
  const navigate = useNavigate();
  

  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [userData, setUserData] = useState({
    name: 'Celvin Alfiansyah',
    email: 'celvin@email.com'
  });
  const [userAvatar, setUserAvatar] = useState(null); // Tambahan state untuk menyimpan foto profil

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
      setUserAvatar(storedAvatar); // Set ke state jika foto ditemukan
    }

    if (location.state?.fromSetup) {
      setShowWelcomePopup(true);
      const timer = setTimeout(() => setShowWelcomePopup(false), 5000); 
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // Mengambil persentase alokasi dinamis dari SetupFinancial melalui props
  const pctKebutuhan = customPct?.kebutuhan ?? 50;
  const pctKeinginan = customPct?.keinginan ?? 30;
  const pctTabungan = customPct?.tabungan ?? 20;

  // Hitung nominal uang dinamis berdasarkan props global
  const kebutuhan = (monthlyIncome * pctKebutuhan) / 100;
  const keinginan = (monthlyIncome * pctKeinginan) / 100;
  const tabungan = (monthlyIncome * pctTabungan) / 100;

  // Rumus hitung persentase stroke dasharray keliling lingkaran SVG sesuai SetupFinancial
  const strokeKebutuhan = pctKebutuhan;
  const strokeKeinginan = pctKeinginan;
  const strokeTabungan = pctTabungan;

  const offsetKebutuhan = 0;
  const offsetKeinginan = -strokeKebutuhan;
  const offsetTabungan = -(strokeKebutuhan + strokeKeinginan);

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(angka);
  };

  const userInitial = userData.name ? userData.name.charAt(0).toUpperCase() : 'U';

  // Daftar lengkap target tabungan yang disinkronkan dengan preferensi userSelectedGoals dari SetupFinancial
  const allGoals = [
    { id: 'rumah', label: 'Beli Rumah Impian', icon: 'home', progress: '0% Terkumpul', target: formatRupiah(500000000) },
    { id: 'mobil', label: 'Beli Mobil Baru', icon: 'directions_car', progress: '0% Terkumpul', target: formatRupiah(150000000) },
    { id: 'liburan', label: 'Liburan ke Jepang', icon: 'flight', progress: '0% Terkumpul', target: formatRupiah(25000000) },
    { id: 'gadget', label: 'Upgrade Gadget & PC', icon: 'laptop_mac', progress: '0% Terkumpul', target: formatRupiah(15000000) },
    { id: 'darurat', label: 'Dana Darurat Utama', icon: 'health_and_safety', progress: '0% Terkumpul', target: formatRupiah(10000000) },
  ];

  return (
    <div className="bg-[#f9f9ff] text-[#151c27] h-screen flex overflow-hidden font-sans antialiased">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          display: inline-block;
          line-height: 1;
          vertical-align: middle;
        }

        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Pop-up Notifikasi Berhasil */}
      {showWelcomePopup && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[60] bg-[#00685f] text-white px-6 py-4 rounded-2xl shadow-[0px_10px_30px_rgba(0,104,95,0.3)] flex items-center gap-3 font-semibold text-sm border border-[#008378] animate-bounce">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          <span>Strategi Finansial Berhasil Diterapkan Ke Akunmu!</span>
        </div>
      )}

      {/* SISI KIRI: SIDEBAR LAYOUT */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col justify-between p-6 h-full flex-shrink-0 hidden md:flex">
        <div className="space-y-8">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-xl bg-[#00685f] flex items-center justify-center text-white shadow-xs">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
            </div>
            <span className="text-xl font-extrabold text-[#00685f] tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>WealthFlow</span>
          </div>

          <nav className="space-y-1.5">
            <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl bg-[#00685f]/10 text-[#00685f] font-semibold text-sm border-none cursor-pointer text-left">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
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
            <button onClick={() => navigate('/settings')} className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-slate-500 hover:text-[#00685f] hover:bg-slate-50 font-medium text-sm border-none cursor-pointer text-left transition-all">
              <span className="material-symbols-outlined">settings</span>
              <span>Pengaturan</span>
            </button>
          </nav>
        </div>

        {/* BAGIAN FOTO PROFIL SIDEBAR DESKTOP */}
        <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-[#00685f]/20 bg-[#d8e5e2] flex items-center justify-center font-bold text-[#00685f] flex-shrink-0">
            {userAvatar ? (
              <img src={userAvatar} className="w-full h-full object-cover" alt="avatar" />
            ) : (
              userInitial
            )}
          </div>
          <div className="flex flex-col text-left overflow-hidden">
            <span className="text-xs font-bold text-slate-800 truncate">{userData.name}</span>
            <span className="text-[10px] text-slate-400 font-medium truncate">{userData.email}</span>
          </div>
        </div>
      </aside>

      {/* SISI KANAN: UTAMA HALAMAN KONTEN */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* TOP BAR / HEADER */}
        <header className="bg-white/80 backdrop-blur-md px-8 py-4 flex items-center justify-between border-b border-slate-100 z-20 flex-shrink-0">
          <div className="flex flex-col text-left">
            <h2 className="text-xl font-bold text-slate-800 tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>Ringkasan Finansial</h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Strategi budgeting bulananmu</p>
          </div>
          
          <button 
            onClick={() => navigate('/transaction')}
            className="flex items-center gap-2 bg-[#00685f] hover:bg-[#005049] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-[0px_4px_12px_rgba(0,104,95,0.15)] transition-all active:scale-95 border-none cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            <span>Catat Transaksi</span>
          </button>
        </header>

        {/* WORKSPACE AREA */}
        <main className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
          
          {/* HERO GRID NOMINAL UANG */}
          <div className="w-full">
            <div className="bg-[#008378] rounded-3xl p-8 flex flex-col justify-between shadow-[0px_4px_20px_rgba(0,0,0,0.01)] relative overflow-hidden group">
              <div className="space-y-2 text-left relative z-10">
                <span className="text-xs font-bold text-[#ffffff] uppercase tracking-wider">Total Anggaran Bulanan Utama</span>
                <h3 className="text-4xl font-extrabold text-[#ffffff] tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  {formatRupiah(monthlyIncome)}
                </h3>
              </div>
              <div className="flex items-center justify-between mt-6 relative z-10 border-t border-slate-50 pt-4">
                <span className="text-xs font-semibold text-[#ffffff]">Arus Kas Dompet Aktif Terintegrasi</span>
                <div className="w-9 h-9 rounded-xl bg-[#00685f]/5 flex items-center justify-center text-[#00685f]">
                  <span className="material-symbols-outlined text-[#ffffff]">account_balance</span>
                </div>
              </div>
            </div>
          </div>

          {/* ROW 2: GRAPHICS & TARGET PROGRESS MAP */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* COLUMN LEFT (SPAN 7): PIE CHART CONTAINER */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-100 shadow-[0px_4px_20px_rgba(0,0,0,0.01)]">
              <div className="flex flex-col text-left mb-6">
                <h3 className="font-bold text-base text-slate-800 tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>Proporsi Alokasi Anggaran</h3>
                <p className="text-xs text-slate-400 mt-0.5">Rasio pembagian berdasarkan preferensi setup kamu</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-2">
                
                {/* Lingkaran Donut SVG */}
                <div className="relative w-40 h-40 flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#334A43" strokeWidth="4.5" strokeDasharray={`${strokeKebutuhan} 100`} strokeDashoffset={offsetKebutuhan} strokeLinecap="round"/>
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#566C63" strokeWidth="4.5" strokeDasharray={`${strokeKeinginan} 100`} strokeDashoffset={offsetKeinginan} strokeLinecap="round"/>
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#A2B097" strokeWidth="4.5" strokeDasharray={`${strokeTabungan} 100`} strokeDashoffset={offsetTabungan} strokeLinecap="round"/>
                  </svg>
                  
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Rasio</span>
                    <span className="text-sm font-black text-slate-800" style={{ fontFamily: 'Manrope, sans-serif' }}>
                      {pctKebutuhan}/{pctKeinginan}/{pctTabungan}
                    </span>
                  </div>
                </div>

                {/* List Legend Keterangan */}
                <div className="flex flex-col gap-3.5 flex-1 w-full text-left">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <div className="flex items-center gap-2.5">
                      <span className="w-3 h-3 rounded-full bg-[#334A43] block"></span>
                      <span className="text-slate-500">Kebutuhan Utama ({pctKebutuhan}%)</span>
                    </div>
                    <span className="text-slate-800 font-bold">{formatRupiah(kebutuhan)}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-semibold">
                    <div className="flex items-center gap-2.5">
                      <span className="w-3 h-3 rounded-full bg-[#566C63] block"></span>
                      <span className="text-slate-500">Gaya Hidup/Keinginan ({pctKeinginan}%)</span>
                    </div>
                    <span className="text-slate-800 font-bold">{formatRupiah(keinginan)}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-semibold">
                    <div className="flex items-center gap-2.5">
                      <span className="w-3 h-3 rounded-full bg-[#A2B097] block"></span>
                      <span className="text-slate-500">Tabungan Deposito ({pctTabungan}%)</span>
                    </div>
                    <span className="text-slate-800 font-bold">{formatRupiah(tabungan)}</span>
                  </div>
                </div>

              </div>
            </div>

            {/* COLUMN RIGHT (SPAN 5): TARGET IMPIAN WIDGETS */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-100 shadow-[0px_4px_20px_rgba(0,0,0,0.01)]">
              <div className="flex flex-col text-left mb-5">
                <h3 className="font-bold text-base text-slate-800 tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>Target Finansial Impian</h3>
                <p className="text-xs text-slate-400 mt-0.5">Alokasi otomatis dari pilihan SetupFinancial</p>
              </div>

              <div className="max-h-[175px] overflow-y-auto no-scrollbar pr-1">
                <div className="space-y-3">
                  {allGoals.map((goal) => {
                    const isUserGoal = userSelectedGoals?.includes(goal.id);
                    return (
                      <div key={goal.id} className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${isUserGoal ? 'bg-slate-50/60 border-slate-100 opacity-100 font-semibold' : 'bg-white border-dashed border-slate-100 opacity-30 select-none'}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${isUserGoal ? 'bg-[#00685f] text-white' : 'bg-slate-100 text-slate-400'}`}>
                            <span className="material-symbols-outlined text-[18px]">{goal.icon}</span>
                          </div>
                          <div className="text-left">
                            <h4 className="text-xs font-bold text-slate-800">{goal.label}</h4>
                            <p className="text-[10px] text-slate-400 font-medium">
                              {isUserGoal ? `Alokasi Aktif: ${formatRupiah(tabungan)}` : 'Tidak Dipilih'}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-slate-700">{goal.target}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>

          {/* ROW 3: RECENT ACTIVITIES MUTATION LIST */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0px_4px_20px_rgba(0,0,0,0.01)]">
            <div className="flex justify-between items-center mb-4">
              <div className="flex flex-col text-left">
                <h4 className="font-bold text-slate-800 text-sm tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>Aktivitas Transaksi Terakhir</h4>
                <p className="text-[11px] text-slate-400">Mutasi keuangan masuk dan keluar</p>
              </div>
              <button onClick={() => navigate('/history')} className="text-xs font-bold text-[#00685f] hover:text-[#005049] bg-transparent border-none cursor-pointer hover:underline transition-all">
                Lihat Semua
              </button>
            </div>

            <div className="space-y-3">
              {transactions && transactions.length > 0 ? (
                transactions.slice(0, 3).map((trx, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3.5 bg-slate-50/50 rounded-2xl border border-slate-100 transition-all hover:bg-slate-50">
                    <div className="flex items-center gap-3.5">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center ${trx.type === 'pengeluaran' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-[#00685f]'}`}>
                        <span className="material-symbols-outlined text-base">
                          {trx.type === 'pengeluaran' ? 'shopping_bag' : 'payments'}
                        </span>
                      </div>
                      <div className="text-left">
                        <h5 className="text-xs font-bold text-slate-800">{trx.note || trx.category}</h5>
                        <p className="text-[10px] text-slate-400 font-medium">{trx.category} • {trx.date}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-black ${trx.type === 'pengeluaran' ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {trx.type === 'pengeluaran' ? '-' : '+'} {formatRupiah(trx.amount)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-4">Belum ada riwayat aktivitas transaksi.</p>
              )}
            </div>
          </div>

        </main>
      </div>

      {/* FAB Floating Action Button */}
      <button 
        onClick={() => navigate('/transaction')} 
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#00685f] text-white rounded-full flex items-center justify-center shadow-[0px_6px_20px_rgba(0,104,95,0.2)] hover:bg-[#008378] active:scale-95 transition-all duration-150 z-50 cursor-pointer border-none"
      >
        <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'wght' 500" }}>add</span>
      </button>

    </div>
  );
}

export default Dashboard;