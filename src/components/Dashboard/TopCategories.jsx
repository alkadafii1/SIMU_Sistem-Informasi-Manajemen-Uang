import React from 'react';

const TopCategories = ({ 
  categoryTotals = [],  // ← GANTI: terima categoryTotals dari props
  totalExpense, 
  formatRupiah, 
  onNavigate, 
  cardBg, 
  borderColor, 
  textPrimary, 
  textSecondary, 
  t, 
  tc 
}) => {
  // Ambil 3 kategori terbesar dari categoryTotals yang sudah diurutkan backend
  const topCategories = categoryTotals.slice(0, 3);
  
  const categoryColors = ['#00685f', '#66b5ad', '#b3d9d5'];

  return (
    <div className={`${cardBg} rounded-lg border ${borderColor} shadow-sm p-4`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className={`text-sm font-bold ${textPrimary}`}>{t('topExpenseCategories')}</h3>
        <button
          onClick={onNavigate}
          className="text-xs font-medium text-[#00685f] hover:underline"
        >
          + {t('recordTransaction')}
        </button>
      </div>
      
      {topCategories.length === 0 ? (
        <div className="text-center py-6">
          <span className="material-symbols-outlined text-3xl text-gray-300 mb-2">category</span>
          <p className={`text-xs ${textSecondary}`}>{t('noTransactions')}</p>
          <button
            onClick={onNavigate}
            className="mt-2 text-xs text-[#00685f] font-medium hover:underline"
          >
            + {t('recordTransaction')}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {topCategories.map((cat, idx) => {
            const percent = totalExpense > 0 ? (cat.amount / totalExpense) * 100 : 0;
            // Translate category name using tc function
            const translatedCategory = tc(cat.name, 'expense');
            return (
              <div key={cat.name}>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: categoryColors[idx % categoryColors.length] }}></span>
                    <span className={textPrimary}>{translatedCategory}</span>
                  </div>
                  <span className={`text-xs font-bold ${textPrimary}`}>
                    {formatRupiah(cat.amount)} ({Math.round(percent)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-[#00685f] h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(percent, 100)}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TopCategories;