import React from 'react';
import IconRenderer from './IconRenderer';
import { STEP_ONE_FEATURES } from '../../constants/onboardingData';

const StepOne = () => {
  return (
    <div className="w-full flex flex-col lg:flex-row items-center gap-10 lg:gap-20 animate-fadeIn">
      <div className="flex-1 flex justify-center relative">
        <div className="absolute w-72 h-72 bg-gradient-to-tr from-[#1E4D4A]/10 to-transparent rounded-full blur-3xl -top-10"></div>
        <div className="relative w-64 h-64 md:w-80 md:h-80">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#E0EBE9] to-[#D4E4E1] rounded-[48px] rotate-6 shadow-xl shadow-[#1E4D4A]/5"></div>
          <div className="absolute inset-0 bg-white/40 border border-white/60 backdrop-blur-md rounded-[48px] -rotate-3 opacity-80 shadow-inner"></div>
          
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-44 h-28 md:w-56 md:h-36 bg-gradient-to-br from-[#2D5A53] to-[#1E4D4A] rounded-3xl border-4 border-white shadow-2xl relative flex flex-col justify-between p-4 text-white hover:rotate-0 transition-transform duration-500 cursor-pointer">
              <div className="flex justify-between items-start">
                <div className="space-y-1.5">
                  <div className="h-1.5 w-12 bg-white/40 rounded-full"></div>
                  <div className="h-1.5 w-8 bg-white/20 rounded-full"></div>
                </div>
                <span className="text-lg">💳</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-mono tracking-wider opacity-60">**** 4829</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Teks Editorial */}
      <div className="flex-1 text-center lg:text-left max-w-md w-full">
        <div className="inline-flex items-center gap-2 bg-[#1E4D4A]/10 text-[#1E4D4A] text-xs font-bold px-3.5 py-2 rounded-full mb-5 shadow-sm border border-[#1E4D4A]/5">
          <span className="w-2 h-2 bg-[#1E4D4A] rounded-full animate-pulse"></span>
          Financial Freedom Start Here
        </div>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-800 mb-4 leading-tight tracking-tight">
          Kuasai Uangmu Bersama <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1E4D4A] to-[#4b807c]">SIMU</span>
        </h2>
        <p className="text-sm md:text-base text-slate-500 leading-relaxed mb-8 font-medium">
          Asisten finansial pintar yang membantu Anda mencatat log harian, mengalokasikan anggaran otomatis, hingga menganalisis kesehatan keuangan dengan teknologi AI.
        </p>

        <div className="space-y-2.5 bg-slate-50/50 p-3 rounded-3xl border border-slate-100/50">
          {STEP_ONE_FEATURES.map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-3.5 text-left bg-white p-3 rounded-2xl shadow-sm border border-slate-100/40">
              <div className="w-9 h-9 bg-[#E0EBE9] rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner">
                <IconRenderer icon={icon} className="w-5 h-5" />
              </div>
              <span className="text-sm font-semibold text-slate-600">{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StepOne;