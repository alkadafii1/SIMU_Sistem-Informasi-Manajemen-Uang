import React from 'react';

const AllocationChart = ({
  pctKebutuhan,
  pctKeinginan,
  pctTabungan,
  needsUsedPercent,
  wantsUsedPercent,
  savingsPercent,
  totalExpenseNeeds,
  totalExpenseWants,
  savingsAchieved,
  budgetNeeds,
  budgetWants,
  budgetSavings,
  formatRupiah,
  onNavigate,
  cardBg,
  borderColor,
  textPrimary,
  textSecondary,
}) => {
  return (
    <div className={`${cardBg} rounded-lg border ${borderColor} shadow-sm p-5`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className={`text-sm font-semibold ${textPrimary}`}>Alokasi Anggaran</h3>
        <button onClick={onNavigate} className="text-xs text-[#00685f] hover:text-[#005049] font-medium">
          Atur Ulang
        </button>
      </div>

      <div className="flex flex-col items-center">
        {/* Donut Chart */}
        <div className="relative w-32 h-32 mb-4">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#E8F0EE" strokeWidth="10" />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#006D77"
              strokeWidth="10"
              strokeDasharray={`${pctKebutuhan * 2.513} 251.3`}
              strokeDashoffset="0"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#2A9D8F"
              strokeWidth="10"
              strokeDasharray={`${pctKeinginan * 2.513} 251.3`}
              strokeDashoffset={`-${pctKebutuhan * 2.513}`}
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#80CED7"
              strokeWidth="10"
              strokeDasharray={`${pctTabungan * 2.513} 251.3`}
              strokeDashoffset={`-${(pctKebutuhan + pctKeinginan) * 2.513}`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-[9px] text-gray-400">Rasio</div>
              <div className={`text-sm font-bold ${textPrimary}`}>
                {pctKebutuhan}/{pctKeinginan}/{pctTabungan}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bars */}
        <div className="w-full space-y-3">
          {/* Kebutuhan */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className={textSecondary}>Kebutuhan ({pctKebutuhan}%)</span>
              <span className="font-semibold text-[#006D77]">{Math.min(100, Math.round(needsUsedPercent))}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#006D77] rounded-full"
                style={{ width: `${Math.min(100, needsUsedPercent)}%` }}
              ></div>
            </div>
            <div className={`text-[10px] ${textSecondary} mt-0.5`}>
              {formatRupiah(totalExpenseNeeds)} / {formatRupiah(budgetNeeds)}
            </div>
          </div>

          {/* Keinginan */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className={textSecondary}>Keinginan ({pctKeinginan}%)</span>
              <span className="font-semibold text-[#2A9D8F]">{Math.min(100, Math.round(wantsUsedPercent))}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#2A9D8F] rounded-full"
                style={{ width: `${Math.min(100, wantsUsedPercent)}%` }}
              ></div>
            </div>
            <div className={`text-[10px] ${textSecondary} mt-0.5`}>
              {formatRupiah(totalExpenseWants)} / {formatRupiah(budgetWants)}
            </div>
          </div>

          {/* Tabungan */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className={textSecondary}>Tabungan ({pctTabungan}%)</span>
              <span className="font-semibold text-[#80CED7]">{Math.min(100, Math.round(savingsPercent))}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#80CED7] rounded-full"
                style={{ width: `${Math.min(100, savingsPercent)}%` }}
              ></div>
            </div>
            <div className={`text-[10px] ${textSecondary} mt-0.5`}>
              {formatRupiah(Math.max(0, savingsAchieved))} / {formatRupiah(budgetSavings)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllocationChart;