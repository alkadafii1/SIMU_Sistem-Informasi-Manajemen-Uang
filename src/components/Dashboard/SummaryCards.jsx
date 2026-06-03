import React from 'react';

const SummaryCards = ({ 
  totalIncome, 
  totalExpense, 
  activeBalance,
  savingsBalance,
  income, 
  savingsPercent, 
  formatRupiah, 
  cardBg, 
  borderColor, 
  textPrimary, 
  textSecondary,
  t,
  onNavigateToGoals,
  isDarkMode
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Kartu Total Pemasukan */}
      <div className={`${cardBg} rounded-lg border ${borderColor} shadow-sm p-4`}>
        <div className="flex items-center gap-2 text-gray-400 text-xs font-medium mb-2">
          <span className="material-symbols-outlined text-base text-emerald-500">arrow_upward</span>
          <span className={`text-xs ${textSecondary}`}>Total Pemasukan</span>
        </div>
        <div className={`text-xl font-bold text-emerald-600 dark:text-emerald-400`}>
          {formatRupiah(totalIncome)}
        </div>
        <div className={`text-[10px] ${textSecondary} mt-1`}>Total pemasukan bulan ini</div>
      </div>
      
      {/* Kartu Total Pengeluaran */}
      <div className={`${cardBg} rounded-lg border ${borderColor} shadow-sm p-4`}>
        <div className="flex items-center gap-2 text-gray-400 text-xs font-medium mb-2">
          <span className="material-symbols-outlined text-base text-rose-500">arrow_downward</span>
          <span className={`text-xs ${textSecondary}`}>Total Pengeluaran</span>
        </div>
        <div className={`text-xl font-bold text-rose-600 dark:text-rose-400`}>
          {formatRupiah(totalExpense)}
        </div>
        <div className={`text-[10px] ${textSecondary} mt-1`}>Total pengeluaran bulan ini</div>
      </div>
      
      {/* Kartu Saldo Aktif */}
      <div className={`${cardBg} rounded-lg border ${borderColor} shadow-sm p-4 ${activeBalance < 0 ? (isDarkMode ? 'bg-rose-900/20 border-rose-800' : 'bg-rose-50 border-rose-200') : ''}`}>
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-base text-blue-500">account_balance_wallet</span>
          <span className={`text-xs ${textSecondary}`}>Saldo Aktif</span>
        </div>
        <div className={`text-xl font-bold ${activeBalance < 0 ? 'text-rose-600 dark:text-rose-400' : textPrimary}`}>
          {formatRupiah(activeBalance)}
        </div>
        <div className={`text-[10px] ${textSecondary} mt-1`}>Sisa uang untuk kebutuhan sehari-hari</div>
        {activeBalance < 0 && (
          <div className="text-[10px] text-rose-600 dark:text-rose-400 mt-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">warning</span>
            Saldo negatif! Kurangi pengeluaran.
          </div>
        )}
      </div>
      
      {/* Kartu Saldo Tabungan */}
      <div className={`${cardBg} rounded-lg border ${borderColor} shadow-sm p-4 cursor-pointer hover:shadow-md transition-all`} onClick={onNavigateToGoals}>
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-base text-emerald-500">savings</span>
          <span className={`text-xs ${textSecondary}`}>Saldo Tabungan</span>
        </div>
        <div className={`text-xl font-bold text-emerald-600 dark:text-emerald-400`}>
          {formatRupiah(savingsBalance)}
        </div>
        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">
          {Math.round(savingsPercent)}% dari target
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;