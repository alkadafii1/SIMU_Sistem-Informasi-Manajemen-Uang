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

// dark mode support untuk badge
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
  const [savingsByGoal, setSavingsByGoal] = useState({});
  const [isLoadingSavings, setIsLoadingSavings] = useState(false);
  
  const [financialData, setFinancialData] = useState({
    income: 0,
    totalIncome: 0,
    totalExpense: 0,
    activeBalance: 0,
    savingsBalance: 0,
    remaining: 0,
    isLoading: true
  });

  // ========== DEPENDENCY FIX: Hanya mount sekali ==========
  useEffect(() => {
    const storedName = localStorage.getItem('user_name');
    const storedEmail = localStorage.getItem('user_email');
    setUserData({
      name: storedName || 'Pengguna',
      email: storedEmail || 'email@example.com'
    });
    fetchAllData();
  }, []); // ✅ Empty array = hanya sekali saat mount

  // ========== DEPENDENCY FIX: Transfer mode tidak perlu fetch ulang ==========
  useEffect(() => {
    const openTransferMode = location.state?.openTransferMode;
    if (openTransferMode) {
      setCategory('Transfer ke Tabungan');
      setTransactionType('expense');
      setAmountString('');
      setShowCustomInput(false);
      setSelectedWithdrawGoalId(null);
      // ✅ HAPUS fetchAllData() - tidak perlu fetch ulang
    }
  }, [location.state?.openTransferMode]); // ✅ Dependency spesifik

  // ========== DEPENDENCY FIX: Cek auth dan setup hanya sekali ==========
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const checkSetup = async () => {
      try {
        await api.get('/user/setup');
      } catch (error) {
        if (error.response?.status === 404) {
          navigate('/setup-financial');
        } else if (error.response?.status === 401) {
          localStorage.clear();
          navigate('/login');
        }
      }
    };
    checkSetup();
  }, [navigate]); // ✅ Dependency hanya navigate

  const fetchAllData = async () => {
    console.log('🔄 [DEBUG] fetchAllData called');
    try {
      await Promise.all([
        fetchFinancialData(),
        fetchUserGoals(),
        fetchSavingsByGoal()
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

  const fetchSavingsByGoal = async () => {
    setIsLoadingSavings(true);
    try {
      const [goalsRes, transactionsRes] = await Promise.all([
        api.get('/user/goals'),
        api.get('/transactions')
      ]);
      
      const userGoalsData = goalsRes.data.goals || [];
      const transactions = transactionsRes.data.transactions || [];
      const savings = {};
      
      userGoalsData.forEach(goal => {
        if (goal.isSelected) {
          savings[goal.id] = 0;
        }
      });
      
      transactions.forEach(tx => {
        if (tx.category === 'Transfer ke Tabungan' || tx.category === 'Tarik dari Tabungan') {
          const description = tx.description || '';
          const amount = tx.amount;
          
          if (description.startsWith('WITHDRAW_GOAL:')) {
            const parts = description.split(':');
            const goalId = parts[1];
            if (savings[goalId] !== undefined) {
              savings[goalId] -= amount;
            }
          } else if (description.startsWith('TRANSFER_GOAL:')) {
            const parts = description.split(':');
            const goalId = parts[1];
            if (savings[goalId] !== undefined) {
              savings[goalId] += amount;
            }
          } else if (description.includes('Alokasi dari Tabungan Umum ke')) {
            for (const goal of userGoalsData) {
              if (goal.isSelected) {
                const goalInfo = GOALS_OPTIONS.find(g => g.id === goal.id);
                const goalLabel = goalInfo?.label || goal.id;
                if (description.includes(goalLabel)) {
                  savings[goal.id] = (savings[goal.id] || 0) + amount;
                  break;
                }
              }
            }
          }
        }
      });
      
      setSavingsByGoal(savings);
      return savings;
    } catch (error) {
      console.error('Error fetching savings by goal:', error);
      return {};
    } finally {
      setIsLoadingSavings(false);
    }
  };

  const fetchFinancialData = async () => {
    try {
      const [transactionsRes, setupRes] = await Promise.all([
        api.get('/transactions'),
        api.get('/user/setup')
      ]);

      const transactions = transactionsRes.data.transactions || [];
      const setup = setupRes.data.setup;
      
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
      
      setFinancialData({
        income: setup.income,
        totalIncome: totalIncome,
        totalExpense: totalExpense,
        activeBalance: activeBalance,
        savingsBalance: savingsBalance,
        remaining: activeBalance,
        isLoading: false
      });
    } catch (error) {
      console.error('Error fetching financial data:', error);
      setFinancialData(prev => ({ ...prev, isLoading: false }));
    }
  };

  const showToast = (message, type = 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'error' }), 4000);
  };

  const validateBalance = async (amount) => {
    if (category === 'Transfer ke Tabungan') {
      if (amount > financialData.activeBalance) {
        return { valid: false, message: `Saldo aktif tidak mencukupi! Sisa saldo aktif: ${formatRupiah(financialData.activeBalance)}` };
      }
    } else if (category === 'Tarik dari Tabungan') {
      if (!selectedWithdrawGoalId) {
        return { valid: false, message: 'Pilih target tabungan yang akan ditarik!' };
      }
      const goalSavings = savingsByGoal[selectedWithdrawGoalId] || 0;
      if (amount > goalSavings) {
        return { valid: false, message: `Saldo tabungan untuk target ini tidak mencukupi! Saldo saat ini: ${formatRupiah(goalSavings)}` };
      }
    } else if (transactionType === 'expense') {
      if (amount > financialData.activeBalance) {
        return { valid: false, message: `Saldo tidak mencukupi! Sisa saldo: ${formatRupiah(financialData.activeBalance)}` };
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

  const getCategoryBadge = (categoryName) => {
    const categoryInfo = ORIGINAL_EXPENSE_CATEGORIES.find(cat => cat.name === categoryName);
    return getCategoryBadgeStyle(categoryInfo?.type || 'other');
  };

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
      fetchSavingsByGoal();
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
      showToast('Pilih target tabungan yang akan ditarik!', 'error');
      return;
    }

    const balanceValidation = await validateBalance(numericAmount);
    if (!balanceValidation.valid) {
      showToast(balanceValidation.message, 'error');
      return;
    }

    if (!isCategoryValid()) {
      showToast('Pilih kategori', 'error');
      return;
    }

    let finalCategory = category;
    let finalType = transactionType;
    let finalDescription = '';

    if (category === 'Transfer ke Tabungan') {
      finalType = 'expense';
      if (selectedGoalId) {
        const goalLabel = getGoalLabel(selectedGoalId);
        finalDescription = `TRANSFER_GOAL:${selectedGoalId}:${goalLabel}`;
        if (note.trim()) finalDescription += `|${note.trim()}`;
      } else {
        finalDescription = `TRANSFER_GENERAL`;
        if (note.trim()) finalDescription += `|${note.trim()}`;
      }
    } else if (category === 'Tarik dari Tabungan') {
      finalType = 'income';
      if (selectedWithdrawGoalId) {
        const goalLabel = getGoalLabel(selectedWithdrawGoalId);
        finalDescription = `WITHDRAW_GOAL:${selectedWithdrawGoalId}:${goalLabel}`;
        if (note.trim()) finalDescription += `|${note.trim()}`;
      } else {
        finalDescription = `WITHDRAW_GENERAL`;
        if (note.trim()) finalDescription += `|${note.trim()}`;
      }
    } else if (category === 'Lainnya' && customCategory.trim()) {
      finalCategory = customCategory.trim();
      finalDescription = note.trim() || finalCategory;
    } else {
      finalDescription = note.trim() || category;
    }

    if (transactionType === 'expense' && numericAmount > 5000000 && category !== 'Transfer ke Tabungan') {
      setShowConfirmDialog(true);
      return;
    }

    await saveTransaction(numericAmount, finalCategory, finalType, finalDescription);
  };

  const saveTransaction = async (numericAmount, finalCategory, finalType, finalDescription) => {
    setLoading(true);
    try {
      console.log('📤 SAVING TRANSACTION:', {
        type: finalType,
        amount: numericAmount,
        category: finalCategory,
        description: finalDescription
      });
      
      const response = await api.post('/transactions', {
        type: finalType,
        amount: numericAmount,
        category: finalCategory,
        description: finalDescription,
        date: new Date().toISOString().split('T')[0]
      });
      
      console.log('📥 RESPONSE:', response.data);
      
      if (response.data.success) {
        showToast('Transaksi berhasil disimpan!', 'success');
        await fetchAllData();
        
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);
      }
    } catch (error) {
      console.error('❌ Error saving transaction:', error);
      console.error('Response error data:', error.response?.data);
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
    if (category === 'Transfer ke Tabungan') return financialData.activeBalance - amount;
    if (category === 'Tarik dari Tabungan') return financialData.activeBalance + amount;
    if (transactionType === 'expense') return financialData.activeBalance - amount;
    if (transactionType === 'income') return financialData.activeBalance + amount;
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
    if (category === 'Transfer ke Tabungan') {
      return amountString && parseFloat(amountString) > financialData.activeBalance;
    }
    if (category === 'Tarik dari Tabungan') {
      if (selectedWithdrawGoalId && amountString) {
        const goalSavings = savingsByGoal[selectedWithdrawGoalId] || 0;
        return parseFloat(amountString) > goalSavings;
      }
      return amountString && parseFloat(amountString) > financialData.savingsBalance;
    }
    if (transactionType === 'expense') {
      return amountString && parseFloat(amountString) > financialData.activeBalance;
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
    return savingsByGoal[selectedWithdrawGoalId] || 0;
  };

  const getActiveCategoryStyle = () => {
    if (isTransferMode) return 'bg-emerald-600 text-white shadow-md';
    if (transactionType === 'expense') return 'bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-700';
    return 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700';
  };

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
              <button onClick={() => saveTransaction(parseFloat(amountString), category === 'Lainnya' && customCategory ? customCategory : category, transactionType, note.trim())} className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition-all">
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

                    {(category === 'Transfer ke Tabungan' || category === 'Tarik dari Tabungan') && amountString && amountString !== '0' && (
                      <div className="mt-2">
                        <p className={`text-[10px] ${textSecondary} mb-1`}>Saldo Tabungan setelah transaksi:</p>
                        <p className={`text-sm font-semibold ${category === 'Transfer ke Tabungan' ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {formatRupiah(previewSavingsBalance)}
                        </p>
                      </div>
                    )}

                    {category === 'Tarik dari Tabungan' && selectedWithdrawGoalId && amountString && amountString !== '0' && (
                      <div className="mt-2">
                        <p className={`text-[10px] ${textSecondary} mb-1`}>Saldo Target setelah tarik:</p>
                        <p className={`text-sm font-semibold ${previewSavingsBalance < 0 ? 'text-rose-600' : 'text-amber-600'}`}>
                          {formatRupiah(savingsByGoal[selectedWithdrawGoalId] - parseFloat(amountString))}
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
                    
                    {category === 'Tarik dari Tabungan' && selectedWithdrawGoalId && (
                      <div className="mt-2 text-[10px] text-amber-600">
                        Saldo target saat ini: {formatRupiah(getCurrentGoalSavings())}
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
                          Tanpa Target
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

                  {category === 'Tarik dari Tabungan' && userGoals.length > 0 && (
                    <div className={`${cardBg} rounded-xl border ${borderColor} p-4`}>
                      <p className={`text-xs font-semibold ${textSecondary} mb-2`}>Pilih Target yang Ditarik</p>
                      <div className="grid grid-cols-2 gap-2">
                        {userGoals.map((goal) => {
                          const goalInfo = GOALS_OPTIONS.find(g => g.id === goal.id);
                          const goalLabel = goalInfo?.label || goal.label || goal.id;
                          return (
                            <button key={goal.id} onClick={() => { setSelectedWithdrawGoalId(goal.id); fetchSavingsByGoal(); }} className={`py-2 px-2 rounded-lg text-xs font-medium transition-all ${
                              selectedWithdrawGoalId === goal.id ? 'bg-amber-600 text-white' : 
                              `${isDarkMode ? 'bg-gray-800 text-gray-400 border-gray-700' : 'bg-gray-50 text-gray-600 border-gray-200'} border`
                            }`}>
                              {goalLabel}
                            </button>
                          );
                        })}
                      </div>
                      {selectedWithdrawGoalId && (
                        <p className="text-[10px] text-amber-600 mt-2">
                          Saldo: {formatRupiah(getCurrentGoalSavings())}
                        </p>
                      )}
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