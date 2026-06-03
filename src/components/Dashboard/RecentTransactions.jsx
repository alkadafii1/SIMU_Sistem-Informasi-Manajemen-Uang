import React from 'react';

const RecentTransactions = ({ 
  transactions, 
  formatRupiah, 
  onNavigate, 
  onAddTransaction, 
  cardBg, 
  borderColor, 
  textPrimary, 
  textSecondary, 
  t, 
  tc,
  isDarkMode = false
}) => {
  const getTransactionIcon = (type, category) => {
    if (type === 'income') return 'payments';
    const expenseIcons = {
      'Makanan & Minuman': 'restaurant',
      'Belanja Harian': 'shopping_cart',
      'Transportasi': 'directions_car',
      'Tagihan & Utilitas': 'receipt',
      'Hiburan & Hobi': 'sports_esports',
      'Kesehatan': 'health_and_safety',
      'Pendidikan': 'school',
      'Investasi': 'trending_up',
      'Transfer ke Tabungan': 'savings',
      'Tarik dari Tabungan': 'arrow_upward',
    };
    return expenseIcons[category] || 'shopping_bag';
  };

  const getIconBgColor = (type, category) => {
    if (category === 'Transfer ke Tabungan') {
      return isDarkMode ? 'bg-emerald-900/40 text-emerald-400' : 'bg-emerald-50 text-emerald-600';
    }
    if (category === 'Tarik dari Tabungan') {
      return isDarkMode ? 'bg-amber-900/40 text-amber-400' : 'bg-amber-50 text-amber-600';
    }
    if (type === 'expense') {
      return isDarkMode ? 'bg-rose-900/40 text-rose-400' : 'bg-rose-50 text-rose-500';
    }
    return isDarkMode ? 'bg-teal-900/40 text-teal-400' : 'bg-teal-50 text-teal-700';
  };

  const getAmountColor = (type, category) => {
    const isExpense = type === 'expense';
    const isTransfer = category === 'Transfer ke Tabungan';
    const isWithdraw = category === 'Tarik dari Tabungan';
    
    if (isExpense && !isTransfer && !isWithdraw) {
      return isDarkMode ? 'text-rose-400' : 'text-rose-600';
    }
    if (isTransfer) {
      return isDarkMode ? 'text-emerald-400' : 'text-emerald-600';
    }
    if (isWithdraw) {
      return isDarkMode ? 'text-amber-400' : 'text-amber-600';
    }
    return isDarkMode ? 'text-emerald-400' : 'text-emerald-600';
  };

  // Tentukan background card berdasarkan mode
  const getCardBg = () => {
    if (isDarkMode) {
      return 'bg-gray-800';
    }
    return 'bg-white';
  };

  // Tentukan warna border berdasarkan mode
  const getBorderColor = () => {
    if (isDarkMode) {
      return 'border-gray-700';
    }
    return 'border-gray-200';
  };

  // Tentukan warna teks primary
  const getTextPrimary = () => {
    if (isDarkMode) {
      return 'text-white';
    }
    return 'text-gray-900';
  };

  // Tentukan warna teks secondary
  const getTextSecondary = () => {
    if (isDarkMode) {
      return 'text-gray-400';
    }
    return 'text-gray-500';
  };

  return (
    <div className={`${getCardBg()} rounded-lg border ${getBorderColor()} shadow-sm p-4`}>
      <div className="flex justify-between items-center mb-3">
        <h3 className={`text-sm font-bold ${getTextPrimary()}`}>{t('recentTransactions')}</h3>
        <button
          onClick={onNavigate}
          className="text-xs font-medium text-[#00685f] hover:underline"
        >
          {t('viewAll')}
        </button>
      </div>
      
      {transactions.length === 0 ? (
        <div className="text-center py-6">
          <span className="material-symbols-outlined text-3xl text-gray-300 dark:text-gray-600 mb-2">receipt_long</span>
          <p className={`text-xs ${getTextSecondary()}`}>{t('noTransactions')}</p>
          <button
            onClick={onAddTransaction}
            className="mt-2 text-xs text-[#00685f] font-medium hover:underline"
          >
            + {t('recordTransaction')}
          </button>
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
          {transactions.slice(0, 5).map((tx) => {
            const translatedCategory = tc(tx.category, tx.type);
            const txType = tx.type === 'expense' ? t('expense') : t('income');
            
            return (
              <div 
                key={tx.id} 
                className={`flex items-center gap-3 py-2 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'} last:border-0 hover:${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg transition-colors duration-150 -mx-2 px-2`}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${getIconBgColor(tx.type, tx.category)}`}>
                  <span className="material-symbols-outlined text-base">{getTransactionIcon(tx.type, tx.category)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`text-xs font-semibold ${getTextPrimary()} truncate max-w-[120px] sm:max-w-[180px]`}>{translatedCategory}</p>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                      {txType}
                    </span>
                  </div>
                  {tx.description && (
                    <p className={`text-[10px] ${getTextSecondary()} truncate mt-0.5`}>{tx.description}</p>
                  )}
                  <p className={`text-[9px] ${getTextSecondary()} mt-0.5`}>{tx.date}</p>
                </div>
                <p className={`text-xs font-bold flex-shrink-0 ${getAmountColor(tx.type, tx.category)}`}>
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