import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api, { predictFinancialHealth } from '../services/api';
import Sidebar from '../components/Sidebar';
import { useTheme } from '../context/ThemeContext';
import { formatRupiah } from '../utils/format';
import { getGreeting } from '../utils/dashboard/greeting';
import { getStatusColor, getStatusIcon, getStatusText } from '../utils/dashboard/aiHelpers';

// Import components
import SummaryCards from '../components/Dashboard/SummaryCards';
import AICard from '../components/Dashboard/AICard';
import AllocationChart from '../components/Dashboard/AllocationChart';
import TopCategories from '../components/Dashboard/TopCategories';
import WeeklyChart from '../components/Dashboard/WeeklyChart';
import RecentTransactions from '../components/Dashboard/RecentTransactions';

function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  // State
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [popupProgress, setPopupProgress] = useState(100);
  const popupTimerRef = useRef(null);
  const popupIntervalRef = useRef(null);
  const [userData, setUserData] = useState({ name: '', email: '' });
  const [userAvatar, setUserAvatar] = useState(null);
  const [setup, setSetup] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dailyBudget, setDailyBudget] = useState(0);
  const [weeklyExpenses, setWeeklyExpenses] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [isDataFetched, setIsDataFetched] = useState(false);

  // AI STATE
  const [aiPrediction, setAiPrediction] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(false);
  
  // Refs untuk mencegah infinite loop
  const fetchInProgress = useRef(false);
  const initialFetchDone = useRef(false);

  // Ambil data user dari localStorage
  useEffect(() => {
    const storedName = localStorage.getItem('user_name');
    const storedEmail = localStorage.getItem('user_email');
    const storedAvatar = localStorage.getItem('user_avatar');
    setUserData({
      name: storedName || 'Pengguna',
      email: storedEmail || 'email@example.com',
    });
    if (storedAvatar) setUserAvatar(storedAvatar);
  }, []);

  // AI PREDICTION FUNCTION
  const fetchAIPrediction = useCallback(async (incomeValue, userIdValue, showErrorToast = false) => {
    if (aiLoading) return;
    
    setAiLoading(true);
    setAiError(false);
    
    try {
      console.log('[AI] Fetching monthly prediction...');
      const result = await predictFinancialHealth(userIdValue, incomeValue);
      setAiPrediction(result);
    } catch (error) {
      console.error('[AI] Prediction error:', error);
      setAiError(true);
      
      if (showErrorToast) {
        alert('AI sedang offline, menampilkan prediksi sementara.');
      }
      
      setAiPrediction({
        success: true,
        is_fallback: true,
        prediction: { label: 'Moderate', confidence: 0.6 },
        recommendation: '📊 Keuangan Anda cukup stabil. Terus pantau pengeluaran harian.',
        source: 'fallback'
      });
    } finally {
      setAiLoading(false);
    }
  }, [aiLoading]);

  // Fetch data setup dan transaksi
  useEffect(() => {
    if (initialFetchDone.current || fetchInProgress.current) {
      console.log('⏭️ Skip fetch - already done or in progress');
      return;
    }
    
    fetchInProgress.current = true;
    console.log('🟢 FIRST TIME FETCH DATA');
    
    const fetchData = async () => {
      try {
        const [setupRes, transRes] = await Promise.all([
          api.get('/user/setup'),
          api.get('/transactions'),
        ]);
        
        const userSetup = setupRes.data.setup;
        setSetup(userSetup);
        const allTransactions = transRes.data.transactions || [];

        const totalIncomeAmount = allTransactions
          .filter((t) => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);
        const totalExpenseAmount = allTransactions
          .filter((t) => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);

        setTransactions(allTransactions);

        const income = userSetup.income;
        const remaining = (income + totalIncomeAmount) - totalExpenseAmount;
        const daysLeft = 30 - new Date().getDate();
        setDailyBudget(daysLeft > 0 ? remaining / daysLeft : remaining);

        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        const weekExp = [0, 0, 0, 0, 0, 0, 0];
        allTransactions.forEach((tx) => {
          if (tx.type === 'expense') {
            const txDate = new Date(tx.date);
            if (txDate >= startOfWeek && txDate <= now) {
              weekExp[txDate.getDay()] += tx.amount;
            }
          }
        });
        setWeeklyExpenses(weekExp);

        // Panggil AI sekali saja
        const userId = localStorage.getItem('user_id');
        const targetUserId = userId ? parseInt(userId) : 1;
        await fetchAIPrediction(userSetup.income, targetUserId, false);

        initialFetchDone.current = true;
        setIsDataFetched(true);

      } catch (error) {
        console.error('Gagal fetch dashboard:', error);
        if (error.response?.status === 404) {
          navigate('/setup-financial');
        }
      } finally {
        setLoading(false);
        fetchInProgress.current = false;
      }
    };
    
    fetchData();
  }, [navigate, fetchAIPrediction]);

  // Popup welcome
  useEffect(() => {
    if (location.state?.fromSetup) {
      setShowWelcomePopup(true);
      setPopupProgress(100);
      
      const startTime = Date.now();
      const duration = 10000;
      
      popupIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
        setPopupProgress(remaining);
        
        if (remaining <= 0) {
          clearInterval(popupIntervalRef.current);
        }
      }, 16);
      
      // Timer untuk menutup popup
      popupTimerRef.current = setTimeout(() => {
        setShowWelcomePopup(false);
        setPopupProgress(0);
        clearInterval(popupIntervalRef.current);
      }, duration);
      
      // Bersihkan state dari URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    return () => {
      if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
      if (popupIntervalRef.current) clearInterval(popupIntervalRef.current);
    };
  }, [location.state]);

  // Fungsi untuk menutup popup manual
  const closePopup = () => {
    setShowWelcomePopup(false);
    setPopupProgress(0);
    if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
    if (popupIntervalRef.current) clearInterval(popupIntervalRef.current);
  };

  // Hitung userInitial
  const userInitial = userData.name ? userData.name.charAt(0).toUpperCase() : 'U';

  // Handler refresh AI
  const handleRefreshAI = useCallback(async () => {
    if (setup?.income && !aiLoading) {
      const userId = localStorage.getItem('user_id');
      await fetchAIPrediction(setup.income, userId ? parseInt(userId) : 1, true);
    }
  }, [setup?.income, fetchAIPrediction, aiLoading]);

  // Theme styles
  const bgColor = isDarkMode ? 'bg-gray-900' : 'bg-gray-50';
  const cardBg = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const borderColor = isDarkMode ? 'border-gray-700' : 'border-gray-200';
  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-800';
  const textSecondary = isDarkMode ? 'text-gray-400' : 'text-gray-500';

  if (loading) {
    return (
      <div className={`min-h-screen ${bgColor} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#00685f]"></div>
      </div>
    );
  }

  if (!setup) return null;

  // Data untuk komponen
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalEffectiveIncome = setup.income + totalIncome;
  const savingsAchieved = totalEffectiveIncome - totalExpense;

  const budgetNeeds = (setup.income * setup.allocation.kebutuhan) / 100;
  const budgetWants = (setup.income * setup.allocation.keinginan) / 100;
  const budgetSavings = (setup.income * setup.allocation.tabungan) / 100;

  const needsCategories = ['Makanan & Minuman', 'Belanja Harian', 'Transportasi', 'Tagihan & Utilitas', 'Kesehatan', 'Pendidikan', 'Sewa', 'Cicilan'];
  const wantsCategories = ['Hiburan & Hobi', 'Makan di Luar', 'Belanja', 'Olahraga', 'Lainnya'];

  const totalExpenseNeeds = transactions
    .filter(t => t.type === 'expense' && needsCategories.includes(t.category))
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenseWants = transactions
    .filter(t => t.type === 'expense' && wantsCategories.includes(t.category))
    .reduce((sum, t) => sum + t.amount, 0);

  const needsUsedPercent = budgetNeeds > 0 ? (totalExpenseNeeds / budgetNeeds) * 100 : 0;
  const wantsUsedPercent = budgetWants > 0 ? (totalExpenseWants / budgetWants) * 100 : 0;
  const savingsPercent = budgetSavings > 0 ? (savingsAchieved / budgetSavings) * 100 : 0;

  const weekDays = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

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
          from {
            opacity: 0;
            transform: translate(-50%, -20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out forwards;
        }
      `}</style>

      {showWelcomePopup && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm animate-slideDown">
          <div className="bg-white rounded-xl shadow-2xl border border-emerald-100 overflow-hidden">
            {/* Progress bar di atas */}
            <div className="h-1 bg-emerald-100">
              <div 
                className="h-full bg-emerald-500 transition-all duration-50 ease-linear"
                style={{ width: `${popupProgress}%` }}
              ></div>
            </div>
            
            {/* Konten Popup */}
            <div className="p-4 flex items-start gap-3">
              {/* Icon */}
              <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-emerald-500">check_circle</span>
              </div>
              
              {/* Teks */}
              <div className="flex-1">
                <h4 className="text-sm font-bold text-gray-800">Strategi Finansial Berhasil!</h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Alokasi anggaranmu telah diterapkan. Yuk mulai catat transaksi!
                </p>
              </div>
              <button 
                onClick={closePopup}
                className="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors flex-shrink-0"
              >
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
                <h1 className={`text-xl font-bold ${textPrimary}`}>
                  {getGreeting(userData.name)}
                </h1>
                <p className={`text-xs ${textSecondary} mt-0.5`}>
                  Yuk kelola keuanganmu hari ini!
                </p>
              </div>
              <button 
                onClick={() => navigate('/transaction')} 
                className="flex items-center gap-2 bg-[#00685f] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#005049] transition-all"
              >
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
              onRefresh={handleRefreshAI}
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

            {/* Daily Budget */}
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
              weekDays={weekDays}
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