import React from 'react';

const TopCategories = ({
  transactions,
  totalExpense,
  formatRupiah,
  onNavigate,
  cardBg,
  borderColor,
  textPrimary,
  textSecondary,
}) => {
  // Hitung pengeluaran per kategori
  const expenseByCategory = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const topCategories = Object.entries(expenseByCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const colors = ['#006D77', '#2A9D8F', '#80CED7'];

  return (
    <div className={`${cardBg} rounded-lg border ${borderColor} shadow-sm p-5`}>
      <h3 className={`text-sm font-semibold ${textPrimary} mb-4`}>📊 Kategori Pengeluaran Terbesar</h3>

      {topCategories.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">
          <span className="material-symbols-outlined text-3xl mb-2">receipt_long</span>
          <p>Belum ada transaksi</p>
          <button onClick={onNavigate} className="mt-2 text-[#00685f] underline text-xs">
            Catat transaksi pertama
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {topCategories.map(([category, amount], idx) => {
            const percent = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;
            return (
              <div key={category}>
                <div className="flex justify-between text-xs mb-1">
                  <span className={textSecondary}>{category}</span>
                  <span className={`font-semibold ${textPrimary}`}>
                    {formatRupiah(amount)} ({Math.round(percent)}%)
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${percent}%`, backgroundColor: colors[idx % colors.length] }}
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