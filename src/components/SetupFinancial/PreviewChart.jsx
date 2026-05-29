import React from 'react';
import { ALLOCATION_COLORS } from '../../constants/setupData';

const PreviewChart = ({ 
  pctKebutuhan, 
  pctKeinginan, 
  pctTabungan, 
  kebutuhanNominal, 
  keinginanNominal, 
  tabunganNominal, 
  totalPercentage,
  formatRupiah 
}) => {
  return (
    <div className="bg-gradient-to-br from-white to-slate-50/50 rounded-2xl border border-slate-100 p-6 shadow-sm">
      
      <div className="text-center mb-6">
        <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Preview Alokasi Dana</h3>
      </div>

      {/* Donut Chart */}
      <div className="relative w-48 h-48 mx-auto mb-6">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#E8F0EE" strokeWidth="12" />
          <circle 
            cx="50" cy="50" r="40" fill="none" 
            stroke={ALLOCATION_COLORS.kebutuhan} strokeWidth="12" 
            strokeDasharray={`${pctKebutuhan * 2.513} 251.3`}
            strokeDashoffset="0"
            strokeLinecap="butt"
            className="transition-all duration-500"
          />
          <circle 
            cx="50" cy="50" r="40" fill="none" 
            stroke={ALLOCATION_COLORS.keinginan} strokeWidth="12" 
            strokeDasharray={`${pctKeinginan * 2.513} 251.3`}
            strokeDashoffset={`-${pctKebutuhan * 2.513}`}
            strokeLinecap="butt"
            className="transition-all duration-500"
          />
          <circle 
            cx="50" cy="50" r="40" fill="none" 
            stroke={ALLOCATION_COLORS.tabungan} strokeWidth="12" 
            strokeDasharray={`${pctTabungan * 2.513} 251.3`}
            strokeDashoffset={`-${(pctKebutuhan + pctKeinginan) * 2.513}`}
            strokeLinecap="butt"
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center bg-white w-24 h-24 rounded-full flex flex-col items-center justify-center shadow-md border border-slate-100">
            <span className="text-base font-black text-slate-800 tracking-tighter">
              {pctKebutuhan}/{pctKeinginan}/{pctTabungan}
            </span>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Rasio</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ALLOCATION_COLORS.kebutuhan }}></div>
            <span className="text-xs font-medium text-slate-600">Kebutuhan ({pctKebutuhan}%)</span>
          </div>
          <span className="text-sm font-bold text-slate-800">{formatRupiah(kebutuhanNominal)}</span>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ALLOCATION_COLORS.keinginan }}></div>
            <span className="text-xs font-medium text-slate-600">Keinginan ({pctKeinginan}%)</span>
          </div>
          <span className="text-sm font-bold text-slate-800">{formatRupiah(keinginanNominal)}</span>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ALLOCATION_COLORS.tabungan }}></div>
            <span className="text-xs font-medium text-slate-600">Tabungan ({pctTabungan}%)</span>
          </div>
          <span className="text-sm font-bold text-slate-800">{formatRupiah(tabunganNominal)}</span>
        </div>
      </div>

      {/* Progress Bar Overview */}
      <div className="p-3 bg-slate-50 rounded-xl">
        <div className="flex h-2 rounded-full overflow-hidden">
          <div className="bg-[#006D77]" style={{ width: `${pctKebutuhan}%` }}></div>
          <div className="bg-[#2A9D8F]" style={{ width: `${pctKeinginan}%` }}></div>
          <div className="bg-[#80CED7]" style={{ width: `${pctTabungan}%` }}></div>
        </div>
        <p className="text-[9px] text-slate-400 text-center mt-2">Total alokasi {totalPercentage}% dari pendapatan</p>
      </div>
    </div>
  );
};

export default PreviewChart;