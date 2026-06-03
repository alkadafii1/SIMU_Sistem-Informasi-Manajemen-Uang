import React from 'react';

const RecentTransactions = ({ transactions, formatRupiah, onNavigate, onAddTransaction, cardBg, borderColor, textPrimary, textSecondary, t, tc }) => {
  const getTransactionIcon = (type, category) => {
    if (type === 'income') return 'payments';
    // Expense icons based on category
    const expenseIcons = {
      'Makanan & Minuman': 'restaurant',
      'Belanja Harian': 'shopping_cart',
      'Transportasi': 'directions_car',
      'Tagihan & Utilitas': 'receipt',
      'Hiburan & Hobi': 'sports_esports',
      'Kesehatan': 'health_and_safety',
      'Pendidikan': 'school',
      'Investasi': 'trending_up',
    };
    return expenseIcons[category] || 'shopping_bag';
  };

  const getIconBgColor = (type) => {
    return type === 'expense' ? 'bg-rose-50 text-rose-500' : 'bg-teal-50 text-teal-700';
  };

  return (
    <div className={`${cardBg} rounded-lg border ${borderColor} shadow-sm p-4`}>
      <div className="flex justify-between items-center mb-3">
        <h3 className={`text-sm font-bold ${textPrimary}`}>{t('recentTransactions')}</h3>
        <button
          onClick={onNavigate}
          className="text-xs font-medium text-[#00685f] hover:underline"
        >
          {t('viewAll')}
        </button>
      </div>
      
      {transactions.length === 0 ? (
        <div className="text-center py-6">
          <span className="material-symbols-outlined text-3xl text-gray-300 mb-2">receipt_long</span>
          <p className={`text-xs ${textSecondary}`}>{t('noTransactions')}</p>
          <button
            onClick={onAddTransaction}
            className="mt-2 text-xs text-[#00685f] font-medium hover:underline"
          >
            + {t('recordTransaction')}
          </button>
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {transactions.slice(0, 5).map((tx) => {
            // Translate category name using tc function
            const translatedCategory = tc(tx.category, tx.type);
            const txType = tx.type === 'expense' ? t('expense') : t('income');
            
            return (
              <div key={tx.id} className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${getIconBgColor(tx.type)}`}>
                  <span className="material-symbols-outlined text-base">{getTransactionIcon(tx.type, tx.category)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-xs font-semibold ${textPrimary} truncate`}>{translatedCategory}</p>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                      {txType}
                    </span>
                  </div>
                  {tx.description && (
                    <p className={`text-[10px] ${textSecondary} truncate`}>{tx.description}</p>
                  )}
                  <p className={`text-[10px] ${textSecondary} mt-0.5`}>{tx.date}</p>
                </div>
                <p className={`text-xs font-bold flex-shrink-0 ${tx.type === 'expense' ? 'text-rose-500' : 'text-emerald-600'}`}>
                  {tx.type === 'expense' ? '-' : '+'}{formatRupiah(tx.amount)}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentTransactions;