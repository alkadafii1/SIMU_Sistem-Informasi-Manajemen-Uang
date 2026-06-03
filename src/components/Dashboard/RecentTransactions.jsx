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
}) => {
  return (
    <div className={`${cardBg} rounded-lg border ${borderColor} shadow-sm p-5`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className={`text-sm font-semibold ${textPrimary}`}>🕐 {t('recentTransactions')}</h3>
        <button onClick={onNavigate} className="text-xs font-medium text-[#00685f] hover:underline">
          {t('viewAll')}
        </button>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-6 text-gray-400 text-sm">
          <span className="material-symbols-outlined text-3xl mb-2">receipt</span>
          <p>{t('noTransactions')}</p>
          <button onClick={onAddTransaction} className="mt-2 text-[#00685f] underline text-xs">
            {t('firstTransaction')}
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {transactions.slice(0, 5).map((tx) => (
            <div
              key={tx.id}
              className={`flex items-center gap-3 py-2 border-b ${borderColor} last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all px-2 rounded-lg`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  tx.type === 'expense' ? 'bg-rose-50 dark:bg-rose-900/20' : 'bg-emerald-50 dark:bg-emerald-900/20'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-sm ${
                    tx.type === 'expense' ? 'text-rose-500' : 'text-emerald-600'
                  }`}
                >
                  {tx.type === 'expense' ? 'shopping_bag' : 'payments'}
                </span>
              </div>
              <div className="flex-1">
                <div className={`text-xs font-medium ${textPrimary}`}>{tx.description || tx.category}</div>
                <div className={`text-[9px] ${textSecondary}`}>
                  {tx.category} • {tx.date}
                </div>
              </div>
              <div className={`text-xs font-semibold ${tx.type === 'expense' ? 'text-rose-500' : 'text-emerald-600'}`}>
                {tx.type === 'expense' ? '-' : '+'} {formatRupiah(tx.amount)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentTransactions;