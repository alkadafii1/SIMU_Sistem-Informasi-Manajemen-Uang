import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';
import { formatRupiah } from '../utils/format';
import Spinner from '../components/Spinner';

function HistoryPage() {
  const navigate = useNavigate();
  const { isDarkMode, bgColor, cardBg, borderColor, textPrimary, textSecondary } = useThemeStyles();
  const { t, tc } = useLanguage();

  const [userData, setUserData] = useState({ name: '', email: '' });
  const [allTransactions, setAllTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [displayedTransactions, setDisplayedTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState('semua');
  const [typeFilter, setTypeFilter] = useState('semua');
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState('desc');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const storedName = localStorage.getItem('user_name');
    const storedEmail = localStorage.getItem('user_email');
    setUserData({
      name: storedName || 'Pengguna',
      email: storedEmail || 'email@example.com'
    });
  }, []);

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
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const transactionDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffDays = Math.floor((today - transactionDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hari ini';
    if (diffDays === 1) return 'Kemarin';
    if (diffDays <= 7) return `${diffDays} hari lalu`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Icon functions
  const getTransactionIcon = (type, category) => {
    if (type === 'income' && category !== 'Tarik dari Tabungan') return 'payments';
    if (category === 'Transfer ke Tabungan') return 'savings';
    if (category === 'Tarik dari Tabungan') return 'arrow_upward';
    const expenseIcons = {
      'Makanan & Minuman': 'restaurant',
      'Belanja Harian': 'shopping_cart',
      'Transportasi': 'directions_car',
      'Tagihan & Utilitas': 'receipt',
      'Hiburan & Hobi': 'sports_esports',
      'Kesehatan': 'health_and_safety',
      'Pendidikan': 'school',
      'Investasi': 'trending_up',
    };
    return expenseIcons[category] || 'shopping_bag';
  };

  const getIconBgColor = (category, type) => {
    if (category === 'Transfer ke Tabungan') {
      return isDarkMode ? 'bg-rose-900/40 text-rose-400' : 'bg-rose-50 text-rose-500';
    }
    if (category === 'Tarik dari Tabungan') {
      return isDarkMode ? 'bg-amber-900/40 text-amber-400' : 'bg-amber-50 text-amber-600';
    }
    if (type === 'expense') {
      return isDarkMode ? 'bg-rose-900/40 text-rose-400' : 'bg-rose-50 text-rose-500';
    }
    return isDarkMode ? 'bg-teal-900/40 text-teal-400' : 'bg-teal-50 text-teal-700';
  };

  const getAmountColor = (type, category) => {
    const isExpense = type === 'expense';
    const isTransfer = category === 'Transfer ke Tabungan';
    const isWithdraw = category === 'Tarik dari Tabungan';
    if (isExpense || isTransfer) {
      return isDarkMode ? 'text-rose-400' : 'text-rose-600';
    }
    if (isWithdraw) {
      return isDarkMode ? 'text-amber-400' : 'text-amber-600';
    }
    return isDarkMode ? 'text-emerald-400' : 'text-emerald-600';
  };

  const applyFiltersAndSort = useCallback(() => {
    let filtered = [...allTransactions];
    
    // Filter by type
    if (typeFilter !== 'semua') {
      filtered = filtered.filter(t => t.type === typeFilter);
    }
    
    // Filter by time range
    const now = new Date();
    if (timeFilter === 'hariIni') {
      const todayStr = now.toISOString().split('T')[0];
      filtered = filtered.filter(t => t.date === todayStr);
    } else if (timeFilter === 'mingguIni') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      const startStr = startOfWeek.toISOString().split('T')[0];
      filtered = filtered.filter(t => t.date >= startStr);
    } else if (timeFilter === 'bulanIni') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startStr = startOfMonth.toISOString().split('T')[0];
      filtered = filtered.filter(t => t.date >= startStr);
    }
    
    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        (t.description && t.description.toLowerCase().includes(query)) ||
        (t.category && t.category.toLowerCase().includes(query))
      );
    }
    
    // SORT (client-side, langsung)
    filtered.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
    
    setFilteredTransactions(filtered);
    
    // Update pagination
    setCurrentPage(1);
    const newDisplayed = filtered.slice(0, ITEMS_PER_PAGE);
    setDisplayedTransactions(newDisplayed);
    setHasMore(filtered.length > ITEMS_PER_PAGE);
  }, [allTransactions, typeFilter, timeFilter, searchQuery, sortOrder]);

  // Panggil filter setiap kali ada perubahan
  useEffect(() => {
    if (allTransactions.length > 0) {
      applyFiltersAndSort();
    }
  }, [allTransactions, typeFilter, timeFilter, searchQuery, sortOrder, applyFiltersAndSort]);

  // Fetch all data sekali saja
  const fetchAllTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/transactions?limit=1000&page=1');
      setAllTransactions(response.data.transactions || []);
    } catch (error) {
      console.error('Gagal mengambil transaksi:', error);
      if (error.response?.status === 401) {
        localStorage.clear();
        navigate('/login');
      } else {
        showToast('Gagal memuat data', 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchAllTransactions();
  }, []);

  // Load more
  const loadMore = () => {
    const nextPage = currentPage + 1;
    const newDisplayed = filteredTransactions.slice(0, nextPage * ITEMS_PER_PAGE);
    setDisplayedTransactions(newDisplayed);
    setCurrentPage(nextPage);
    setHasMore(newDisplayed.length < filteredTransactions.length);
  };

  // Delete transaction
  const handleDeleteTransaction = async (id) => {
    try {
      await api.delete(`/transactions/${id}`);
      showToast('Transaksi berhasil dihapus', 'success');
      fetchAllTransactions();
    } catch (error) {
      console.error('Gagal menghapus transaksi:', error);
      showToast(error.response?.data?.message || 'Gagal menghapus transaksi', 'error');
    } finally {
      setShowDeleteConfirm(null);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      showToast('Tidak ada data untuk diekspor', 'error');
      return;
    }

    const headers = ['Tanggal', 'Tipe', 'Kategori', 'Deskripsi', 'Jumlah'];
    const csvData = filteredTransactions.map(trx => [
      trx.date,
      trx.type === 'expense' ? 'Pengeluaran' : 'Pemasukan',
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
    showToast('Data berhasil diekspor', 'success');
  };

  const totalIncomeTransactions = filteredTransactions.filter(t => t.type === 'income').length;
  const totalExpenseTransactions = filteredTransactions.filter(t => t.type === 'expense').length;
  const userInitial = userData.name ? userData.name.charAt(0).toUpperCase() : 'U';

  if (loading) {
    return <Spinner fullScreen text="Memuat riwayat transaksi..." />;
  }

  return (
    <div className={`min-h-screen ${bgColor}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; vertical-align: middle; }
        .toast-slide { animation: slideDown 0.3s ease forwards; }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Toast */}
      {toast.show && (
        <div className={`fixed top-5 left-1/2 transform -translate-x-1/2 z-50 toast-slide w-auto max-w-md px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 ${
          toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
        }`}>
          <span className="material-symbols-outlined text-xl">{toast.type === 'success' ? 'check_circle' : 'error'}</span>
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
      )}

      {/* Delete Confirm */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${cardBg} rounded-2xl max-w-md w-full shadow-xl overflow-hidden`}>
            <div className={`p-5 border-b ${borderColor}`}>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-2xl text-rose-600">warning</span>
                <h3 className={`text-lg font-bold ${textPrimary}`}>Hapus Transaksi?</h3>
              </div>
            </div>
            <div className="p-5">
              <p className={`${textSecondary} mb-2`}>Apakah Anda yakin ingin menghapus transaksi ini?</p>
              <p className={`text-sm ${textSecondary}`}>Tindakan ini tidak dapat dibatalkan.</p>
            </div>
            <div className={`p-5 border-t ${borderColor} flex gap-3`}>
              <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">Batal</button>
              <button onClick={() => handleDeleteTransaction(showDeleteConfirm)} className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition-all">Hapus</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex h-screen overflow-hidden">
        <Sidebar userData={userData} userAvatar={null} userInitial={userInitial} />

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className={`${cardBg} border-b ${borderColor} px-4 md:px-6 py-4 sticky top-0 z-10`}>
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
              <div>
                <h1 className={`text-xl font-bold ${textPrimary}`}>Riwayat Aktivitas</h1>
                <p className={`text-xs ${textSecondary} mt-0.5`}>Kelola dan lihat semua transaksi keuangan Anda</p>
              </div>
              <button onClick={handleExportCSV} className="flex items-center justify-center gap-2 bg-[#00685f] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#005049] transition-all shadow-sm">
                <span className="material-symbols-outlined text-base">download</span> Export CSV
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
                      <p className={`text-xs ${textSecondary}`}>Total Transaksi</p>
                      <p className={`text-xl md:text-2xl font-bold ${textPrimary}`}>{filteredTransactions.length}</p>
                    </div>
                    <span className="material-symbols-outlined text-2xl md:text-3xl text-gray-400 dark:text-gray-500">receipt_long</span>
                  </div>
                </div>
                <div className={`${cardBg} rounded-lg border ${borderColor} shadow-sm p-4`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-xs ${textSecondary}`}>Pemasukan</p>
                      <p className={`text-xl md:text-2xl font-bold text-emerald-600 dark:text-emerald-400`}>{totalIncomeTransactions}</p>
                    </div>
                    <span className="material-symbols-outlined text-2xl md:text-3xl text-emerald-500 dark:text-emerald-400">arrow_upward</span>
                  </div>
                </div>
                <div className={`${cardBg} rounded-lg border ${borderColor} shadow-sm p-4`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-xs ${textSecondary}`}>Pengeluaran</p>
                      <p className={`text-xl md:text-2xl font-bold text-rose-600 dark:text-rose-400`}>{totalExpenseTransactions}</p>
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
                    <input type="text" placeholder="Cari transaksi..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`w-full pl-9 pr-3 py-2 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-900'} border ${borderColor} rounded-lg text-sm focus:outline-none focus:border-[#00685f] focus:ring-1 focus:ring-[#00685f]`} />
                  </div>
                  <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={`px-3 py-2 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-900'} border ${borderColor} rounded-lg text-sm focus:outline-none focus:border-[#00685f] focus:ring-1 focus:ring-[#00685f]`}>
                    <option value="semua">Semua Tipe</option>
                    <option value="income">Pemasukan</option>
                    <option value="expense">Pengeluaran</option>
                  </select>
                  <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)} className={`px-3 py-2 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-900'} border ${borderColor} rounded-lg text-sm focus:outline-none focus:border-[#00685f] focus:ring-1 focus:ring-[#00685f]`}>
                    <option value="semua">Semua Waktu</option>
                    <option value="hariIni">Hari Ini</option>
                    <option value="mingguIni">Minggu Ini</option>
                    <option value="bulanIni">Bulan Ini</option>
                  </select>
                  <button onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')} className={`flex items-center justify-center gap-2 px-3 py-2 ${isDarkMode ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'} border ${borderColor} rounded-lg text-sm transition-all`}>
                    <span className="material-symbols-outlined text-base">{sortOrder === 'desc' ? 'arrow_downward' : 'arrow_upward'}</span>
                    {sortOrder === 'desc' ? 'Terbaru' : 'Terlama'}
                  </button>
                </div>
              </div>

              {/* List Transaksi */}
              <div className={`${cardBg} rounded-xl border ${borderColor} shadow-sm overflow-hidden`}>
                {displayedTransactions.length === 0 ? (
                  <div className="text-center py-12">
                    <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600 mb-2">inbox</span>
                    <p className={`text-sm ${textSecondary}`}>Belum ada transaksi</p>
                    <button onClick={() => navigate('/transaction')} className="mt-3 text-xs text-[#00685f] font-medium hover:underline">+ Catat transaksi pertama</button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {displayedTransactions.map((transaction) => {
                      const translatedCategory = tc(transaction.category, transaction.type);
                      const dateLabel = formatDate(transaction.date);
                      const isTransferToSavings = transaction.category === 'Transfer ke Tabungan';
                      return (
                        <div key={transaction.id} className={`flex items-center gap-3 p-4 hover:${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} transition-all duration-150`}>
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getIconBgColor(transaction.category, transaction.type)}`}>
                            <span className="material-symbols-outlined text-base">{getTransactionIcon(transaction.type, transaction.category)}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className={`text-sm font-semibold ${textPrimary} truncate max-w-[150px] sm:max-w-[200px]`}>{translatedCategory}</p>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                                {transaction.type === 'expense' || isTransferToSavings ? 'Pengeluaran' : 'Pemasukan'}
                              </span>
                            </div>
                            {transaction.description && transaction.description !== transaction.category && (
                              <p className={`text-[10px] ${textSecondary} truncate mt-0.5`}>{transaction.description}</p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-[9px] ${textSecondary}`}>{dateLabel}</span>
                              <span className={`text-[9px] ${textSecondary}`}>•</span>
                              <span className={`text-[9px] ${textSecondary}`}>{transaction.date}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <p className={`text-sm font-bold ${getAmountColor(transaction.type, transaction.category)}`}>
                              {transaction.type === 'expense' || isTransferToSavings ? '-' : '+'}{formatRupiah(transaction.amount)}
                            </p>
                            <button onClick={() => setShowDeleteConfirm(transaction.id)} className="text-gray-400 hover:text-rose-600 transition-all p-1" title="Hapus">
                              <span className="material-symbols-outlined text-base">delete</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Load More */}
                {hasMore && displayedTransactions.length > 0 && (
                  <div className="p-4 border-t border-gray-100 dark:border-gray-700 text-center">
                    <button onClick={loadMore} className="px-6 py-2 text-sm font-medium rounded-lg transition-all text-[#00685f] hover:bg-gray-50 dark:hover:bg-gray-800">Muat Lebih Banyak</button>
                  </div>
                )}
              </div>

              {/* Info Footer */}
              {filteredTransactions.length > 0 && (
                <div className="text-center text-xs text-gray-400 dark:text-gray-500">
                  Menampilkan {displayedTransactions.length} dari {filteredTransactions.length} transaksi
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