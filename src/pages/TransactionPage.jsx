import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';
import { formatRupiah } from '../utils/format';
import { GOALS_OPTIONS } from '../constants/setupData';

// Daftar Kategori
const ORIGINAL_EXPENSE_CATEGORIES = [
  { name: 'Makanan & Minuman', type: 'need' },
  { name: 'Belanja Harian', type: 'need' },
  { name: 'Transportasi', type: 'need' },
  { name: 'Tagihan & Utilitas', type: 'need' },
  { name: 'Sewa', type: 'need' },
  { name: 'Cicilan', type: 'need' },
  { name: 'Kesehatan', type: 'need' },
  { name: 'Pendidikan', type: 'need' },
  { name: 'Hiburan & Hobi', type: 'want' },
  { name: 'Makan di Luar', type: 'want' },
  { name: 'Belanja', type: 'want' },
  { name: 'Olahraga', type: 'want' },
  { name: 'Investasi', type: 'saving' },
  { name: 'Lainnya', type: 'other' }
];

const ORIGINAL_INCOME_CATEGORIES = [
  'Gaji Bulanan',
  'Bonus',
  'Investasi',
  'Proyek Sampingan',
  'Hadiah',
  'Lainnya'
];

const ORIGINAL_TRANSFER_CATEGORIES = [
  'Transfer ke Tabungan',
  'Tarik dari Tabungan'
];

const getCategoryBadgeStyle = (type) => {
  switch (type) {
    case 'need':
      return {
        className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300',
        label: 'Kebutuhan'
      };
    case 'want':
      return {
        className: 'bg-green-100 text-green-700 dark:bg-green-900/60 dark:text-green-300',
        label: 'Keinginan'
      };
    case 'saving':
      return {
        className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300',
        label: 'Tabungan'
      };
    default:
      return {
        className: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
        label: 'Lainnya'
      };
  }
};

function TransactionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, bgColor, cardBg, borderColor, textPrimary, textSecondary } = useThemeStyles();
  const { t, tc } = useLanguage();
  
  const [userData, setUserData] = useState({ name: '', email: '' });
  const [transactionType, setTransactionType] = useState('expense');
  const [amountString, setAmountString] = useState('');
  const [category, setCategory] = useState(ORIGINAL_EXPENSE_CATEGORIES[0].name);
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  const [userGoals, setUserGoals] = useState([]);
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [selectedWithdrawGoalId, setSelectedWithdrawGoalId] = useState(null);
  const [savingsData, setSavingsData] = useState({ generalBalance: 0, goals: [] });
  
  const [financialData, setFinancialData] = useState({
    income: 0,
    totalIncome: 0,
    totalExpense: 0,
    activeBalance: 0,
    savingsBalance: 0,
    isLoading: true
  });

  const getCategoryBadge = (categoryName) => {
    const categoryInfo = ORIGINAL_EXPENSE_CATEGORIES.find(cat => cat.name === categoryName);
    return getCategoryBadgeStyle(categoryInfo?.type || 'other');
  };

  // Initial Fetch
  useEffect(() => {
    const storedName = localStorage.getItem('user_name');
    const storedEmail = localStorage.getItem('user_email');
    setUserData({
      name: storedName || 'Pengguna',
      email: storedEmail || 'email@example.com'
    });
    fetchAllData();
  }, []);

  // Transfer Mode
  useEffect(() => {
    const openTransferMode = location.state?.openTransferMode;
    if (openTransferMode) {
      setCategory('Transfer ke Tabungan');
      setTransactionType('expense');
      setAmountString('');
      setShowCustomInput(false);
      setSelectedWithdrawGoalId(null);
    }
  }, [location.state?.openTransferMode]);

  // Cek Auth
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
  }, [navigate]);

  const fetchAllData = async () => {
    console.log('🔄 [DEBUG] fetchAllData called');
    try {
      await Promise.all([
        fetchFinancialData(),
        fetchUserGoals(),
        fetchSavingsData()
      ]);
      console.log('✅ [DEBUG] fetchAllData completed');
    } catch (error) {
      console.error('❌ [DEBUG] fetchAllData error:', error);
    }
  };

  const fetchUserGoals = async () => {
    try {
      const response = await api.get('/user/goals');
      const goals = response.data.goals || [];
      const activeGoals = goals.filter(g => g.isSelected === true);
      setUserGoals(activeGoals);
    } catch (error) {
      console.error('Error fetching goals:', error);
    }
  };

  const fetchSavingsData = async () => {
    try {
      const response = await api.get('/savings/balance');
      if (response.data.success) {
        setSavingsData({
          generalBalance: response.data.generalBalance,
          goals: response.data.goals || []
        });
      }
    } catch (error) {
      console.error('Error fetching savings data:', error);
    }
  };

  const getGoalSavings = (goalId) => {
    const goal = savingsData.goals.find(g => g.goal_id === goalId);
    return goal?.allocated_amount || 0;
  };

  // Endpoint
  const fetchFinancialData = async () => {
    try {
      const [setupRes, summaryRes] = await Promise.all([
        api.get('/user/setup'),
        api.get('/transactions/summary')
      ]);

      const setup = setupRes.data.setup;
      const { totalIncome, totalExpense, savingsTransfers, savingsWithdraws } = summaryRes.data;

      const initialIncome = setup?.income || 0;
      const activeBalance = (initialIncome + totalIncome + savingsWithdraws) - (totalExpense + savingsTransfers);

      console.log('📊 [TransactionPage FinancialData]', {
        initialIncome,
        totalIncome,
        savingsWithdraws,
        totalExpense,
        savingsTransfers,
        activeBalance
      });

      setFinancialData({
        income: initialIncome,
        totalIncome: totalIncome,
        totalExpense: totalExpense,
        activeBalance: activeBalance,
        savingsBalance: savingsData.generalBalance,
        isLoading: false
      });
    } catch (error) {
      console.error('Error fetching financial data:', error);
      setFinancialData(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Update savingsBalance ketika savingsData berubah
  useEffect(() => {
    setFinancialData(prev => ({
      ...prev,
      savingsBalance: savingsData.generalBalance
    }));
  }, [savingsData.generalBalance]);

  const showToast = (message, type = 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'error' }), 4000);
  };

  const validateBalance = (amount) => {
    if (transactionType === 'expense' && category !== 'Transfer ke Tabungan' && category !== 'Tarik dari Tabungan') {
      if (amount > financialData.activeBalance) {
        return { valid: false, message: `Saldo tidak mencukupi! Sisa saldo: ${formatRupiah(financialData.activeBalance)}` };
      }
    }
    
    if (category === 'Transfer ke Tabungan') {
      if (amount > financialData.activeBalance) {
        return { valid: false, message: `Saldo tidak mencukupi! Sisa saldo: ${formatRupiah(financialData.activeBalance)}` };
      }
    }
    
    if (category === 'Tarik dari Tabungan') {
      if (selectedWithdrawGoalId) {
        const goalSavings = getGoalSavings(selectedWithdrawGoalId);
        if (amount > goalSavings) {
          return { valid: false, message: `Saldo target tidak mencukupi! Tersedia: ${formatRupiah(goalSavings)}` };
        }
      } else {
        if (amount > savingsData.generalBalance) {
          return { valid: false, message: `Saldo Tabungan Umum tidak mencukupi! Tersedia: ${formatRupiah(savingsData.generalBalance)}` };
        }
      }
    }
    
    return { valid: true, message: '' };
  };

  const validateAmount = (value) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return { valid: false, message: 'Nominal tidak valid' };
    if (numValue <= 0) return { valid: false, message: 'Minimal Rp 1.000' };
    if (numValue > 10000000000) return { valid: false, message: 'Maksimal Rp 10 Miliar' };
    if (numValue < 1000) return { valid: false, message: 'Minimal Rp 1.000' };
    return { valid: true, message: '' };
  };

  const handleKeyPress = (value) => {
    let newAmount = amountString;
    if (value === 'backspace') {
      newAmount = amountString.slice(0, -1);
    } else if (value === '.') {
      if (!amountString.includes('.') && amountString.length > 0) {
        newAmount = amountString + '.';
      }
    } else {
      if (amountString === '0' && value !== '.') {
        newAmount = String(value);
      } else {
        newAmount = amountString + value;
      }
    }
    if (newAmount.length <= 15) {
      setAmountString(newAmount);
    }
  };

  const getExpenseCategoryNames = () => ORIGINAL_EXPENSE_CATEGORIES.map(cat => cat.name);
  const getIncomeCategories = () => ORIGINAL_INCOME_CATEGORIES;
  const getTransferCategories = () => ORIGINAL_TRANSFER_CATEGORIES;

  const isCategoryActive = (displayCategory) => {
    if (showCustomInput) return false;
    if (category === 'Lainnya') {
      return displayCategory === 'Lainnya' || displayCategory === 'Others' || displayCategory === t('Other');
    }
    const currentDisplayCategories = transactionType === 'expense' ? getExpenseCategoryNames() : getIncomeCategories();
    const index = currentDisplayCategories.findIndex(cat => cat === displayCategory);
    if (index !== -1) {
      const originalCategories = transactionType === 'expense' ? getExpenseCategoryNames() : ORIGINAL_INCOME_CATEGORIES;
      return originalCategories[index] === category;
    }
    return false;
  };

  const handleCategorySelect = (selectedDisplayCategory) => {
    const isOthers = selectedDisplayCategory === 'Lainnya' || selectedDisplayCategory === 'Others' || selectedDisplayCategory === t('Other');
    if (isOthers) {
      setShowCustomInput(true);
      setCategory('Lainnya');
      setCustomCategory('');
    } else {
      setShowCustomInput(false);
      setCategory(selectedDisplayCategory);
      setCustomCategory('');
    }
  };

  const handleTransferSelect = (selectedTransfer) => {
    if (selectedTransfer === 'Transfer ke Tabungan') {
      setCategory('Transfer ke Tabungan');
      setSelectedWithdrawGoalId(null);
    } else {
      setCategory('Tarik dari Tabungan');
      setSelectedGoalId(null);
      fetchSavingsData();
    }
    setShowCustomInput(false);
    setCustomCategory('');
  };

  const isCategoryValid = () => {
    if (category === 'Lainnya' && !customCategory.trim()) return false;
    if (!category || category === '') return false;
    return true;
  };

  const getGoalLabel = (goalId) => {
    const goalInfo = GOALS_OPTIONS.find(g => g.id === goalId);
    return goalInfo?.label || goalId;
  };

  const handleTopUpGeneral = async (amount) => {
    const response = await api.post('/savings/topup', {
      amount: amount,
      date: new Date().toISOString().split('T')[0]
    });
    return response.data;
  };

  const handleTransferToGoal = async (amount, goalId, goalLabel) => {
    const response = await api.post('/savings/allocate-to-goal', {
      goalId: goalId,
      amount: amount,
      goalLabel: goalLabel
    });
    return response.data;
  };

  const handleWithdrawFromGoal = async (amount, goalId, goalLabel) => {
    const response = await api.post('/savings/withdraw-from-goal', {
      goalId: goalId,
      amount: amount,
      goalLabel: goalLabel
    });
    return response.data;
  };

  const handleWithdrawFromGeneral = async (amount) => {
    const response = await api.post('/savings/withdraw', {
      amount: amount,
      date: new Date().toISOString().split('T')[0]
    });
    return response.data;
  };

  const handleSaveTransaction = async () => {
    if (!amountString || amountString === '0') {
      showToast('Masukkan nominal', 'error');
      return;
    }

    const numericAmount = parseFloat(amountString);
    
    const amountValidation = validateAmount(amountString);
    if (!amountValidation.valid) {
      showToast(amountValidation.message, 'error');
      return;
    }

    if (category === 'Tarik dari Tabungan' && !selectedWithdrawGoalId) {
      showToast('Pilih sumber penarikan terlebih dahulu!', 'error');
      return;
    }

    const balanceValidation = validateBalance(numericAmount);
    if (!balanceValidation.valid) {
      showToast(balanceValidation.message, 'error');
      return;
    }

    if (!isCategoryValid()) {
      showToast('Pilih kategori', 'error');
      return;
    }

    if (transactionType === 'expense' && numericAmount > 5000000 && category !== 'Transfer ke Tabungan' && category !== 'Tarik dari Tabungan') {
      setShowConfirmDialog(true);
      return;
    }

    await saveTransaction(numericAmount);
  };

  const saveTransaction = async (numericAmount) => {
    setLoading(true);
    try {
      if (category === 'Transfer ke Tabungan') {
        if (selectedGoalId) {
          const goalLabel = getGoalLabel(selectedGoalId);
          const res = await handleTransferToGoal(numericAmount, selectedGoalId, goalLabel);
          if (res.success) {
            showToast(`Berhasil transfer ke ${goalLabel}`, 'success');
            await fetchAllData();
            setAmountString('');
            setNote('');
            setTimeout(() => {
              window.location.href = '/dashboard';
            }, 500);
            return;
          } else {
            showToast(res.message || 'Gagal transfer', 'error');
          }
        } else {
          const res = await handleTopUpGeneral(numericAmount);
          if (res.success) {
            showToast('Berhasil topup tabungan', 'success');
            await fetchAllData();
            setAmountString('');
            setNote('');
            setTimeout(() => {
              window.location.href = '/dashboard';
            }, 500);
            return;
          } else {
            showToast(res.message || 'Gagal topup', 'error');
          }
        }
      } 
      else if (category === 'Tarik dari Tabungan') {
        if (selectedWithdrawGoalId) {
          const goalLabel = getGoalLabel(selectedWithdrawGoalId);
          const res = await handleWithdrawFromGoal(numericAmount, selectedWithdrawGoalId, goalLabel);
          if (res.success) {
            showToast(`Berhasil tarik dari ${goalLabel}`, 'success');
            await fetchAllData();
            setAmountString('');
            setNote('');
            setTimeout(() => {
              window.location.href = '/dashboard';
            }, 500);
            return;
          } else {
            showToast(res.message || 'Gagal tarik', 'error');
          }
        } else {
          const res = await handleWithdrawFromGeneral(numericAmount);
          if (res.success) {
            showToast('Berhasil tarik dari tabungan umum', 'success');
            await fetchAllData();
            setAmountString('');
            setNote('');
            setTimeout(() => {
              window.location.href = '/dashboard';
            }, 500);
            return;
          } else {
            showToast(res.message || 'Gagal tarik', 'error');
          }
        }
      }
      else {
        let finalCategory = category;
        let finalDescription = note.trim() || category;
        
        if (category === 'Lainnya' && customCategory.trim()) {
          finalCategory = customCategory.trim();
          finalDescription = note.trim() || finalCategory;
        }
        
        console.log('📤 Sending transaction:', {
          type: transactionType,
          amount: numericAmount,
          category: finalCategory,
          description: finalDescription,
        });
        
        const apiResponse = await api.post('/transactions', {
          type: transactionType,
          amount: numericAmount,
          category: finalCategory,
          description: finalDescription,
          date: new Date().toISOString().split('T')[0]
        });
        
        console.log('📥 Response:', apiResponse.data);
        
        if (apiResponse.data && apiResponse.data.success === true) {
          showToast('Transaksi berhasil disimpan!', 'success');
          await fetchAllData();
          setAmountString('');
          setNote('');
          
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 500);
        } else {
          showToast(apiResponse.data?.message || 'Gagal menyimpan transaksi', 'error');
        }
      }
    } catch (error) {
      console.error('❌ Error saving transaction:', error);
      showToast(error.response?.data?.message || 'Terjadi kesalahan', 'error');
    } finally {
      setLoading(false);
      setShowConfirmDialog(false);
    }
  };

  const userInitial = userData.name ? userData.name.charAt(0).toUpperCase() : 'U';
  
  const previewActiveBalance = (() => {
    if (!amountString || amountString === '0') return financialData.activeBalance;
    const amount = parseFloat(amountString);
    
    if (category === 'Transfer ke Tabungan') {
      return financialData.activeBalance - amount;
    }
    if (category === 'Tarik dari Tabungan') {
      return financialData.activeBalance + amount;
    }
    if (transactionType === 'expense') {
      return financialData.activeBalance - amount;
    }
    if (transactionType === 'income') {
      return financialData.activeBalance + amount;
    }
    return financialData.activeBalance;
  })();
  
  const previewSavingsBalance = (() => {
    if (!amountString || amountString === '0') return financialData.savingsBalance;
    const amount = parseFloat(amountString);
    if (category === 'Transfer ke Tabungan') return financialData.savingsBalance + amount;
    if (category === 'Tarik dari Tabungan') return financialData.savingsBalance - amount;
    return financialData.savingsBalance;
  })();

  const isBalanceInsufficient = (() => {
    if (!amountString || amountString === '0') return false;
    const amount = parseFloat(amountString);
    
    if (transactionType === 'expense' && category !== 'Transfer ke Tabungan' && category !== 'Tarik dari Tabungan') {
      return amount > financialData.activeBalance;
    }
    if (category === 'Transfer ke Tabungan') {
      return amount > financialData.activeBalance;
    }
    if (category === 'Tarik dari Tabungan' && selectedWithdrawGoalId) {
      const goalSavings = getGoalSavings(selectedWithdrawGoalId);
      return amount > goalSavings;
    }
    if (category === 'Tarik dari Tabungan' && !selectedWithdrawGoalId) {
      return amount > savingsData.generalBalance;
    }
    return false;
  })();

  const expenseCategoryNames = getExpenseCategoryNames();
  const incomeCategories = getIncomeCategories();
  const transferCategories = getTransferCategories();
  const isTransferMode = category === 'Transfer ke Tabungan' || category === 'Tarik dari Tabungan';
  const isWithdrawMode = category === 'Tarik dari Tabungan';
  const isDepositMode = category === 'Transfer ke Tabungan';
  const currentCategories = isTransferMode ? transferCategories : (transactionType === 'expense' ? expenseCategoryNames : incomeCategories);

  const getCurrentGoalSavings = () => {
    if (!selectedWithdrawGoalId) return 0;
    return getGoalSavings(selectedWithdrawGoalId);
  };

  const getActiveCategoryStyle = () => {
    if (isTransferMode) return 'bg-emerald-600 text-white shadow-md';
    if (transactionType === 'expense') return 'bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-700';
    return 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700';
  };

  if (financialData.isLoading) {
    return (
      <div className={`min-h-screen ${bgColor} flex items-center justify-center`}>
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className={`text-sm ${textSecondary}`}>Memuat data keuangan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgColor}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          vertical-align: middle;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .toast-slide { animation: slideDown 0.3s ease forwards; }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {toast.show && (
        <div className={`fixed top-5 left-1/2 transform -translate-x-1/2 z-50 toast-slide w-auto max-w-md px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 ${
          toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
        }`}>
          <span className="material-symbols-outlined text-xl">
            {toast.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
      )}

      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardBg} rounded-2xl max-w-md w-full shadow-xl overflow-hidden`}>
            <div className={`p-5 border-b ${borderColor}`}>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-2xl text-amber-600">warning</span>
                <h3 className={`text-lg font-bold ${textPrimary}`}>Konfirmasi Transaksi Besar</h3>
              </div>
            </div>
            <div className="p-5">
              <p className={`${textSecondary} mb-2`}>
                Total: <strong className="text-rose-600 dark:text-rose-400">{formatRupiah(parseFloat(amountString))}</strong>
              </p>
              <p className={`text-sm ${textSecondary}`}>
                Sisa saldo: <strong className={previewActiveBalance < 0 ? 'text-rose-600' : 'text-emerald-600'}>
                  {formatRupiah(previewActiveBalance)}
                </strong>
              </p>
            </div>
            <div className={`p-5 border-t ${borderColor} flex gap-3`}>
              <button onClick={() => setShowConfirmDialog(false)} className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                Batal
              </button>
              <button onClick={() => saveTransaction(parseFloat(amountString))} className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition-all">
                Konfirmasi
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex h-screen overflow-hidden">
        <Sidebar userData={userData} userAvatar={null} userInitial={userInitial} />

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className={`${cardBg} border-b ${borderColor} px-4 md:px-6 py-4 sticky top-0 z-10 flex-shrink-0`}>
            <div className="flex justify-between items-center">
              <div>
                <h1 className={`text-xl font-bold ${textPrimary}`}>Catat Transaksi</h1>
                <p className={`text-xs ${textSecondary} mt-0.5`}>
                  {isDepositMode ? 'Transfer ke Tabungan' : isWithdrawMode ? 'Tarik dari Tabungan' : (transactionType === 'expense' ? 'Catat Pengeluaran' : 'Catat Pemasukan')}
                </p>
              </div>
              <button onClick={() => navigate('/dashboard')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${textSecondary} hover:bg-gray-100 dark:hover:bg-gray-800 transition-all`}>
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Kembali
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6">
            <div className="max-w-5xl mx-auto">
              <div className={`${cardBg} rounded-xl border ${borderColor} p-3 mb-6`}>
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-blue-500 text-sm">info</span>
                  <p className={`text-[10px] ${textSecondary}`}>
                    Minimal transaksi Rp 1.000. Transfer ke Tabungan untuk menabung, Tarik dari Tabungan untuk mengambil uang tabungan.
                  </p>
                </div>
              </div>

              {/* TAMPILAN SALDO AKTIF SAAT INI */}
              <div className={`${cardBg} rounded-xl border ${borderColor} p-4 mb-4 ${financialData.activeBalance >= 0 ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-rose-50 dark:bg-rose-900/20'}`}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className={`text-xs ${textSecondary}`}>💰 Saldo Aktif Saat Ini</p>
                    <p className={`text-xl font-bold ${financialData.activeBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {formatRupiah(financialData.activeBalance)}
                    </p>
                  </div>
                  <button 
                    onClick={fetchFinancialData}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                    title="Refresh saldo"
                  >
                    <span className="material-symbols-outlined text-gray-500 text-sm">refresh</span>
                  </button>
                </div>
              </div>

              <div className={`${cardBg} rounded-xl border ${borderColor} p-1 flex gap-1 mb-6`}>
                <button 
                  onClick={() => { setTransactionType('expense'); setCategory(ORIGINAL_EXPENSE_CATEGORIES[0].name); setAmountString(''); setShowCustomInput(false); setCustomCategory(''); setSelectedGoalId(null); setSelectedWithdrawGoalId(null); }} 
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${!isTransferMode && transactionType === 'expense' ? 'bg-rose-500 text-white' : `${textSecondary} hover:bg-gray-100 dark:hover:bg-gray-800`}`}
                >
                  <span className="material-symbols-outlined text-sm mr-1">arrow_downward</span> Pengeluaran
                </button>
                <button 
                  onClick={() => { setTransactionType('income'); setCategory(ORIGINAL_INCOME_CATEGORIES[0]); setAmountString(''); setShowCustomInput(false); setCustomCategory(''); setSelectedGoalId(null); setSelectedWithdrawGoalId(null); }} 
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${!isTransferMode && transactionType === 'income' ? 'bg-emerald-600 text-white' : `${textSecondary} hover:bg-gray-100 dark:hover:bg-gray-800`}`}
                >
                  <span className="material-symbols-outlined text-sm mr-1">arrow_upward</span> Pemasukan
                </button>
                <button 
                  onClick={() => { setCategory('Transfer ke Tabungan'); setAmountString(''); setShowCustomInput(false); setSelectedWithdrawGoalId(null); }} 
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${isTransferMode ? 'bg-emerald-600 text-white' : `${textSecondary} hover:bg-gray-100 dark:hover:bg-gray-800`}`}
                >
                  <span className="material-symbols-outlined text-sm mr-1">sync_alt</span> Transfer
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className={`${cardBg} rounded-xl border ${borderColor} p-4 text-center`}>
                    <p className={`text-xs ${textSecondary} mb-2`}>
                      {isDepositMode ? 'Nominal Transfer' : isWithdrawMode ? 'Nominal Tarik' : 'Total'}
                    </p>
                    <p className={`text-2xl font-bold ${
                      category === 'Transfer ke Tabungan' ? 'text-emerald-600' :
                      category === 'Tarik dari Tabungan' ? 'text-amber-600' :
                      transactionType === 'expense' ? 'text-rose-600' : 'text-emerald-600'
                    }`}>
                      {amountString ? formatRupiah(parseFloat(amountString)) : 'Rp 0'}
                    </p>
                    
                    {amountString && amountString !== '0' && (
                      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                        <p className={`text-[10px] ${textSecondary} mb-1`}>
                          {isTransferMode ? 'Saldo Aktif setelah transaksi:' : 'Sisa Saldo Aktif:'}
                        </p>
                        <p className={`text-sm font-semibold ${previewActiveBalance < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {formatRupiah(previewActiveBalance)}
                        </p>
                      </div>
                    )}

                    {isBalanceInsufficient && (
                      <div className="mt-3 p-2 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
                        <p className="text-[10px] text-rose-600 dark:text-rose-400 flex items-center justify-center gap-1">
                          <span className="material-symbols-outlined text-sm">warning</span>
                          Saldo tidak mencukupi!
                        </p>
                      </div>
                    )}
                  </div>

                  <div className={`${cardBg} rounded-xl border ${borderColor} p-4`}>
                    <div className="grid grid-cols-3 gap-2">
                      {[1,2,3,4,5,6,7,8,9].map(num => (
                        <button key={num} onClick={() => handleKeyPress(num)} className={`py-3 text-lg font-bold ${textPrimary} ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'} rounded-lg transition-all`}>
                          {num}
                        </button>
                      ))}
                      <button onClick={() => handleKeyPress('.')} className={`py-3 text-lg font-bold ${textPrimary} ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'} rounded-lg transition-all`}>.</button>
                      <button onClick={() => handleKeyPress(0)} className={`py-3 text-lg font-bold ${textPrimary} ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'} rounded-lg transition-all`}>0</button>
                      <button onClick={() => handleKeyPress('backspace')} className="py-3 bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-lg transition-all flex items-center justify-center">
                        <span className="material-symbols-outlined text-rose-600">backspace</span>
                      </button>
                    </div>
                  </div>

                  <button onClick={handleSaveTransaction} disabled={loading || !amountString || amountString === '0' || isBalanceInsufficient} className={`hidden lg:flex w-full py-3 rounded-xl font-semibold transition-all items-center justify-center gap-2 ${
                    category === 'Transfer ke Tabungan' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 
                    category === 'Tarik dari Tabungan' ? 'bg-amber-600 hover:bg-amber-700 text-white' : 
                    transactionType === 'expense' ? 'bg-rose-600 hover:bg-rose-700 text-white' : 
                    'bg-emerald-600 hover:bg-emerald-700 text-white'
                  } ${(loading || !amountString || amountString === '0' || isBalanceInsufficient) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {loading ? 'Menyimpan...' : 'Simpan Transaksi'}
                  </button>
                </div>

                <div className="space-y-4">
                  {category === 'Transfer ke Tabungan' && userGoals.length > 0 && (
                    <div className={`${cardBg} rounded-xl border ${borderColor} p-4`}>
                      <p className={`text-xs font-semibold ${textSecondary} mb-2`}>Pilih Target Tabungan</p>
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => setSelectedGoalId(null)} className={`py-2 px-2 rounded-lg text-xs font-medium transition-all ${
                          selectedGoalId === null
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700'
                            : `${isDarkMode ? 'bg-gray-800 text-gray-400 border-gray-700' : 'bg-gray-50 text-gray-600 border-gray-200'} border`
                        }`}>
                          Tabungan Umum
                        </button>
                        {userGoals.map((goal) => {
                          const goalInfo = GOALS_OPTIONS.find(g => g.id === goal.id);
                          const goalLabel = goalInfo?.label || goal.label || goal.id;
                          return (
                            <button key={goal.id} onClick={() => setSelectedGoalId(goal.id)} className={`py-2 px-2 rounded-lg text-xs font-medium transition-all ${
                              selectedGoalId === goal.id ? 'bg-emerald-600 text-white' : 
                              `${isDarkMode ? 'bg-gray-800 text-gray-400 border-gray-700' : 'bg-gray-50 text-gray-600 border-gray-200'} border`
                            }`}>
                              {goalLabel}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {category === 'Tarik dari Tabungan' && (
                    <div className={`${cardBg} rounded-xl border ${borderColor} p-4`}>
                      <p className={`text-xs font-semibold ${textSecondary} mb-2`}>Pilih Sumber Penarikan</p>
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => { setSelectedWithdrawGoalId(null); fetchSavingsData(); }} className={`py-2 px-2 rounded-lg text-xs font-medium transition-all ${
                          selectedWithdrawGoalId === null
                            ? 'bg-amber-100 text-amber-700 border border-amber-300 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700'
                            : `${isDarkMode ? 'bg-gray-800 text-gray-400 border-gray-700' : 'bg-gray-50 text-gray-600 border-gray-200'} border`
                        }`}>
                          Tabungan Umum ({formatRupiah(savingsData.generalBalance)})
                        </button>
                        {userGoals.map((goal) => {
                          const goalInfo = GOALS_OPTIONS.find(g => g.id === goal.id);
                          const goalLabel = goalInfo?.label || goal.label || goal.id;
                          const goalSavings = getGoalSavings(goal.id);
                          return (
                            <button key={goal.id} onClick={() => { setSelectedWithdrawGoalId(goal.id); fetchSavingsData(); }} className={`py-2 px-2 rounded-lg text-xs font-medium transition-all ${
                              selectedWithdrawGoalId === goal.id ? 'bg-amber-600 text-white' : 
                              `${isDarkMode ? 'bg-gray-800 text-gray-400 border-gray-700' : 'bg-gray-50 text-gray-600 border-gray-200'} border`
                            }`}>
                              {goalLabel} ({formatRupiah(goalSavings)})
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className={`${cardBg} rounded-xl border ${borderColor} p-4`}>
                    <p className={`text-xs font-semibold ${textSecondary} mb-2`}>
                      {isTransferMode ? 'Pilih Jenis Transfer' : 'Kategori'}
                    </p>
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                      {currentCategories.map((cat) => {
                        const isActive = isTransferMode ? category === cat : isCategoryActive(cat);
                        const badge = !isTransferMode && transactionType === 'expense' ? getCategoryBadge(cat) : null;

                        return (
                          <button
                            key={cat}
                            onClick={() => isTransferMode ? handleTransferSelect(cat) : handleCategorySelect(cat)}
                            className={`py-2 px-2 rounded-lg text-xs font-medium text-left transition-all flex items-center justify-between gap-1 ${
                              isActive
                                ? getActiveCategoryStyle()
                                : `${isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'} border border-transparent`
                            }`}
                          >
                            <span className="truncate">{cat}</span>
                            {badge && (
                              <span className={`shrink-0 text-[9px] px-1.5 py-0.5 rounded-full font-medium ${
                                isActive ? 'bg-white/20 text-white' : badge.className
                              }`}>
                                {badge.label}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {showCustomInput && (
                      <input
                        type="text"
                        placeholder="Kategori lain"
                        value={customCategory}
                        onChange={(e) => { setCustomCategory(e.target.value); setCategory(e.target.value); }}
                        className={`w-full mt-2 px-3 py-2 text-sm ${isDarkMode ? 'bg-gray-800 text-white placeholder-gray-500' : 'bg-gray-50 text-gray-900 placeholder-gray-400'} border ${borderColor} rounded-lg focus:outline-none focus:border-emerald-500`}
                      />
                    )}
                    
                    {!isTransferMode && transactionType === 'expense' && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <p className={`text-[10px] mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>📌 Keterangan:</p>
                        <div className="flex flex-wrap gap-3 text-[9px]">
                          <span className={`flex items-center gap-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            Kebutuhan (Needs)
                          </span>
                          <span className={`flex items-center gap-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            Keinginan (Wants)
                          </span>
                          <span className={`flex items-center gap-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                            Tabungan/Investasi
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={`${cardBg} rounded-xl border ${borderColor} p-4`}>
                    <p className={`text-xs font-semibold ${textSecondary} mb-2`}>Catatan</p>
                    <textarea
                      rows="2"
                      placeholder="Tambahkan catatan..."
                      value={note}
                      onChange={e => setNote(e.target.value)}
                      maxLength={200}
                      className={`w-full px-3 py-2 text-sm ${isDarkMode ? 'bg-gray-800 text-white placeholder-gray-500' : 'bg-gray-50 text-gray-900 placeholder-gray-400'} border ${borderColor} rounded-lg focus:outline-none focus:border-emerald-500 resize-none`}
                    />
                    <p className="text-right text-[10px] text-gray-400 mt-1">{note.length}/200</p>
                  </div>
                  
                  <button onClick={handleSaveTransaction} disabled={loading || !amountString || amountString === '0' || isBalanceInsufficient} className={`lg:hidden w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                    category === 'Transfer ke Tabungan' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 
                    category === 'Tarik dari Tabungan' ? 'bg-amber-600 hover:bg-amber-700 text-white' : 
                    transactionType === 'expense' ? 'bg-rose-600 hover:bg-rose-700 text-white' : 
                    'bg-emerald-600 hover:bg-emerald-700 text-white'
                  } ${(loading || !amountString || amountString === '0' || isBalanceInsufficient) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {loading ? 'Menyimpan...' : 'Simpan Transaksi'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${isDarkMode ? '#374151' : '#f1f1f1'};
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${isDarkMode ? '#6b7280' : '#c1c1c1'};
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}

export default TransactionPage;