import React from 'react';

const WeeklyChart = ({ weeklyExpenses, weekDays, formatRupiah, cardBg, borderColor, textPrimary, t }) => {
  const maxWeekly = Math.max(...weeklyExpenses, 1);
  const weeklyHeights = weeklyExpenses.map((val) => (val / maxWeekly) * 60);

  return (
    <div className={`${cardBg} rounded-lg border ${borderColor} shadow-sm p-5`}>
      <h3 className={`text-sm font-semibold ${textPrimary} mb-4`}>📈 {t('weeklyExpenseTrend')}</h3>

      <div className="flex items-end justify-between gap-1 h-28">
        {weekDays.map((day, idx) => (
          <div key={day} className="flex flex-col items-center gap-1 flex-1 group">
            <div
              className="w-full bg-gradient-to-t from-[#006D77] to-[#2A9D8F] rounded-t-md transition-all duration-300 opacity-70 group-hover:opacity-100"
              style={{ height: `${weeklyHeights[idx]}px` }}
            ></div>
            <span className="text-[9px] font-medium text-gray-500">{day}</span>
            {weeklyExpenses[idx] > 0 && (
              <span className="text-[8px] text-gray-400 hidden group-hover:block">
                {formatRupiah(weeklyExpenses[idx])}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeeklyChart;