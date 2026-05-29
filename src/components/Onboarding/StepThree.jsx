import React from 'react';
import IconRenderer from './IconRenderer';
import FeatureItem from './FeatureItem';
import { STEP_THREE_FEATURES, STEP_THREE_TRANSACTIONS } from '../../constants/onboardingData';

const StepThree = () => {
  return (
    <div className="w-full flex flex-col lg:flex-row items-center gap-10 lg:gap-20 animate-fadeIn">
      {/* Smartphone Mockup */}
      <div className="flex-1 flex justify-center relative w-full">
        <div className="absolute w-60 h-80 bg-[#1E4D4A]/10 rounded-full blur-3xl scale-110 top-10"></div>
        <div className="relative w-56 h-[370px] md:w-64 md:h-[420px] bg-slate-900 border-[7px] border-slate-800 rounded-[44px] shadow-2xl flex flex-col overflow-hidden transform hover:rotate-2 transition-transform duration-500">
          
          <div className="bg-white flex-1 flex flex-col overflow-hidden rounded-[38px] p-4 relative">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-4.5 bg-slate-900 rounded-full z-50 flex items-center justify-end px-2">
              <div className="w-1.5 h-1.5 bg-indigo-900/40 rounded-full border border-indigo-400/20"></div>
            </div>

            <div className="flex justify-between items-center pt-1.5 pb-3 px-2">
              <span className="text-[9px] text-slate-700 font-extrabold">9:41</span>
              <div className="flex items-center gap-1 opacity-60">
                <span className="text-[8px]">📶</span>
                <span className="text-[8px]">🔋</span>
              </div>
            </div>

            <div className="flex flex-col gap-3.5 flex-1 overflow-y-auto no-scrollbar">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-medium text-slate-400">Selamat datang 👋</p>
                  <p className="text-xs font-black text-slate-800">Pengguna</p>
                </div>
                <div className="w-8 h-8 bg-gradient-to-tr from-[#1E4D4A] to-[#2D5A53] rounded-xl flex items-center justify-center shadow-md shadow-[#1E4D4A]/20">
                  <span className="text-white text-xs font-black">P</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#1E4D4A] to-[#143533] rounded-2xl p-3.5 text-white shadow-xl shadow-[#1E4D4A]/10 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-20 h-20 bg-white/5 rounded-full blur-xl"></div>
                <p className="text-[8px] uppercase tracking-wider opacity-60 font-bold mb-1">Sisa Dana Hari Ini</p>
                <p className="text-xl font-black tracking-tight leading-none">Rp 125.000</p>
                <div className="mt-3 h-1 bg-white/20 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-300 to-teal-400 w-3/4 h-full rounded-full"></div>
                </div>
                <div className="flex justify-between mt-1.5 text-[8px] opacity-70 font-medium">
                  <p>Terpakai: Rp 93k</p>
                  <p>Sisa: Rp 32k</p>
                </div>
              </div>

              <div>
                <p className="text-[9px] font-extrabold text-slate-400 mb-2 uppercase tracking-widest">Aktivitas Terbaru</p>
                <div className="space-y-1.5">
                  {STEP_THREE_TRANSACTIONS.map(({ icon, label, amount, category, isExpense }) => (
                    <div key={label} className="flex items-center gap-2.5 py-1.5 border-b border-slate-50 last:border-0">
                      <div className="w-7 h-7 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 shadow-inner">
                        <IconRenderer icon={icon} className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-bold text-slate-700 truncate leading-tight">{label}</p>
                        <p className="text-[7px] text-slate-400 font-medium">{category}</p>
                      </div>
                      <p className={`text-[10px] font-black tracking-tight flex-shrink-0 ${isExpense ? 'text-rose-500' : 'text-emerald-600'}`}>
                        {amount}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-amber-50/80 border border-amber-100 rounded-xl p-2.5 flex items-center gap-2.5 mt-auto shadow-sm">
                <span className="text-sm flex-shrink-0 animate-pulse">🚨</span>
                <p className="text-[8px] text-amber-800 font-semibold leading-normal">
                  Anggaran <span className="underline font-black">Keinginan</span> tersisa 15% lagi untuk hari ini. Rem dulu yuk!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Kanan - Feature Badges Grid */}
      <div className="flex-1 text-center lg:text-left max-w-md w-full">
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full mb-4 border border-emerald-100/50">
          🛡️ Pantau Finansial Secara Real-Time
        </div>
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-slate-800 mb-3 tracking-tight">
          Daily Budget & <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1E4D4A] to-[#609994]">Smart Alert</span>
        </h2>
        <p className="text-sm md:text-base text-slate-500 leading-relaxed mb-6 font-medium">
          Nikmati kendali penuh setiap hari. Dapatkan pengingat proaktif sebelum dompet Anda mengalami defisit tak terduga.
        </p>

        <div className="space-y-3">
          {STEP_THREE_FEATURES.map((feature) => (
            <FeatureItem key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StepThree;