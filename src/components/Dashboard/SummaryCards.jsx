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
  t 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className={`${cardBg} rounded-lg border ${borderColor} shadow-sm p-5`}>
        <div className="flex items-center gap-2 text-gray-400 text-xs font-medium mb-2">
          <span className="material-symbols-outlined text-base">payments</span>
          {t('totalIncome')}
        </div>
        <div className={`text-2xl font-bold ${textPrimary}`}>{formatRupiah(totalIncome)}</div>
      </div>
      
      <div className={`${cardBg} rounded-lg border ${borderColor} shadow-sm p-5`}>
        <div className="flex items-center gap-2 text-gray-400 text-xs font-medium mb-2">
          <span className="material-symbols-outlined text-base">shopping_bag</span>
          {t('totalExpense')}
        </div>
        <div className={`text-2xl font-bold ${textPrimary}`}>{formatRupiah(totalExpense)}</div>
        <div className="text-xs text-amber-600 mt-1">
          {t('remaining')}: {formatRupiah(income - totalExpense)}
        </div>
      </div>
      
      <div className={`${cardBg} rounded-lg border ${borderColor} shadow-sm p-5`}>
        <div className="flex items-center gap-2 text-gray-400 text-xs font-medium mb-2">
          <span className="material-symbols-outlined text-base">savings</span>
          {t('savings')}
        </div>
        <div className={`text-2xl font-bold ${textPrimary}`}>{formatRupiah(Math.max(0, savingsAchieved))}</div>
        <div className="text-xs text-emerald-600 mt-1">
          {savingsPercent.toFixed(0)}% {t('fromTarget')}
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;