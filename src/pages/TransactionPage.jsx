import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useThemeStyles } from '../hooks/useThemeStyles';
import api from '../services/api';
import { formatRupiah } from '../utils/format';

function TransactionPage() {
  const navigate = useNavigate();
  const { isDarkMode, bgColor, cardBg, borderColor, textPrimary, textSecondary } = useThemeStyles();
  
  const [userData, setUserData] = useState({ name: '', email: '' });
  const [transactionType, setTransactionType] = useState('expense');
  const [amountString, setAmountString] = useState('');
  const [category, setCategory] = useState('Makanan & Minuman');
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  // State untuk data keuangan user
  const [financialData, setFinancialData] = useState({
    income: 0,
    totalIncome: 0,
    totalExpense: 0,
    remaining: 0,
    isLoading: true
  });

  // Ambil data user dari localStorage
  useEffect(() => {
    const storedName = localStorage.getItem('user_name');
    const storedEmail = localStorage.getItem('user_email');
    setUserData({
      name: storedName || 'Pengguna',
      email: storedEmail || 'email@example.com'
    });
    
    fetchFinancialData();
  }, []);

  // Fetch data keuangan user
  const fetchFinancialData = async () => {
    try {
      const [transactionsRes, setupRes] = await Promise.all([
        api.get('/transactions'),
        api.get('/user/setup')
      ]);

      const transactions = transactionsRes.data.transactions || [];
      const setup = setupRes.data.setup;
      
      const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const remaining = (setup.income + totalIncome) - totalExpense;
      
      setFinancialData({
        income: setup.income,
        totalIncome: totalIncome,
        totalExpense: totalExpense,
        remaining: remaining,
        isLoading: false
      });
    } catch (error) {
      console.error('Error fetching financial data:', error);
      setFinancialData(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Cek autentikasi dan setup
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
  }, [navigate]);

  const showToast = (message, type = 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'error' }), 4000);
  };

  // Validasi saldo
  const validateBalance = (amount) => {
    if (transactionType === 'expense') {
      const currentRemaining = financialData.remaining;
      if (amount > currentRemaining) {
        return {
          valid: false,
          message: `Saldo tidak mencukupi! Sisa budget Anda: ${formatRupiah(currentRemaining)}`
        };
      }
    }
    return { valid: true, message: '' };
  };

  // Validasi jumlah
  const validateAmount = (value) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return { valid: false, message: 'Nominal tidak valid' };
    if (numValue <= 0) return { valid: false, message: 'Nominal harus lebih dari 0' };
    if (numValue > 10000000000) return { valid: false, message: 'Nominal maksimal 10 Miliar' };
    
    if (transactionType === 'expense' && numValue < 1000) {
      return { valid: false, message: 'Minimal pengeluaran Rp 1.000' };
    }
    
    if (transactionType === 'income' && numValue < 1000) {
      return { valid: false, message: 'Minimal pemasukan Rp 1.000' };
    }
    
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

  // Handle kategori
  const handleCategorySelect = (cat) => {
    if (cat === 'Lainnya') {
      setShowCustomInput(true);
      setCategory('Lainnya');
    } else {
      setShowCustomInput(false);
      setCategory(cat);
      setCustomCategory('');
    }
  };

  const handleSaveTransaction = async () => {
    if (!amountString || amountString === '0') {
      showToast('Masukkan nominal transaksi terlebih dahulu', 'error');
      return;
    }

    const numericAmount = parseFloat(amountString);
    
    const amountValidation = validateAmount(amountString);
    if (!amountValidation.valid) {
      showToast(amountValidation.message, 'error');
      return;
    }

    if (transactionType === 'expense') {
      const balanceValidation = validateBalance(numericAmount);
      if (!balanceValidation.valid) {
        showToast(balanceValidation.message, 'error');
        return;
      }
    }

    // Validasi kategori
    let finalCategory = category;
    if (category === 'Lainnya' && customCategory.trim()) {
      finalCategory = customCategory.trim();
    } else if (category === 'Lainnya' && !customCategory.trim()) {
      showToast('Silakan isi kategori lainnya', 'error');
      return;
    }

    if (!finalCategory) {
      showToast('Pilih kategori transaksi', 'error');
      return;
    }

    if (transactionType === 'expense' && numericAmount > 5000000) {
      setShowConfirmDialog(true);
      return;
    }

    await saveTransaction(numericAmount, finalCategory);
  };

  const saveTransaction = async (numericAmount, finalCategory) => {
    setLoading(true);
    try {
      const response = await api.post('/transactions', {
        type: transactionType,
        amount: numericAmount,
        category: finalCategory,
        description: note.trim() || (transactionType === 'expense' ? `Belanja ${finalCategory}` : `Pendapatan ${finalCategory}`),
        date: new Date().toISOString().split('T')[0]
      });
      
      if (response.data.success) {
        showToast('Transaksi berhasil disimpan!', 'success');
        await fetchFinancialData();
        setAmountString('');
        setNote('');
        setCustomCategory('');
        setShowCustomInput(false);
        setCategory('Makanan & Minuman');
        setTimeout(() => navigate('/dashboard'), 1500);
      }
    } catch (error) {
      console.error('Error saving transaction:', error);
      let message = 'Terjadi kesalahan, silakan coba lagi';
      
      if (error.response?.data?.message) {
        message = error.response.data.message;
        
        if (message.includes('Saldo tidak cukup') || message.includes('Sisa budget')) {
          await fetchFinancialData();
        } else if (message.toLowerCase().includes('setup')) {
          message = 'Anda belum melakukan pengaturan keuangan. Silakan isi pendapatan terlebih dahulu.';
          setTimeout(() => navigate('/setup-financial'), 2000);
        } else if (message.toLowerCase().includes('token') || message.toLowerCase().includes('unauthorized')) {
          message = 'Sesi Anda habis, silakan login kembali';
          setTimeout(() => {
            localStorage.clear();
            navigate('/login');
          }, 2000);
        }
      }
      showToast(message, 'error');
    } finally {
      setLoading(false);
      setShowConfirmDialog(false);
    }
  };

  const userInitial = userData.name ? userData.name.charAt(0).toUpperCase() : 'U';
  const previewRemaining = (() => {
    if (!amountString || amountString === '0') return financialData.remaining;
    const amount = parseFloat(amountString);
    if (transactionType === 'expense') return financialData.remaining - amount;
    return financialData.remaining + amount;
  })();
  const isBalanceInsufficient = transactionType === 'expense' && 
                                 amountString && 
                                 parseFloat(amountString) > financialData.remaining;

  const expenseCategories = [
    'Makanan & Minuman',
    'Belanja Harian',
    'Transportasi',
    'Tagihan & Utilitas',
    'Hiburan & Hobi',
    'Kesehatan',
    'Pendidikan',
    'Investasi',
    'Lainnya'
  ];
  
  const incomeCategories = [
    'Gaji Bulanan',
    'Bonus',
    'Investasi',
    'Proyek Sampingan',
    'Hadiah',
    'Lainnya'
  ];
  
  const currentCategories = transactionType === 'expense' ? expenseCategories : incomeCategories;

  // Hitung total pemasukan untuk ditampilkan di card
  const totalPemasukan = financialData.totalIncome + financialData.income;

  return (
    <div className={`min-h-screen ${bgColor}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          vertical-align: middle;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .toast-slide {
          animation: slideDown 0.3s ease forwards;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Toast Notification */}
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

      {/* Confirm Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md mx-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-3xl text-amber-600">warning</span>
              <h3 className="text-lg font-bold text-gray-800">Konfirmasi Transaksi Besar</h3>
            </div>
            <p className="text-gray-600 mb-2">
              Anda akan melakukan transaksi sebesar <strong className="text-rose-600">{formatRupiah(parseFloat(amountString))}</strong>
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Sisa budget setelah transaksi: <strong className={previewRemaining < 0 ? 'text-rose-600' : 'text-[#00685f]'}>
                {formatRupiah(previewRemaining)}
              </strong>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 font-medium hover:bg-gray-50 transition-all"
              >
                Batal
              </button>
              <button
                onClick={() => saveTransaction(parseFloat(amountString), category === 'Lainnya' && customCategory ? customCategory : category)}
                className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition-all"
              >
                Konfirmasi
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex h-screen overflow-hidden">
        <Sidebar userData={userData} userAvatar={null} userInitial={userInitial} />

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className={`${cardBg} border-b ${borderColor} px-6 py-4 sticky top-0 z-10 flex-shrink-0`}>
            <div className="flex justify-between items-center">
              <div>
                <h1 className={`text-xl font-bold ${textPrimary}`}>Catat Transaksi</h1>
                <p className={`text-xs ${textSecondary} mt-0.5`}>
                  {transactionType === 'expense' ? 'Catat pengeluaran Anda' : 'Catat pemasukan Anda'}
                </p>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className={`flex items-center gap-2 ${borderColor} ${textSecondary} px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-all`}
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Kembali
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
            <div className="max-w-5xl mx-auto">
              {/* Financial Summary Card - Sekarang pakai cardBg seperti komponen lain */}
              {!financialData.isLoading && (
                <div className={`${cardBg} rounded-xl border ${borderColor} p-4 mb-6 shadow-sm`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className={`text-xs ${textSecondary} mb-1`}>Sisa Budget Saat Ini</p>
                      <p className={`text-2xl font-bold ${textPrimary}`}>{formatRupiah(financialData.remaining)}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs ${textSecondary} mb-1`}>Total Pemasukan</p>
                      <p className={`font-semibold ${textPrimary}`}>{formatRupiah(totalPemasukan)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Toggle Type */}
              <div className={`${cardBg} rounded-xl border ${borderColor} p-1.5 flex gap-1.5 mb-6 max-w-md mx-auto`}>
                <button
                  onClick={() => {
                    setTransactionType('expense');
                    setCategory('Makanan & Minuman');
                    setAmountString('');
                    setShowCustomInput(false);
                    setCustomCategory('');
                  }}
                  className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all ${
                    transactionType === 'expense'
                      ? 'bg-rose-500 text-white shadow-md'
                      : `${textSecondary} hover:bg-gray-100 dark:hover:bg-gray-700`
                  }`}
                >
                  <span className="material-symbols-outlined text-base mr-2">arrow_downward</span>
                  Pengeluaran
                </button>
                <button
                  onClick={() => {
                    setTransactionType('income');
                    setCategory('Gaji Bulanan');
                    setAmountString('');
                    setShowCustomInput(false);
                    setCustomCategory('');
                  }}
                  className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all ${
                    transactionType === 'income'
                      ? 'bg-[#00685f] text-white shadow-md'
                      : `${textSecondary} hover:bg-gray-100 dark:hover:bg-gray-700`
                  }`}
                >
                  <span className="material-symbols-outlined text-base mr-2">arrow_upward</span>
                  Pemasukan
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Nominal Input */}
                <div className="space-y-6">
                  <div className={`${cardBg} rounded-xl border ${borderColor} p-6 text-center shadow-sm`}>
                    <label className={`text-xs font-semibold ${textSecondary} uppercase tracking-wider block mb-2`}>
                      Total Nominal
                    </label>
                    <div className={`text-3xl font-black tracking-tight ${
                      transactionType === 'expense' ? 'text-rose-600' : 'text-[#00685f]'
                    }`}>
                      {amountString ? formatRupiah(parseFloat(amountString)) : 'Rp 0'}
                    </div>
                    
                    {amountString && amountString !== '0' && (
                      <div className="mt-3 text-sm">
                        <p className={`${textSecondary}`}>Sisa budget setelah transaksi:</p>
                        <p className={`font-bold ${previewRemaining < 0 ? 'text-rose-600' : 'text-[#00685f]'}`}>
                          {formatRupiah(previewRemaining)}
                        </p>
                      </div>
                    )}

                    {isBalanceInsufficient && (
                      <div className="mt-3 p-2 bg-rose-50 border border-rose-200 rounded-lg">
                        <p className="text-xs text-rose-700 flex items-center justify-center gap-1">
                          <span className="material-symbols-outlined text-sm">warning</span>
                          Saldo tidak mencukupi!
                        </p>
                      </div>
                    )}

                    {transactionType === 'expense' && amountString && parseFloat(amountString) > 5000000 && (
                      <div className="mt-3 text-xs text-amber-600 bg-amber-50 inline-block px-3 py-1 rounded-full">
                        ⚠️ Transaksi besar (di atas 5 juta)
                      </div>
                    )}
                  </div>

                  {/* Number Pad */}
                  <div className={`${cardBg} rounded-xl border ${borderColor} p-6 shadow-sm`}>
                    <div className="grid grid-cols-3 gap-3">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                        <button
                          key={num}
                          onClick={() => handleKeyPress(num)}
                          className={`py-4 text-xl font-bold ${textPrimary} bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95 rounded-xl transition-all`}
                        >
                          {num}
                        </button>
                      ))}
                      <button
                        onClick={() => handleKeyPress('.')}
                        className={`py-4 text-xl font-bold ${textPrimary} bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95 rounded-xl transition-all`}
                      >
                        .
                      </button>
                      <button
                        onClick={() => handleKeyPress(0)}
                        className={`py-4 text-xl font-bold ${textPrimary} bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95 rounded-xl transition-all`}
                      >
                        0
                      </button>
                      <button
                        onClick={() => handleKeyPress('backspace')}
                        className="py-4 text-rose-600 bg-rose-50 hover:bg-rose-100 active:scale-95 rounded-xl transition-all flex items-center justify-center"
                      >
                        <span className="material-symbols-outlined">backspace</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Column - Category & Note */}
                <div className="space-y-6">
                  <div className={`${cardBg} rounded-xl border ${borderColor} p-6 shadow-sm`}>
                    <label className={`text-xs font-semibold ${textSecondary} uppercase tracking-wider block mb-4`}>
                      Pilih Kategori
                    </label>
                    <div className="grid grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
                      {currentCategories.map(cat => (
                        <button
                          key={cat}
                          onClick={() => handleCategorySelect(cat)}
                          className={`py-3 px-4 rounded-lg text-sm font-medium text-center transition-all ${
                            category === cat
                              ? transactionType === 'expense'
                                ? 'bg-rose-50 text-rose-600 border-2 border-rose-200'
                                : 'bg-[#00685f]/5 text-[#00685f] border-2 border-[#00685f]/20'
                              : `bg-gray-50 dark:bg-gray-800 ${textSecondary} border-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-700`
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {/* Input custom untuk kategori "Lainnya" */}
                    {showCustomInput && (
                      <div className="mt-3">
                        <input
                          type="text"
                          placeholder="Tulis kategori lainnya..."
                          value={customCategory}
                          onChange={(e) => {
                            setCustomCategory(e.target.value);
                            setCategory(e.target.value);
                          }}
                          className={`w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border ${borderColor} rounded-lg text-sm ${textPrimary} focus:outline-none focus:border-[#00685f] focus:ring-1 focus:ring-[#00685f]`}
                        />
                        <p className="text-[10px] text-gray-400 mt-1">
                          Kategori akan tersimpan untuk transaksi ini
                        </p>
                      </div>
                    )}
                  </div>

                  <div className={`${cardBg} rounded-xl border ${borderColor} p-6 shadow-sm`}>
                    <label className={`text-xs font-semibold ${textSecondary} uppercase tracking-wider block mb-2`}>
                      Catatan (Opsional)
                    </label>
                    <textarea
                      rows="3"
                      placeholder="Contoh: Makan siang di restoran, Beli baju baru, dll..."
                      value={note}
                      onChange={e => setNote(e.target.value)}
                      maxLength={200}
                      className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border ${borderColor} rounded-lg text-sm font-medium ${textPrimary} focus:outline-none focus:border-[#00685f] focus:ring-1 focus:ring-[#00685f] resize-none`}
                    />
                    <div className="text-right text-xs text-gray-400 mt-1">
                      {note.length}/200 karakter
                    </div>
                  </div>

                  <button
                    onClick={handleSaveTransaction}
                    disabled={loading || !amountString || amountString === '0' || isBalanceInsufficient}
                    className={`w-full py-4 rounded-xl font-bold shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
                      transactionType === 'expense'
                        ? 'bg-rose-600 hover:bg-rose-700 text-white'
                        : 'bg-[#00685f] hover:bg-[#005049] text-white'
                    } ${(loading || !amountString || amountString === '0' || isBalanceInsufficient) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {loading ? (
                      <>
                        <span className="material-symbols-outlined animate-spin">progress_activity</span>
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined">save</span>
                        Simpan {transactionType === 'expense' ? 'Pengeluaran' : 'Pemasukan'}
                      </>
                    )}
                  </button>

                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-100 dark:border-blue-800">
                    <div className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-blue-500 text-sm">info</span>
                      <div className="text-xs text-blue-700 dark:text-blue-300">
                        <p className="font-semibold mb-1">💡 Tips & Aturan:</p>
                        <ul className="list-disc list-inside space-y-0.5">
                          <li>Minimal transaksi Rp 1.000</li>
                          <li>Maksimal transaksi Rp 10 Miliar</li>
                          <li>Pengeluaran tidak boleh melebihi sisa budget</li>
                          <li>Transaksi di atas Rp 5.000.000 akan dikonfirmasi</li>
                          <li>Pilih "Lainnya" jika kategori tidak tersedia, lalu tulis kategori custom</li>
                          <li>Isi catatan agar mudah dilacak</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TransactionPage;