import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function SetupFinancial({ setMonthlyIncome, setCustomPct, setUserSelectedGoals }) {
  const navigate = useNavigate();

  const [income, setIncome] = useState(5000000);
  const [financialGoals, setFinancialGoals] = useState(['rumah']);
  
  // State persentase alokasi
  const [pctKebutuhan, setPctKebutuhan] = useState(50);
  const [pctKeinginan, setPctKeinginan] = useState(30);
  const [pctTabungan, setPctTabungan] = useState(20);

  const totalPercentage = pctKebutuhan + pctKeinginan + pctTabungan;

  const kebutuhanNominal = (income * pctKebutuhan) / 100;
  const keinginanNominal = (income * pctKeinginan) / 100;
  const tabunganNominal = (income * pctTabungan) / 100;

  const strokeKebutuhan = pctKebutuhan;
  const strokeKeinginan = pctKeinginan;
  const strokeTabungan = pctTabungan;

  const offsetKebutuhan = 0;
  const offsetKeinginan = -strokeKebutuhan;
  const offsetTabungan = -(strokeKebutuhan + strokeKeinginan);

  const goalsOptions = [
    { id: 'rumah', label: 'Beli Rumah Impian', icon: 'home' },
    { id: 'mobil', label: 'Beli Mobil Baru', icon: 'directions_car' },
    { id: 'liburan', label: 'Liburan', icon: 'flight' },
    { id: 'gadget', label: 'Upgrade Gadget & PC', icon: 'laptop_mac' },
    { id: 'darurat', label: 'Dana Darurat Utama', icon: 'health_and_safety' }
  ];

  const handleGoalToggle = (id) => {
    if (financialGoals.includes(id)) {
      setFinancialGoals(financialGoals.filter(g => g !== id));
    } else {
      setFinancialGoals([...financialGoals, id]);
    }
  };

  // Fungsi saat menekan tombol "Terapkan Strategi Keuangan"
  const handleApplyStrategy = async () => {
    if (totalPercentage !== 100) {
      alert('Total alokasi harus pas 100% sebelum melanjutkan!');
      return;
    }

    try {
      const response = await api.put('/user/setup', {
        income: income,
        allocation: {
          kebutuhan: pctKebutuhan,
          keinginan: pctKeinginan,
          tabungan: pctTabungan
        },
        goals: financialGoals
      });

      if (response.data.success) {
        navigate('/dashboard', { state: { fromSetup: true } });
      }
    } catch (error) {
      console.error('Gagal menyimpan setup:', error);
      alert('Terjadi kesalahan, silakan coba lagi.');
    }
  };

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(angka);
  };

  return (
    <div className="min-h-screen bg-[#f9f9ff] text-[#151c27] flex items-center justify-center p-4 md:p-8 font-sans antialiased">
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

      <div className="w-full max-w-5xl bg-white rounded-[32px] border border-slate-100 shadow-[0px_10px_50px_rgba(0,0,0,0.02)] overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        {/* PANEL KIRI: SIMULATOR & PREFERENSI (SPAN 7) */}
        <div className="lg:col-span-7 p-6 md:p-10 space-y-8 max-h-[90vh] overflow-y-auto no-scrollbar">
          <div className="text-left space-y-1">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-800" style={{ fontFamily: 'Manrope, sans-serif' }}>Atur Strategi Keuangan</h2>
            <p className="text-xs text-slate-400 font-medium">Sesuaikan rasio budgeting bulanan sesuai lifestyle-mu</p>
          </div>

          {/* INPUT NOMINAL SALDO */}
          <div className="space-y-3 text-left">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-[#00685f]">payments</span>
              Total Pendapatan Bersih Bulanan
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">IDR</span>
              <input 
                type="number" 
                value={income}
                onChange={(e) => setIncome(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full pl-14 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-base font-bold text-slate-800 focus:outline-none focus:border-[#00685f] focus:bg-white transition-all"
                placeholder="0"
              />
            </div>
          </div>

          {/* PENGATURAN KUSTOM PERSENTASE */}
          <div className="space-y-4 text-left">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-[#334A43]">tune</span>
                Kustomisasi Rasio Anggaran
              </label>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${totalPercentage === 100 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                Total: {totalPercentage}% / 100%
              </span>
            </div>

          <div className="space-y-5 bg-slate-50/50 border border-slate-100 p-5 rounded-2xl">
            {/* Kebutuhan */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-700 items-center">
                <span>Kebutuhan Pokok</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={pctKebutuhan}
                    onChange={(e) => {
                      let val = parseInt(e.target.value) || 0;
                      if (val > 100) val = 100;
                      if (val < 0) val = 0;
                      setPctKebutuhan(val);
                    }}
                    className="w-16 text-center text-xs border border-slate-200 rounded-lg py-1 px-1 focus:outline-none focus:border-[#00685f]"
                  />
                  <span>%</span>
                </div>
              </div>
              <input 
                type="range" min="0" max="100" value={pctKebutuhan}
                onChange={(e) => setPctKebutuhan(parseInt(e.target.value))}
                className="w-full accent-[#334A43] h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            {/* Keinginan */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-700 items-center">
                <span>Gaya Hidup &amp; Keinginan</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={pctKeinginan}
                    onChange={(e) => {
                      let val = parseInt(e.target.value) || 0;
                      if (val > 100) val = 100;
                      if (val < 0) val = 0;
                      setPctKeinginan(val);
                    }}
                    className="w-16 text-center text-xs border border-slate-200 rounded-lg py-1 px-1 focus:outline-none focus:border-[#00685f]"
                  />
                  <span>%</span>
                </div>
              </div>
              <input 
                type="range" min="0" max="100" value={pctKeinginan}
                onChange={(e) => setPctKeinginan(parseInt(e.target.value))}
                className="w-full accent-[#566C63] h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            {/* Tabungan */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-700 items-center">
                <span>Tabungan &amp; Investasi</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={pctTabungan}
                    onChange={(e) => {
                      let val = parseInt(e.target.value) || 0;
                      if (val > 100) val = 100;
                      if (val < 0) val = 0;
                      setPctTabungan(val);
                    }}
                    className="w-16 text-center text-xs border border-slate-200 rounded-lg py-1 px-1 focus:outline-none focus:border-[#00685f]"
                  />
                  <span>%</span>
                </div>
              </div>
              <input 
                type="range" min="0" max="100" value={pctTabungan}
                onChange={(e) => setPctTabungan(parseInt(e.target.value))}
                className="w-full accent-[#A2B097] h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>
          </div>
          </div>

          {/* PILIHAN GOALS IMPIAN */}
          <div className="space-y-3 text-left">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-[#00685f]">target</span>
              Pilih Target Finansial Impianmu
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {goalsOptions.map((goal) => {
                const isSelected = financialGoals.includes(goal.id);
                return (
                  <button
                    key={goal.id}
                    onClick={() => handleGoalToggle(goal.id)}
                    className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${isSelected ? 'bg-[#00685f]/5 border-[#00685f] text-[#00685f]' : 'bg-transparent border-slate-100 text-slate-500 hover:bg-slate-50'}`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isSelected ? 'bg-[#00685f] text-white' : 'bg-slate-100 text-slate-400'}`}>
                      <span className="material-symbols-outlined text-lg">{goal.icon}</span>
                    </div>
                    <span className="text-xs font-bold">{goal.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* PANEL KANAN: LIVE PREVIEW CHART (SPAN 5) */}
        <div className="lg:col-span-5 bg-slate-50 border-l border-slate-100 p-6 md:p-10 flex flex-col justify-between items-center text-center max-h-[90vh] overflow-y-auto no-scrollbar">
          <div className="w-full space-y-6">
            <div className="text-center md:text-left">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Live Preview Alokasi</h3>
            </div>

            {/* SVG DONUT CHART PREVIEW */}
            <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#334A43" strokeWidth="4" strokeDasharray={`${strokeKebutuhan} 100`} strokeDashoffset={offsetKebutuhan} strokeLinecap="round"/>
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#566C63" strokeWidth="4" strokeDasharray={`${strokeKeinginan} 100`} strokeDashoffset={offsetKeinginan} strokeLinecap="round"/>
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#A2B097" strokeWidth="4" strokeDasharray={`${strokeTabungan} 100`} strokeDashoffset={offsetTabungan} strokeLinecap="round"/>
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rasio</span>
                <span className="text-base font-black text-slate-800" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  {pctKebutuhan}:{pctKeinginan}:{pctTabungan}
                </span>
              </div>
            </div>

            {/* LEGEND PREVIEW */}
            <div className="w-full bg-white rounded-2xl p-4 border border-slate-100 space-y-3 text-left">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00685f] block"></span>
                  <span className="text-slate-500 font-medium">Kebutuhan ({pctKebutuhan}%)</span>
                </div>
                <span className="font-bold text-slate-800">{formatRupiah(kebutuhanNominal)}</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-600 block"></span>
                  <span className="text-slate-500 font-medium">Keinginan ({pctKeinginan}%)</span>
                </div>
                <span className="font-bold text-slate-800">{formatRupiah(keinginanNominal)}</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-600 block"></span>
                  <span className="text-slate-500 font-medium">Tabungan ({pctTabungan}%)</span>
                </div>
                <span className="font-bold text-slate-800">{formatRupiah(tabunganNominal)}</span>
              </div>
            </div>
          </div>

          {/* ACTION BUTTON */}
          <div className="w-full pt-6">
            <button
              onClick={handleApplyStrategy}
              disabled={totalPercentage !== 100}
              className={`w-full py-4 rounded-2xl font-bold text-sm shadow-md transition-all active:scale-[0.98] border-none cursor-pointer text-white ${totalPercentage === 100 ? 'bg-[#00685f] hover:bg-[#005049]' : 'bg-slate-300 cursor-not-allowed shadow-none'}`}
            >
              Terapkan Strategi Keuangan
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}

export default SetupFinancial;