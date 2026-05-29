import React from 'react';

const SummaryCards = ({
  totalIncome,
  totalExpense,
  savingsAchieved,
  income,
  savingsPercent,
  formatRupiah,
  cardBg,
  borderColor,
  textPrimary,
  textSecondary,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Card Pemasukan */}
      <div className={`${cardBg} rounded-lg border ${borderColor} shadow-sm p-5`}>
        <div className="flex items-center gap-2 text-gray-400 text-xs font-medium mb-2">
          <span className="material-symbols-outlined text-base">payments</span>
          TOTAL PEMASUKAN
        </div>
        <div className={`text-2xl font-bold ${textPrimary}`}>{formatRupiah(totalIncome)}</div>
        <div className="text-xs text-emerald-600 mt-1">
          +{formatRupiah(totalIncome - income)} dari transaksi
        </div>
      </div>

      {/* Card Pengeluaran */}
      <div className={`${cardBg} rounded-lg border ${borderColor} shadow-sm p-5`}>
        <div className="flex items-center gap-2 text-gray-400 text-xs font-medium mb-2">
          <span className="material-symbols-outlined text-base">shopping_bag</span>
          TOTAL PENGELUARAN
        </div>
        <div className={`text-2xl font-bold ${textPrimary}`}>{formatRupiah(totalExpense)}</div>
        <div className="text-xs text-amber-600 mt-1">
          Sisa: {formatRupiah(totalIncome - totalExpense)}
        </div>
      </div>

      {/* Card Tabungan */}
      <div className={`${cardBg} rounded-lg border ${borderColor} shadow-sm p-5`}>
        <div className="flex items-center gap-2 text-gray-400 text-xs font-medium mb-2">
          <span className="material-symbols-outlined text-base">savings</span>
          TABUNGAN
        </div>
        <div className={`text-2xl font-bold ${textPrimary}`}>{formatRupiah(Math.max(0, savingsAchieved))}</div>
        <div className="text-xs text-emerald-600 mt-1">
          {savingsPercent.toFixed(0)}% dari target
        </div>
      </div>
    </div>
  );
};

export default SummaryCards; 