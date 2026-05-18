import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function StatisticsPage({ monthlyIncome, customPct, transactions }) {
  const navigate = useNavigate();
  
  // State data user disinkronkan dengan localStorage (termasuk Avatar)
  const [userData, setUserData] = useState({ name: 'Celvin Alfiansyah', email: 'celvin@email.com' });
  const [userAvatar, setUserAvatar] = useState(null); 

  useEffect(() => {
    const storedName = localStorage.getItem('user_name');
    const storedEmail = localStorage.getItem('user_email');
    const storedAvatar = localStorage.getItem('user_avatar'); // Ambil foto profil
    
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

  // Mengambil persentase alokasi dinamis aman dengan fallback default 50/30/20
  const pctKebutuhan = customPct?.kebutuhan ?? 50;
  const pctKeinginan = customPct?.keinginan ?? 30;
  const pctTabungan = customPct?.tabungan ?? 20;

  // Kalkulasi Anggaran Sinkron dengan Dashboard
  const kebutuhan = (monthlyIncome * pctKebutuhan) / 100;
  const keinginan = (monthlyIncome * pctKeinginan) / 100;
  const tabungan = (monthlyIncome * pctTabungan) / 100;

  // Matematika SVG Donut Pie Chart
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
            <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-slate-500 hover:text-[#00685f] hover:bg-slate-50 font-medium text-sm border-none cursor-pointer text-left transition-all">
              <span className="material-symbols-outlined">dashboard</span>
              <span>Dashboard</span>
            </button>
            <button onClick={() => navigate('/statistics')} className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl bg-[#00685f]/10 text-[#00685f] font-semibold text-sm border-none cursor-pointer text-left">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
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

      {/* SISI KANAN: UTAMA HALAMAN KONTEN */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* HEADER BAR */}
        <header className="bg-white/80 backdrop-blur-md px-8 py-4 flex items-center justify-between border-b border-slate-100 z-20 flex-shrink-0">
          <div className="flex flex-col text-left">
            <h2 className="text-xl font-bold text-slate-800 tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>Statistik Analisis</h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Pantau rasio dan efisiensi kesehatan finansialmu</p>
          </div>
          
          <button 
            onClick={() => navigate('/transaction')}
            className="flex items-center gap-2 bg-[#00685f] hover:bg-[#005049] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-[0px_4px_12px_rgba(0,104,95,0.15)] transition-all border-none cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            <span>Catat Transaksi</span>
          </button>
        </header>

        {/* MAIN STORAGE SCROLL */}
        <main className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
          
          {/* HERO GRID ANGGARAN UTAMA */}
          <div className="w-full">
            <div className="bg-[#008378] rounded-3xl p-8 flex flex-col justify-between shadow-[0px_4px_20px_rgba(0,0,0,0.01)] relative overflow-hidden group">
              <div className="space-y-2 text-left relative z-10">
                <span className="text-xs font-bold text-[#ffffff] uppercase tracking-wider">Total Batas Anggaran Bulanan</span>
                <h3 className="text-4xl font-extrabold text-[#ffffff] tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  {formatRupiah(monthlyIncome)}
                </h3>
              </div>
              <div className="flex items-center justify-between mt-6 relative z-10 border-t border-slate-50 pt-4">
                <span className="text-xs font-semibold text-[#ffffff]">Dasar Alokasi Strategis Terpakai</span>
                <div className="w-9 h-9 rounded-xl bg-[#00685f]/5 flex items-center justify-center text-[#ffffff]">
                  <span className="material-symbols-outlined text-lg">insights</span>
                </div>
              </div>
            </div>
          </div>

          {/* KREDIT UTAMA / PROPORSI BUDGET */}
          <section className="w-full bg-white rounded-3xl p-6 border border-slate-100 shadow-[0px_4px_20px_rgba(0,0,0,0.01)]">
            <div className="flex flex-col text-left mb-6">
              <h3 className="font-bold text-base text-slate-800 tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>Kredit &amp; Rasio Alokasi</h3>
              <p className="text-xs text-slate-400 mt-0.5">Visualisasi rasio anggaran aktif saat ini</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-12 py-4">
              <div className="relative w-44 h-44 flex items-center justify-center flex-shrink-0">
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

              <div className="flex flex-col gap-4 flex-1 w-full text-left">
                <div className="flex items-center justify-between text-xs font-semibold border-b border-slate-50 pb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-[#334A43] block"></span>
                    <span className="text-slate-500">Kebutuhan ({pctKebutuhan}%)</span>
                  </div>
                  <span className="text-slate-800 font-bold text-sm">{formatRupiah(kebutuhan)}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold border-b border-slate-50 pb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-[#566C63] block"></span>
                    <span className="text-slate-500">Keinginan ({pctKeinginan}%)</span>
                  </div>
                  <span className="text-slate-800 font-bold text-sm">{formatRupiah(keinginan)}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold pb-1">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-[#A2B097] block"></span>
                    <span className="text-slate-500">Tabungan ({pctTabungan}%)</span>
                  </div>
                  <span className="text-slate-800 font-bold text-sm">{formatRupiah(tabungan)}</span>
                </div>
              </div>
            </div>
          </section>

          {/* ROW TIPS HEMAT SMART & BATAS EFISIENSI KATEGORI */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* TIPS HEMAT DARI WEALTHFLOW WIDGET */}
            <section className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-100 shadow-[0px_4px_20px_rgba(0,0,0,0.01)] text-left h-full">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
                <h3 className="font-bold text-base text-slate-800 tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>Tips Hemat Minggu Ini</h3>
              </div>
              
              <div className="space-y-4">
                <div className="p-3.5 bg-amber-50/50 border border-amber-100 rounded-2xl flex gap-3">
                  <span className="material-symbols-outlined text-amber-600 mt-0.5">rule_folder</span>
                  <div className="space-y-0.5">
                    <h5 className="text-xs font-bold text-amber-900">Evaluasi Aturan 24 Jam</h5>
                    <p className="text-[11px] text-amber-800 leading-relaxed">Tunggu 24 jam sebelum melakukan pembelian pos keinginan sebesar <b>{formatRupiah(keinginan * 0.1)}</b> untuk menghindari belanja impulsif.</p>
                  </div>
                </div>

                <div className="p-3.5 bg-[#00685f]/5 border border-[#00685f]/10 rounded-2xl flex gap-3">
                  <span className="material-symbols-outlined text-[#00685f] mt-0.5">monetization_on</span>
                  <div className="space-y-0.5">
                    <h5 className="text-xs font-bold text-[#004d46]">Maksimalkan Autodebit Komposit</h5>
                    <p className="text-[11px] text-[#005a52] leading-relaxed">Sisihkan alokasi tabungan bulananmu senilai <b>{formatRupiah(tabungan)}</b> langsung di awal gajian agar aman dari terpakai.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* BATAS EFISIENSI KATEGORI */}
            <section className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-100 shadow-[0px_4px_20px_rgba(0,0,0,0.01)] h-full">
              <h3 className="font-bold text-base text-slate-800 mb-6 tracking-tight text-left" style={{ fontFamily: 'Manrope, sans-serif' }}>Batas Efisiensi Kategori</h3>
              <div className="space-y-5 text-left">
                {/* 1. Kebutuhan */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-700">Makan &amp; Minum (Kebutuhan)</span>
                    <span className="text-xs font-bold text-slate-500">{formatRupiah(kebutuhan)}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#334A43] h-full rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
                
                {/* 2. Keinginan */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-700">Hiburan &amp; Games (Keinginan)</span>
                    <span className="text-xs font-bold text-slate-500">{formatRupiah(keinginan)}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#566C63] h-full rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>

                {/* 3. Tabungan */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-700">Simpanan Berjangka (Tabungan)</span>
                    <span className="text-xs font-bold text-slate-500">{formatRupiah(tabungan)}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#A2B097] h-full rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
              </div>
            </section>

          </div>

        </main>
      </div>
    </div>
  );
}

export default StatisticsPage;