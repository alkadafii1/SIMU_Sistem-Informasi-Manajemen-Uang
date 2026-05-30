import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDashboardData } from '../hooks/dashboard/useDashboardData';
import { useAIPrediction } from '../hooks/dashboard/useAIPrediction';
import { usePopup } from '../hooks/dashboard/usePopup';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { formatRupiah } from '../utils/format';
import { getGreeting } from '../utils/dashboard/greeting';
import { getStatusColor, getStatusIcon, getStatusText } from '../utils/dashboard/aiHelpers';
import { NEEDS_CATEGORIES, WANTS_CATEGORIES, WEEK_DAYS } from '../constants/categories';

// Import components
import Sidebar from '../components/Sidebar';
import SummaryCards from '../components/Dashboard/SummaryCards';
import AICard from '../components/Dashboard/AICard';
import AllocationChart from '../components/Dashboard/AllocationChart';
import TopCategories from '../components/Dashboard/TopCategories';
import WeeklyChart from '../components/Dashboard/WeeklyChart';
import RecentTransactions from '../components/Dashboard/RecentTransactions';

function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Custom hooks
  const { setup, transactions, loading, dailyBudget, weeklyExpenses } = useDashboardData(navigate);
  const { prediction: aiPrediction, loading: aiLoading, error: aiError, fetchPrediction, refreshPrediction } = useAIPrediction();
  const { showPopup: showWelcomePopup, progress: popupProgress, closePopup } = usePopup(location);
  const { isDarkMode, bgColor, cardBg, borderColor, textPrimary, textSecondary } = useThemeStyles();
  
  // Ref untuk mencegah multiple fetch
  const aiFetchedRef = useRef(false);

  // User data dari localStorage
  const userData = {
    name: localStorage.getItem('user_name') || 'Pengguna',
    email: localStorage.getItem('user_email') || 'email@example.com',
  };
  const userAvatar = localStorage.getItem('user_avatar');
  const userInitial = userData.name.charAt(0).toUpperCase();

  // Fetch AI prediction only once when setup is ready
  useEffect(() => {
    if (setup?.income && !aiPrediction && !aiLoading && !aiFetchedRef.current) {
      aiFetchedRef.current = true;
      const userId = localStorage.getItem('user_id');
      fetchPrediction(setup.income, userId ? parseInt(userId) : 1, transactions);
    }
  }, [setup?.income, aiPrediction, aiLoading, fetchPrediction, transactions]);

  if (loading) {
    return (
      <div className={`min-h-screen ${bgColor} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#00685f]"></div>
      </div>
    );
  }

  if (!setup) return null;

  // Calculations
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalEffectiveIncome = setup.income + totalIncome;
  const savingsAchieved = totalEffectiveIncome - totalExpense;

  const budgetNeeds = (setup.income * setup.allocation.kebutuhan) / 100;
  const budgetWants = (setup.income * setup.allocation.keinginan) / 100;
  const budgetSavings = (setup.income * setup.allocation.tabungan) / 100;

  const totalExpenseNeeds = transactions
    .filter(t => t.type === 'expense' && NEEDS_CATEGORIES.includes(t.category))
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenseWants = transactions
    .filter(t => t.type === 'expense' && WANTS_CATEGORIES.includes(t.category))
    .reduce((sum, t) => sum + t.amount, 0);

  const needsUsedPercent = budgetNeeds > 0 ? (totalExpenseNeeds / budgetNeeds) * 100 : 0;
  const wantsUsedPercent = budgetWants > 0 ? (totalExpenseWants / budgetWants) * 100 : 0;
  const savingsPercent = budgetSavings > 0 ? (savingsAchieved / budgetSavings) * 100 : 0;

  return (
    <div className={`min-h-screen ${bgColor}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          vertical-align: middle;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        @keyframes slideDown {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-slideDown { animation: slideDown 0.3s ease-out forwards; }
      `}</style>

      {/* Welcome Popup */}
      {showWelcomePopup && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm animate-slideDown">
          <div className="bg-white rounded-xl shadow-2xl border border-emerald-100 overflow-hidden">
            <div className="h-1 bg-emerald-100">
              <div className="h-full bg-emerald-500 transition-all duration-50 ease-linear" style={{ width: `${popupProgress}%` }}></div>
            </div>
            <div className="p-4 flex items-start gap-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-emerald-500">check_circle</span>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-gray-800">Strategi Finansial Berhasil!</h4>
                <p className="text-xs text-gray-500 mt-0.5">Alokasi anggaranmu telah diterapkan. Yuk mulai catat transaksi!</p>
              </div>
              <button onClick={closePopup} className="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex h-screen overflow-hidden">
        <Sidebar userData={userData} userAvatar={userAvatar} userInitial={userInitial} />

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className={`${cardBg} border-b ${borderColor} px-6 py-4 sticky top-0 z-10 flex-shrink-0`}>
            <div className="flex justify-between items-center">
              <div>
                <h1 className={`text-xl font-bold ${textPrimary}`}>{getGreeting(userData.name)}</h1>
                <p className={`text-xs ${textSecondary} mt-0.5`}>Yuk kelola keuanganmu hari ini!</p>
              </div>
              <button onClick={() => navigate('/transaction')} className="flex items-center gap-2 bg-[#00685f] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#005049] transition-all">
                <span className="material-symbols-outlined text-sm">add</span>
                Catat Transaksi
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 no-scrollbar">
            <SummaryCards
              totalIncome={totalEffectiveIncome}
              totalExpense={totalExpense}
              savingsAchieved={savingsAchieved}
              income={setup.income}
              savingsPercent={savingsPercent}
              formatRupiah={formatRupiah}
              cardBg={cardBg}
              borderColor={borderColor}
              textPrimary={textPrimary}
              textSecondary={textSecondary}
            />

            <AICard
              prediction={aiPrediction}
              loading={aiLoading}
              error={aiError}
              onRefresh={() => refreshPrediction(setup.income)}
              getStatusColor={getStatusColor}
              getStatusIcon={getStatusIcon}
              getStatusText={getStatusText}
              formatRupiah={formatRupiah}
              isDarkMode={isDarkMode}
              cardBg={cardBg}
              borderColor={borderColor}
              textPrimary={textPrimary}
              textSecondary={textSecondary}
            />

            <div className={`${cardBg} rounded-lg border ${borderColor} shadow-sm p-4 flex items-center gap-3`}>
              <div className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-white">lightbulb</span>
              </div>
              <div>
                <div className="text-[10px] font-medium text-amber-600 uppercase tracking-wide">💡 Rekomendasi Harian</div>
                <div className={`text-sm font-semibold ${textPrimary}`}>
                  Batas belanja hari ini: <span className="text-[#00685f]">{formatRupiah(Math.max(0, dailyBudget))}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <AllocationChart
                pctKebutuhan={setup.allocation.kebutuhan}
                pctKeinginan={setup.allocation.keinginan}
                pctTabungan={setup.allocation.tabungan}
                needsUsedPercent={needsUsedPercent}
                wantsUsedPercent={wantsUsedPercent}
                savingsPercent={savingsPercent}
                totalExpenseNeeds={totalExpenseNeeds}
                totalExpenseWants={totalExpenseWants}
                savingsAchieved={savingsAchieved}
                budgetNeeds={budgetNeeds}
                budgetWants={budgetWants}
                budgetSavings={budgetSavings}
                formatRupiah={formatRupiah}
                onNavigate={() => navigate('/setup-financial')}
                cardBg={cardBg}
                borderColor={borderColor}
                textPrimary={textPrimary}
                textSecondary={textSecondary}
              />

              <TopCategories
                transactions={transactions}
                totalExpense={totalExpense}
                formatRupiah={formatRupiah}
                onNavigate={() => navigate('/transaction')}
                cardBg={cardBg}
                borderColor={borderColor}
                textPrimary={textPrimary}
                textSecondary={textSecondary}
              />
            </div>

            <WeeklyChart
              weeklyExpenses={weeklyExpenses}
              weekDays={WEEK_DAYS}
              formatRupiah={formatRupiah}
              cardBg={cardBg}
              borderColor={borderColor}
              textPrimary={textPrimary}
            />

            <RecentTransactions
              transactions={transactions}
              formatRupiah={formatRupiah}
              onNavigate={() => navigate('/history')}
              onAddTransaction={() => navigate('/transaction')}
              cardBg={cardBg}
              borderColor={borderColor}
              textPrimary={textPrimary}
              textSecondary={textSecondary}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;