import React from 'react';
import AllocationCard from './AllocationCard';
import { STEP_TWO_ALLOCATIONS, STEP_TWO_SIMULATION } from '../../constants/onboardingData';

const StepTwo = () => {
  return (
    <div className="w-full flex flex-col lg:flex-row items-start gap-10 lg:gap-20 animate-fadeIn">
      {/* Kiri - Dashboard Ring */}
      <div className="flex-1 flex flex-col items-center lg:items-start w-full">
        <div className="relative w-40 h-40 md:w-48 md:h-48 group">
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-100 to-transparent rounded-full blur-xl group-hover:scale-110 transition-transform duration-500"></div>
          <svg className="w-full h-full -rotate-90 relative filter drop-shadow-md" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#E6F7F5" strokeWidth="12" />
            <circle cx="50" cy="50" r="40" fill="none" stroke="#006D77" strokeWidth="12" 
              strokeDasharray="251.3" strokeDashoffset="0" strokeLinecap="butt" />
            <circle cx="50" cy="50" r="40" fill="none" stroke="#2A9D8F" strokeWidth="12" 
              strokeDasharray="251.3" strokeDashoffset="-125.7" strokeLinecap="butt" />
            <circle cx="50" cy="50" r="40" fill="none" stroke="#80CED7" strokeWidth="12" 
              strokeDasharray="251.3" strokeDashoffset="-201.1" strokeLinecap="butt" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center bg-white/80 w-24 h-24 rounded-full flex flex-col items-center justify-center border border-white backdrop-blur-sm shadow-md">
              <span className="text-xl font-black text-slate-800 tracking-tighter">50/30/20</span>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Metode</p>
            </div>
          </div>
        </div>

        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 mt-6 mb-3 text-center lg:text-left tracking-tight">
          Alokasi Otomatis,<br className="hidden lg:block" /> Bebas Overspending
        </h2>
        <p className="text-sm text-slate-500 leading-relaxed text-center lg:text-left max-w-sm mb-6">
          Pendapatan Anda otomatis dibagi rapi demi masa depan finansial yang kokoh dan bebas stres.
        </p>

        <div className="w-full max-w-sm bg-white/70 border border-white backdrop-blur-md shadow-xl shadow-slate-100 rounded-3xl p-5">
          <div className="flex justify-between items-center mb-4">
            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">
              Simulasi Gaji Bulanan
            </p>
            <span className="bg-emerald-50 text-emerald-700 font-bold text-[11px] px-2.5 py-1 rounded-lg border border-emerald-100">Rp 5.000.000</span>
          </div>
          <div className="space-y-3.5">
            {STEP_TWO_SIMULATION.map(({ label, value, color, width }) => (
              <div key={label} className="group">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-500 font-medium">{label}</span>
                  <span className="font-bold text-slate-800">{value}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden p-[1.5px]">
                  <div className={`h-full ${color} ${width} rounded-full transition-all duration-1000 origin-left shadow-sm`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Kanan - Stacked Cards */}
      <div className="flex-1 w-full space-y-4">
        {STEP_TWO_ALLOCATIONS.map((item) => (
          <AllocationCard key={item.name} {...item} />
        ))}

        <div className="p-4.5 bg-gradient-to-r from-[#1E4D4A]/5 to-[#A3B18A]/10 border border-[#1E4D4A]/10 rounded-2xl relative overflow-hidden">
          <div className="absolute right-0 bottom-0 text-7xl opacity-5 pointer-events-none translate-x-4 translate-y-4">💡</div>
        </div>
      </div>
    </div>
  );
};

export default StepTwo;