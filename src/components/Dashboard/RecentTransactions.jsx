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
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const transactionDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    const diffTime = today - transactionDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hari ini';
    if (diffDays === 1) return 'Kemarin';
    if (diffDays <= 7) return `${diffDays} hari lalu`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getTransactionIcon = (type, category) => {
    if (type === 'income') return 'payments';
    if (category === 'Transfer ke Tabungan') return 'savings';
    if (category === 'Tarik dari Tabungan') return 'arrow_upward';
    
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

  // Warna background icon
  const getIconBgColor = (category, type) => {
    // Transfer ke Tabungan
    if (category === 'Transfer ke Tabungan') {
      return isDarkMode ? 'bg-rose-900/40 text-rose-400' : 'bg-rose-50 text-rose-500';
    }
    if (category === 'Tarik dari Tabungan') {
      return isDarkMode ? 'bg-amber-900/40 text-amber-400' : 'bg-amber-50 text-amber-600';
    }
    if (type === 'expense') {
      return isDarkMode ? 'bg-rose-900/40 text-rose-400' : 'bg-rose-50 text-rose-500';
    }
    return isDarkMode ? 'bg-teal-900/40 text-teal-400' : 'bg-teal-50 text-teal-700';
  };

  // Warna jumlah (nominal)
  const getAmountColor = (type, category) => {
    const isExpense = type === 'expense';
    const isTransfer = category === 'Transfer ke Tabungan';
    const isWithdraw = category === 'Tarik dari Tabungan';
    
    // Transfer ke Tabungan = MERAH (karena pengeluaran)
    if (isExpense || isTransfer) {
      return isDarkMode ? 'text-rose-400' : 'text-rose-600';
    }
    if (isWithdraw) {
      return isDarkMode ? 'text-amber-400' : 'text-amber-600';
    }
    return isDarkMode ? 'text-emerald-400' : 'text-emerald-600';
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
          <span className="material-symbols-outlined text-3xl text-gray-300 dark:text-gray-600 mb-2">receipt_long</span>
          <p className={`text-xs ${textSecondary}`}>{t('noTransactions')}</p>
          <button
            onClick={onAddTransaction}
            className="mt-2 text-xs text-[#00685f] font-medium hover:underline"
          >
            + {t('recordTransaction')}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.slice(0, 5).map((tx) => {
            const translatedCategory = tc(tx.category, tx.type);
            const dateLabel = formatDate(tx.date);
            const isTransferToSavings = tx.category === 'Transfer ke Tabungan';
            
            return (
              <div 
                key={tx.id} 
                className={`flex items-center gap-3 py-2 border-b ${borderColor} last:border-0 hover:${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg transition-all duration-150 -mx-2 px-2`}
              >
                {/* Icon */}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${getIconBgColor(tx.category, tx.type)}`}>
                  <span className="material-symbols-outlined text-base">{getTransactionIcon(tx.type, tx.category)}</span>
                </div>
                
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`text-xs font-semibold ${textPrimary} truncate max-w-[120px] sm:max-w-[180px]`}>{translatedCategory}</p>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                      {tx.type === 'expense' || isTransferToSavings ? t('expense') : t('income')}
                    </span>
                  </div>
                  {tx.description && (
                    <p className={`text-[10px] ${textSecondary} truncate mt-0.5`}>{tx.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[9px] ${textSecondary}`}>{dateLabel}</span>
                    <span className={`text-[9px] ${textSecondary}`}>•</span>
                    <span className={`text-[9px] ${textSecondary}`}>{tx.date}</span>
                  </div>
                </div>
                
                {/* Amount - Transfer ke Tabungan = MERAH */}
                <p className={`text-xs font-bold flex-shrink-0 ${getAmountColor(tx.type, tx.category)}`}>
                  {tx.type === 'expense' || isTransferToSavings ? '-' : '+'}{formatRupiah(tx.amount)}
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