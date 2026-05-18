import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Onboarding() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      navigate('/login'); // Selesai step 3, lanjut ke Login
    }
  };

  const handleSkip = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-6 max-w-6xl mx-auto">
      {/* Header / Navbar */}
      <div className="flex justify-between items-center w-full py-2">
        <div className="text-[#1E4D4A] font-bold text-xl flex items-center gap-2">
          <span className="p-1.5 bg-[#1E4D4A] text-white rounded-md text-xs">WF</span>
          WealthFlow
        </div>
        <button onClick={handleSkip} className="text-sm text-slate-400 hover:text-slate-600 font-medium">
          Skip
        </button>
      </div>

      {/* Konten Utama Berdasarkan Step */}
      <div className="flex-1 flex flex-col items-center justify-center my-8 text-center max-w-md mx-auto">
        {step === 1 && (
          <div className="animate-fadeIn">
            {/* Ilustrasi Kotak Dompet */}
            <div className="w-64 h-64 bg-[#E0EBE9] rounded-3xl flex items-center justify-center mb-8 shadow-inner relative overflow-hidden">
              <div className="w-40 h-28 bg-[#52796F] rounded-2xl border-4 border-white shadow-md relative z-10 flex items-center justify-end p-3">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
              <div className="absolute w-24 h-16 bg-[#A3B18A] opacity-60 rounded-xl transform -rotate-12 -top-4 left-12"></div>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Welcome to WealthFlow</h2>
            <p className="text-sm text-slate-500 leading-relaxed">Atur keuangan jadi lebih mudah dan otomatis.</p>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fadeIn w-full">
            {/* Visual Alokasi 50/30/20 */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-32 h-32 rounded-full border-[12px] border-slate-100 border-t-[#1E4D4A] border-r-[#52796F] border-b-[#A3B18A] flex items-center justify-center mb-6 shadow-sm">
                <span className="text-lg font-bold text-slate-700">50/30/20</span>
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Strategi Cerdas Kelola Gaji</h2>
              <p className="text-xs text-slate-400 max-w-xs mb-6">Sistem otomatis membagi pendapatanmu dengan cerdas untuk masa depan yang lebih mapan.</p>
            </div>

            {/* List Alokasi */}
            <div className="space-y-3 w-full text-left">
              <div className="flex items-center justify-between p-3.5 bg-white border border-slate-100 rounded-xl shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#E0EBE9] text-[#1E4D4A] rounded-lg text-sm">📋</div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700">Kebutuhan</h4>
                    <p className="text-[11px] text-slate-400">Sewa, utilitas, belanja bulanan.</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-[#1E4D4A]">50%</span>
              </div>
              <div className="flex items-center justify-between p-3.5 bg-white border border-slate-100 rounded-xl shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#F4F1DE] text-[#E07A5F] rounded-lg text-sm">🎨</div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700">Keinginan</h4>
                    <p className="text-[11px] text-slate-400">Hobi, hiburan, makan di luar.</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-[#52796F]">30%</span>
              </div>
              <div className="flex items-center justify-between p-3.5 bg-white border border-slate-100 rounded-xl shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#EAEFEE] text-[#3D5A80] rounded-lg text-sm">🐖</div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700">Tabungan</h4>
                    <p className="text-[11px] text-slate-400">Investasi, dana darurat, hari tua.</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-[#A3B18A]">20%</span>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fadeIn">
            {/* Ilustrasi Daily Budget Handphone */}
            <div className="w-52 h-72 bg-white border-4 border-slate-100 rounded-[32px] shadow-xl mx-auto mb-8 p-4 flex flex-col justify-start relative">
              <div className="w-12 h-4 bg-slate-100 rounded-full mx-auto mb-6"></div>
              <div className="border border-slate-100 rounded-2xl p-3 text-center shadow-sm">
                <p className="text-[10px] text-slate-400">Uang Hari Ini</p>
                <p className="text-base font-bold text-[#1E4D4A] my-1">Rp 125.000</p>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#1E4D4A] w-3/4 h-full"></div>
                </div>
                <p className="text-[9px] text-slate-300 mt-1">Gunakan dengan bijak!</p>
              </div>
              <div className="mt-4 space-y-2">
                <div className="h-6 bg-slate-50 rounded-lg w-full"></div>
                <div className="h-6 bg-slate-50 rounded-lg w-5/6"></div>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Daily Budget</h2>
            <p className="text-sm text-slate-500 leading-relaxed">Tahu sisa uang yang bisa dipakai setiap hari.</p>
          </div>
        )}

        {/* Tombol Navigasi Aksi */}
        <button
          onClick={handleNext}
          className="w-full mt-10 py-3.5 bg-[#2D5A53] hover:bg-[#1E4D4A] text-white font-semibold rounded-xl shadow-md transition-all duration-200 cursor-pointer"
        >
          {step === 3 ? 'Mulai Sekarang' : 'Next'}
        </button>
      </div>

      {/* Indikator Titik Halaman & Informasi Step */}
      <div className="flex flex-col items-center gap-2 py-4">
        <div className="flex gap-2">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className={`h-2 rounded-full transition-all duration-300 ${
                step === item ? 'w-5 bg-[#2D5A53]' : 'w-2 bg-slate-200'
              }`}
            ></div>
          ))}
        </div>
        <span className="text-[11px] text-slate-400 font-medium">Step {step} of 3</span>
      </div>
    </div>
  );
}

export default Onboarding;