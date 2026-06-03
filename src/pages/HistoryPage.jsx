import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';
import { formatRupiah } from '../utils/format';

function HistoryPage() {
  const navigate = useNavigate();
  const { isDarkMode, bgColor, cardBg, borderColor, textPrimary, textSecondary } = useThemeStyles();
  const { t, tc } = useLanguage();
  
  const [userData, setUserData] = useState({ name: '', email: '' });
  const [transactions, setTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState('semua');
  const [typeFilter, setTypeFilter] = useState('semua'); 
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [sortOrder, setSortOrder] = useState('desc');

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const storedName = localStorage.getItem('user_name');
    const storedEmail = localStorage.getItem('user_email');
    setUserData({
      name: storedName || t('user') || 'Pengguna',
      email: storedEmail || 'email@example.com'
    });
  }, [t]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return t('today');
    if (diffDays === 1) return t('yesterday') || 'Kemarin';
    if (diffDays <= 7) return `${diffDays} ${t('daysAgo') || 'hari lalu'}`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const fetchTransactions = useCallback(async (reset = true) => {
    if (reset) {
      setLoading(true);
      setPage(1);
      setHasMore(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const params = new URLSearchParams();
      params.append('limit', ITEMS_PER_PAGE);
      params.append('page', reset ? 1 : page);
      
      // Filter tipe
      if (typeFilter !== 'semua') {
        params.append('type', typeFilter);
      }
      
      // Filter waktu
      const now = new Date();
      if (timeFilter === 'hariIni') {
        params.append('startDate', now.toISOString().split('T')[0]);
      } else if (timeFilter === 'mingguIni') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        params.append('startDate', oneWeekAgo.toISOString().split('T')[0]);
      } else if (timeFilter === 'bulanIni') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        params.append('startDate', startOfMonth.toISOString().split('T')[0]);
      }

      const response = await api.get(`/transactions?${params.toString()}`);
      
      let newTransactions = response.data.transactions || [];
      
      // Filter search
      if (searchQuery) {
        newTransactions = newTransactions.filter(trx => 
          (trx.description && trx.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (trx.category && trx.category.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }
      
      // Sorting
      newTransactions.sort((a, b) => {
        const dateA = new Date(a.date || a.createdAt);
        const dateB = new Date(b.date || b.createdAt);
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      });

      if (reset) {
        setTransactions(newTransactions);
      } else {
        setTransactions(prev => [...prev, ...newTransactions]);
      }
      
      setTotalCount(response.data.count || newTransactions.length);
      setHasMore(newTransactions.length === ITEMS_PER_PAGE);
      
      if (!reset) {
        setPage(prev => prev + 1);
      }
    } catch (error) {
      console.error('Gagal mengambil transaksi:', error);
      if (error.response?.status === 401) {
        localStorage.clear();
        navigate('/login');
      } else {
        showToast(t('errorOccurred'), 'error');
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [typeFilter, timeFilter, searchQuery, sortOrder, page, navigate, t]);

  useEffect(() => {
    fetchTransactions(true);
  }, [typeFilter, timeFilter, searchQuery, sortOrder, fetchTransactions]);

  const handleDeleteTransaction = async (id) => {
    try {
      await api.delete(`/transactions/${id}`);
      showToast(t('deleteSuccess'), 'success');
      fetchTransactions(true);
    } catch (error) {
      console.error('Gagal menghapus transaksi:', error);
      showToast(error.response?.data?.message || t('errorOccurred'), 'error');
    } finally {
      setShowDeleteConfirm(null);
    }
  };

  const handleExportCSV = () => {
    const filtered = transactions;
    if (filtered.length === 0) {
      showToast(t('noTransactions'), 'error');
      return;
    }

    const headers = [t('date'), t('type'), t('category'), t('description'), t('amount')];
    const csvData = filtered.map(trx => [
      trx.date,
      trx.type === 'expense' ? t('expense') : t('income'),
      trx.category,
      trx.description || '-',
      trx.type === 'expense' ? `-${trx.amount}` : trx.amount
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showToast(t('saveSuccess'), 'success');
  };

  const statistics = {
    totalIncome: transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0),
    totalExpense: transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0),
    totalTransactions: transactions.length
  };

  const userInitial = userData.name ? userData.name.charAt(0).toUpperCase() : 'U';

  const getCategoryIconColor = (category, type) => {
    if (category === 'Transfer ke Tabungan') return 'text-emerald-600 dark:text-emerald-400';
    if (category === 'Tarik dari Tabungan') return 'text-amber-600 dark:text-amber-400';
    if (type === 'expense') return 'text-rose-600 dark:text-rose-400';
    return 'text-emerald-600 dark:text-emerald-400';
  };

  const getCategoryIconBg = (category, type) => {
    if (category === 'Transfer ke Tabungan') return 'bg-emerald-50 dark:bg-emerald-900/20';
    if (category === 'Tarik dari Tabungan') return 'bg-amber-50 dark:bg-amber-900/20';
    if (type === 'expense') return 'bg-rose-50 dark:bg-rose-900/20';
    return 'bg-emerald-50 dark:bg-emerald-900/20';
  };

  if (loading && transactions.length === 0) {
    return (
      <div className={`min-h-screen ${bgColor} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00685f] mx-auto mb-4"></div>
          <p className={textSecondary}>{t('loading')}</p>
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
        .toast-slide {
          animation: slideDown 0.3s ease forwards;
        }
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

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardBg} rounded-2xl max-w-md w-full shadow-xl overflow-hidden`}>
            <div className={`p-5 border-b ${borderColor}`}>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-2xl text-rose-600">warning</span>
                <h3 className={`text-lg font-bold ${textPrimary}`}>{t('deleteConfirm') || 'Hapus Transaksi?'}</h3>
              </div>
            </div>
            <div className="p-5">
              <p className={`${textSecondary} mb-2`}>
                {t('deleteWarning') || 'Apakah Anda yakin ingin menghapus transaksi ini?'}
              </p>
              <p className={`text-sm ${textSecondary}`}>{t('deleteUndone') || 'Tindakan ini tidak dapat dibatalkan.'}</p>
            </div>
            <div className={`p-5 border-t ${borderColor} flex gap-3`}>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
                {t('cancel')}
              </button>
              <button
                onClick={() => handleDeleteTransaction(showDeleteConfirm)}
                className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition-all"
              >
                {t('delete') || 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex h-screen overflow-hidden">
        <Sidebar userData={userData} userAvatar={null} userInitial={userInitial} />

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className={`${cardBg} border-b ${borderColor} px-4 md:px-6 py-4 sticky top-0 z-10 flex-shrink-0`}>
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
              <div>
                <h1 className={`text-xl font-bold ${textPrimary}`}>{t('activityHistory')}</h1>
                <p className={`text-xs ${textSecondary} mt-0.5`}>
                  {t('manageTransactions')}
                </p>
              </div>
              <button
                onClick={handleExportCSV}
                className={`flex items-center justify-center gap-2 bg-[#00685f] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#005049] transition-all shadow-sm`}
              >
                <span className="material-symbols-outlined text-base">download</span>
                {t('exportCSV')}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6">
            <div className="max-w-6xl mx-auto space-y-5">
              
              {/* Statistik */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                <div className={`${cardBg} rounded-lg border ${borderColor} shadow-sm p-4`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-xs ${textSecondary}`}>{t('totalTransactions')}</p>
                      <p className={`text-xl md:text-2xl font-bold ${textPrimary}`}>{statistics.totalTransactions}</p>
                    </div>
                    <span className="material-symbols-outlined text-2xl md:text-3xl text-gray-400 dark:text-gray-500">receipt_long</span>
                  </div>
                </div>
                <div className={`${cardBg} rounded-lg border ${borderColor} shadow-sm p-4`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-xs ${textSecondary}`}>{t('totalIncome')}</p>
                      <p className="text-base md:text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatRupiah(statistics.totalIncome)}</p>
                    </div>
                    <span className="material-symbols-outlined text-2xl md:text-3xl text-emerald-500 dark:text-emerald-400">arrow_upward</span>
                  </div>
                </div>
                <div className={`${cardBg} rounded-lg border ${borderColor} shadow-sm p-4`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-xs ${textSecondary}`}>{t('totalExpense')}</p>
                      <p className="text-base md:text-2xl font-bold text-rose-600 dark:text-rose-400">{formatRupiah(statistics.totalExpense)}</p>
                    </div>
                    <span className="material-symbols-outlined text-2xl md:text-3xl text-rose-500 dark:text-rose-400">arrow_downward</span>
                  </div>
                </div>
              </div>

              {/* Filter */}
              <div className={`${cardBg} rounded-xl border ${borderColor} shadow-sm p-4 md:p-5`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base">search</span>
                    <input
                      type="text"
                      placeholder={t('search')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full pl-9 pr-3 py-2 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-900'} border ${borderColor} rounded-lg text-sm focus:outline-none focus:border-[#00685f]`}
                    />
                  </div>

                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className={`px-3 py-2 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-900'} border ${borderColor} rounded-lg text-sm focus:outline-none focus:border-[#00685f]`}
                  >
                    <option value="semua">{t('allTypes')}</option>
                    <option value="income">{t('income')}</option>
                    <option value="expense">{t('expense')}</option>
                  </select>

                  <select
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value)}
                    className={`px-3 py-2 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-900'} border ${borderColor} rounded-lg text-sm focus:outline-none focus:border-[#00685f]`}
                  >
                    <option value="semua">{t('allTime')}</option>
                    <option value="hariIni">{t('today')}</option>
                    <option value="mingguIni">{t('thisWeek')}</option>
                    <option value="bulanIni">{t('thisMonth')}</option>
                  </select>

                  <button
                    onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                    className={`flex items-center justify-center gap-2 px-3 py-2 ${isDarkMode ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'} border ${borderColor} rounded-lg text-sm transition-all`}
                  >
                    <span className="material-symbols-outlined text-base">
                      {sortOrder === 'desc' ? 'arrow_downward' : 'arrow_upward'}
                    </span>
                    {sortOrder === 'desc' ? t('newest') : t('oldest')}
                  </button>
                </div>
              </div>

              {/* Tabel Transaksi */}
              <div className={`${cardBg} rounded-xl border ${borderColor} shadow-sm overflow-hidden`}>
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} border-b ${borderColor}`}>
                      <tr>
                        <th className={`text-left px-6 py-3 text-xs font-semibold ${textSecondary}`}>{t('date')}</th>
                        <th className={`text-left px-6 py-3 text-xs font-semibold ${textSecondary}`}>{t('category')}</th>
                        <th className={`text-left px-6 py-3 text-xs font-semibold ${textSecondary}`}>{t('description')}</th>
                        <th className={`text-right px-6 py-3 text-xs font-semibold ${textSecondary}`}>{t('amount')}</th>
                        <th className={`text-center px-6 py-3 text-xs font-semibold ${textSecondary}`}>{t('action')}</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${borderColor}`}>
                      {transactions.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center py-12">
                            <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600 mb-2">inbox</span>
                            <p className={`text-sm ${textSecondary}`}>{t('noTransactions')}</p>
                            <button onClick={() => navigate('/transaction')} className="mt-3 text-xs text-[#00685f] font-medium hover:underline">+ {t('firstTransaction')}</button>
                          </td>
                        </tr>
                      ) : (
                        transactions.map((transaction) => (
                          <tr key={transaction.id} className={`${isDarkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'} transition-all`}>
                            <td className="px-6 py-3">
                              <div className={`text-xs font-medium ${textPrimary}`}>{formatDate(transaction.date)}</div>
                              <div className={`text-[10px] ${textSecondary}`}>{transaction.date}</div>
                            </td>
                            <td className="px-6 py-3">
                              <div className="flex items-center gap-2">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${getCategoryIconBg(transaction.category, transaction.type)}`}>
                                  <span className={`material-symbols-outlined text-sm ${getCategoryIconColor(transaction.category, transaction.type)}`}>
                                    {transaction.type === 'expense' ? (transaction.category === 'Transfer ke Tabungan' ? 'savings' : 'shopping_bag') : 'payments'}
                                  </span>
                                </div>
                                <span className={`text-xs font-medium ${textPrimary}`}>{transaction.category}</span>
                              </div>
                            </td>
                            <td className="px-6 py-3">
                              <span className={`text-xs ${textSecondary}`}>{transaction.description || '-'}</span>
                            </td>
                            <td className={`px-6 py-3 text-right text-sm font-bold ${
                              transaction.type === 'expense' 
                                ? (transaction.category === 'Transfer ke Tabungan' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400')
                                : 'text-emerald-600 dark:text-emerald-400'
                            }`}>
                              {transaction.type === 'expense' ? '-' : '+'}{formatRupiah(transaction.amount)}
                            </td>
                            <td className="px-6 py-3 text-center">
                              <button onClick={() => setShowDeleteConfirm(transaction.id)} className="text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition-all" title={t('delete')}>
                                <span className="material-symbols-outlined text-base">delete</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View */}
                <div className="block md:hidden divide-y ${borderColor}">
                  {transactions.length === 0 ? (
                    <div className="text-center py-12">
                      <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600 mb-2">inbox</span>
                      <p className={`text-sm ${textSecondary}`}>{t('noTransactions')}</p>
                      <button onClick={() => navigate('/transaction')} className="mt-3 text-xs text-[#00685f] font-medium hover:underline">+ {t('firstTransaction')}</button>
                    </div>
                  ) : (
                    transactions.map((transaction) => (
                      <div key={transaction.id} className={`p-4 border-b ${borderColor}`}>
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2 flex-1">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${getCategoryIconBg(transaction.category, transaction.type)}`}>
                              <span className={`material-symbols-outlined text-base ${getCategoryIconColor(transaction.category, transaction.type)}`}>
                                {transaction.type === 'expense' ? (transaction.category === 'Transfer ke Tabungan' ? 'savings' : 'shopping_bag') : 'payments'}
                              </span>
                            </div>
                            <div className="flex-1">
                              <p className={`text-sm font-semibold ${textPrimary}`}>{transaction.category}</p>
                              <p className={`text-[10px] ${textSecondary} mt-0.5`}>{transaction.description || t('noDescription') || 'Tidak ada catatan'}</p>
                            </div>
                          </div>
                          <button onClick={() => setShowDeleteConfirm(transaction.id)} className="text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition-all p-1 flex-shrink-0">
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t ${borderColor}">
                          <div>
                            <p className={`text-[10px] ${textSecondary}`}>{formatDate(transaction.date)}</p>
                            <p className={`text-[9px] ${textSecondary} mt-0.5`}>{transaction.date}</p>
                          </div>
                          <p className={`text-sm font-bold ${
                            transaction.type === 'expense'
                              ? (transaction.category === 'Transfer ke Tabungan' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400')
                              : 'text-emerald-600 dark:text-emerald-400'
                          }`}>
                            {transaction.type === 'expense' ? '-' : '+'}{formatRupiah(transaction.amount)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {hasMore && transactions.length > 0 && (
                  <div className={`p-4 border-t ${borderColor} text-center`}>
                    <button onClick={() => fetchTransactions(false)} disabled={loadingMore} className="px-6 py-2 text-sm font-medium text-[#00685f] hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-all disabled:opacity-50">
                      {loadingMore ? (
                        <span className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#00685f] border-t-transparent"></div>
                          {t('loading')}
                        </span>
                      ) : (
                        t('loadMore')
                      )}
                    </button>
                  </div>
                )}
              </div>

              {transactions.length > 0 && (
                <div className={`text-center text-xs ${textSecondary}`}>
                  {t('showing') || 'Menampilkan'} {transactions.length} {t('of') || 'dari'} {totalCount} {t('transactions') || 'transaksi'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HistoryPage;