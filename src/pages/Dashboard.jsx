import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDashboardData } from '../hooks/dashboard/useDashboardData';
import { useAIPrediction } from '../hooks/dashboard/useAIPrediction';
import { usePopup } from '../hooks/dashboard/usePopup';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { useLanguage } from '../context/LanguageContext';
import { formatRupiah } from '../utils/format';
import { getGreeting } from '../utils/dashboard/greeting';
import { getStatusColor, getStatusIcon, getStatusText } from '../utils/dashboard/aiHelpers';
import { NEEDS_CATEGORIES, WANTS_CATEGORIES, WEEK_DAYS } from '../constants/categories';
import { GOALS_OPTIONS } from '../constants/setupData';
import useOnlineStatus from '../hooks/dashboard/useOnlineStatus';
import GoalsCard from '../components/Dashboard/GoalsCard';
import Spinner from '../components/Spinner';
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
  
  const { setup, transactions, loading, dailyBudget, weeklyExpenses, refetchData } = useDashboardData(navigate);
  const { prediction: aiPrediction, loading: aiLoading, error: aiError, fetchPrediction, refreshPrediction } = useAIPrediction();
  const { showPopup: showWelcomePopup, progress: popupProgress, closePopup } = usePopup(location);
  const { isDarkMode, bgColor, cardBg, borderColor, textPrimary, textSecondary } = useThemeStyles();
  const { t, tc } = useLanguage();
  const isOnline = useOnlineStatus();
  
  const [dashboardKey, setDashboardKey] = useState(0);
  const aiFetchedRef = useRef(false);

  const userData = {
    name: localStorage.getItem('user_name') || 'Pengguna',
    email: localStorage.getItem('user_email') || 'email@example.com',
  };
  const userAvatar = localStorage.getItem('user_avatar');
  const userInitial = userData.name.charAt(0).toUpperCase();

  const handleRefresh = useCallback(async () => {
    console.log('🔄 [Dashboard] Refreshing...');
    setDashboardKey(prev => prev + 1);
    const result = await refetchData();
    console.log('✅ [Dashboard] Refresh done');
    return result;
  }, [refetchData]);

  useEffect(() => {
    if (location.state?.refresh) {
      handleRefresh();
      navigate('/dashboard', { replace: true, state: {} });
    }
  }, [location.state, navigate, handleRefresh]);

  useEffect(() => {
    if (setup?.income && !aiPrediction && !aiLoading && !aiFetchedRef.current) {
      aiFetchedRef.current = true;
      const userId = localStorage.getItem('user_id');
      fetchPrediction(setup.income, userId ? parseInt(userId) : 1, transactions);
    }
  }, [setup?.income, aiPrediction, aiLoading, fetchPrediction, transactions]);

  if (loading && dashboardKey === 0) {
    return <Spinner fullScreen text="Memuat dashboard..." />;
  }

  if (!setup) return null;

  // ========== HITUNG SALDO DASAR ==========
  const totalIncome = transactions
    .filter(t => t.type === 'income' && t.category !== 'Tarik dari Tabungan')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpense = transactions
    .filter(t => t.type === 'expense' && t.category !== 'Transfer ke Tabungan')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const savingsTransfers = transactions
    .filter(t => t.category === 'Transfer ke Tabungan')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const savingsWithdraws = transactions
    .filter(t => t.category === 'Tarik dari Tabungan')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const savingsBalance = savingsTransfers - savingsWithdraws;
  const activeBalance = (setup.income + totalIncome + savingsWithdraws) - (totalExpense + savingsTransfers);
  
  // ========== HITUNG UNALLOCATED SAVINGS ==========
  const allTransferToSavings = transactions.filter(t => 
    t.type === 'expense' && t.category === 'Transfer ke Tabungan'
  );
  
  const allocationsToGoals = allTransferToSavings.filter(t => 
    t.description && (t.description.includes('Alokasi dari Tabungan Umum ke') || t.description.startsWith('TRANSFER_GOAL:'))
  );
  
  const topUpToGeneral = allTransferToSavings.filter(t => 
    !(t.description && (t.description.includes('Alokasi dari Tabungan Umum ke') || t.description.startsWith('TRANSFER_GOAL:')))
  );
  
  const allWithdrawals = transactions.filter(t => 
    t.type === 'income' && t.category === 'Tarik dari Tabungan'
  );
  
  const withdrawFromGeneral = allWithdrawals.filter(t => 
    t.description === 'WITHDRAW_GENERAL'
  );
  
  const totalTopUpToGeneral = topUpToGeneral.reduce((sum, t) => sum + t.amount, 0);
  const totalAllocatedToGoals = allocationsToGoals.reduce((sum, t) => sum + t.amount, 0);
  const totalWithdrawFromGeneral = withdrawFromGeneral.reduce((sum, t) => sum + t.amount, 0);
  
  const unallocatedSavings = Math.max(0, totalTopUpToGeneral - totalWithdrawFromGeneral);
  
  // ========== HITUNG SAVINGS PER GOAL ==========
  const savingsByGoal = {};
  const selectedGoalIds = (setup.goals || []).filter(g => g.isSelected).map(g => g.id);
  
  selectedGoalIds.forEach(goalId => {
    savingsByGoal[goalId] = 0;
  });
  
  // Proses alokasi ke target
  allocationsToGoals.forEach(tx => {
    const description = tx.description || '';
    const amount = tx.amount;
    
    // Cek format TRANSFER_GOAL:xxx
    if (description.startsWith('TRANSFER_GOAL:')) {
      const parts = description.split(':');
      const goalId = parts[1];
      if (selectedGoalIds.includes(goalId)) {
        savingsByGoal[goalId] = (savingsByGoal[goalId] || 0) + amount;
        console.log(`✅ Target ${goalId} mendapat TRANSFER_GOAL: +${amount}`);
      }
    }
    // Cek format Alokasi dari Tabungan Umum ke
    else if (description.includes('Alokasi dari Tabungan Umum ke')) {
      for (const goalId of selectedGoalIds) {
        const goalInfo = GOALS_OPTIONS.find(g => g.id === goalId);
        const goalLabel = goalInfo?.label || goalId;
        if (description.includes(goalLabel)) {
          savingsByGoal[goalId] = (savingsByGoal[goalId] || 0) + amount;
          console.log(`✅ Target ${goalLabel} mendapat alokasi: +${amount}`);
          break;
        }
      }
    }
  });
  
  // Proses penarikan dari target
  allWithdrawals.forEach(tx => {
    const description = tx.description || '';
    if (description.startsWith('WITHDRAW_GOAL:')) {
      const parts = description.split(':');
      const goalId = parts[1];
      const amount = tx.amount;
      if (selectedGoalIds.includes(goalId)) {
        savingsByGoal[goalId] = Math.max(0, (savingsByGoal[goalId] || 0) - amount);
        console.log(`✅ Target ${goalId} ditarik: -${amount}`);
      }
    }
  });
  
  const goalsData = (setup.goals || [])
    .filter(goal => goal.isSelected)
    .map(goal => {
      const originalGoal = GOALS_OPTIONS.find(g => g.id === goal.id);
      const savedAmount = savingsByGoal[goal.id] || 0;
      const targetAmount = goal.target || originalGoal?.defaultTarget || 100000000;
      const progress = targetAmount > 0 ? (savedAmount / targetAmount) * 100 : 0;
      
      return {
        id: goal.id,
        label: originalGoal?.label || goal.label || goal.id,
        icon: originalGoal?.icon || 'target',
        color: originalGoal?.color || '#00685f',
        target: targetAmount,
        savedAmount: savedAmount,
        progress: Math.min(progress, 100)
      };
    });
  
  console.log('📊 [Dashboard] ========== DEBUG ==========');
  console.log('📊 Transfer ke Tabungan:', allTransferToSavings.length, 'transactions, total:', savingsTransfers);
  console.log('📊   - Topup ke Umum:', topUpToGeneral.length, 'total:', totalTopUpToGeneral);
  console.log('📊   - Alokasi ke Target:', allocationsToGoals.length, 'total:', totalAllocatedToGoals);
  console.log('📊 Tarik dari Tabungan:', allWithdrawals.length, 'transactions, total:', savingsWithdraws);
  console.log('📊   - Withdraw dari Umum:', withdrawFromGeneral.length, 'total:', totalWithdrawFromGeneral);
  console.log('📊 unallocatedSavings:', unallocatedSavings);
  console.log('📊 activeBalance:', activeBalance);
  console.log('📊 goalsData:', goalsData.map(g => ({ label: g.label, saved: g.savedAmount, progress: g.progress })));
  
  const savingsAchieved = activeBalance;

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
  const savingsPercent = budgetSavings > 0 ? (savingsBalance / budgetSavings) * 100 : 0;

  const translatedWeekDays = Array.isArray(t('weekDays')) ? t('weekDays') : WEEK_DAYS;

  return (
    <div className={`min-h-screen ${bgColor}`} key={dashboardKey}>
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
                <h4 className="text-sm font-bold text-gray-800">{t('financialStrategySuccess') || 'Strategi Finansial Berhasil!'}</h4>
                <p className="text-xs text-gray-500 mt-0.5">{t('allocationApplied') || 'Alokasi anggaranmu telah diterapkan. Yuk mulai catat transaksi!'}</p>
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
          <div className={`${cardBg} border-b ${borderColor} px-6 py-4 sticky top-0 z-10 flex-shrink-0`}>
            <div className="flex justify-between items-center">
              <div>
                <h1 className={`text-xl font-bold ${textPrimary}`}>{getGreeting(userData.name, t)}</h1>
                <p className={`text-xs ${textSecondary} mt-0.5`}>{t('manageFinance')}</p>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleRefresh}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                  title="Refresh Data"
                >
                  <span className="material-symbols-outlined text-gray-500">refresh</span>
                </button>
                
                {!isOnline && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 dark:bg-amber-900/30 rounded-lg border border-amber-200 dark:border-amber-800">
                    <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-sm">cloud_off</span>
                    <span className="text-xs font-medium text-amber-700 dark:text-amber-300">{t('offlineMode') || 'Offline Mode'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 pb-24 md:pb-5 space-y-5 no-scrollbar">
            <SummaryCards
              totalIncome={totalIncome}
              totalExpense={totalExpense}
              activeBalance={activeBalance}
              savingsBalance={savingsBalance}
              income={setup.income}
              savingsPercent={savingsPercent}
              formatRupiah={formatRupiah}
              cardBg={cardBg}
              borderColor={borderColor}
              textPrimary={textPrimary}
              textSecondary={textSecondary}
              t={t}
              onNavigateToGoals={() => navigate('/goals-setting')}
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
              t={t}
              isOnline={isOnline}
            />

            <div className={`${cardBg} rounded-lg border ${borderColor} shadow-sm p-4 flex items-center gap-3`}>
              <div className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-white">lightbulb</span>
              </div>
              <div>
                <div className="text-[10px] font-medium text-amber-600 uppercase tracking-wide">💡 {t('dailyRecommendation')}</div>
                <div className={`text-sm font-semibold ${textPrimary}`}>
                  {t('dailyBudget')}: <span className="text-[#00685f]">{formatRupiah(Math.max(0, dailyBudget))}</span>
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
                t={t}
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
                t={t}
                tc={tc}
              />
            </div>

            <GoalsCard 
              key={`goals-${dashboardKey}`}
              goalsData={goalsData}
              unallocatedSavings={unallocatedSavings}
              formatRupiah={formatRupiah}
              cardBg={cardBg}
              borderColor={borderColor}
              textPrimary={textPrimary}
              textSecondary={textSecondary}
              t={t}
              isDarkMode={isDarkMode}
              onTransactionSuccess={async () => {
                console.log('🔄 [Dashboard] Transaction success, refreshing...');
                await handleRefresh();
              }}
            />

            <WeeklyChart
              weeklyExpenses={weeklyExpenses}
              weekDays={translatedWeekDays}
              formatRupiah={formatRupiah}
              cardBg={cardBg}
              borderColor={borderColor}
              textPrimary={textPrimary}
              t={t}
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
              t={t}
              tc={tc}
              isDarkMode={isDarkMode}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;