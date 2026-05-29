import React, { useState, useEffect } from 'react';

const IncomeInput = ({ income, setIncome }) => {
  const [displayValue, setDisplayValue] = useState('');

  // Format angka ke format Rupiah untuk display
  const formatRupiahDisplay = (value) => {
    if (value === 0 || value === '') return '';
    return new Intl.NumberFormat('id-ID').format(value);
  };

  // Parse dari format Rupiah ke angka
  const parseRupiah = (value) => {
    return parseInt(value.replace(/[^0-9]/g, '')) || 0;
  };

  useEffect(() => {
    setDisplayValue(formatRupiahDisplay(income));
  }, [income]);

  const handleChange = (e) => {
    const rawValue = e.target.value;
    const numberValue = parseRupiah(rawValue);
    setDisplayValue(formatRupiahDisplay(numberValue));
    setIncome(numberValue);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-3">
        <span className="material-symbols-outlined text-base text-[#1E4D4A]">payments</span>
        Total Pendapatan Bersih Bulanan
      </label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">Rp</span>
        <input 
          type="text"
          value={displayValue}
          onChange={handleChange}
          placeholder="0"
          className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-base font-bold text-slate-800 focus:outline-none focus:border-[#1E4D4A] focus:bg-white transition-all"
        />
      </div>
      <p className="text-xs text-slate-400 mt-2">
        Masukkan total pendapatan bersih per bulan, contoh: 5.000.000
      </p>
    </div>
  );
};

export default IncomeInput;