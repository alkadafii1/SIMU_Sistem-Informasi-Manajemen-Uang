import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

function HistoryPage() {
  const navigate = useNavigate();
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
      name: storedName || 'Pengguna',
      email: storedEmail || 'email@example.com'
    });
  }, []);

  // Cek autentikasi
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

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(angka);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hari ini';
    if (diffDays === 1) return 'Kemarin';
    if (diffDays <= 7) return `${diffDays} hari lalu`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Fetch transactions dengan pagination dan filter
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
      
      // Filter berdasarkan tipe
      if (typeFilter !== 'semua') {
        params.append('type', typeFilter);
      }
      
      // Filter berdasarkan tanggal
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
        showToast('Gagal memuat data transaksi', 'error');
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [typeFilter, timeFilter, searchQuery, sortOrder, page]);

  useEffect(() => {
    fetchTransactions(true);
  }, [typeFilter, timeFilter, searchQuery, sortOrder]);

  // Handle delete transaction
  const handleDeleteTransaction = async (id) => {
    try {
      await api.delete(`/transactions/${id}`);
      showToast('Transaksi berhasil dihapus', 'success');
      // Refresh list
      fetchTransactions(true);
    } catch (error) {
      console.error('Gagal menghapus transaksi:', error);
      showToast(error.response?.data?.message || 'Gagal menghapus transaksi', 'error');
    } finally {
      setShowDeleteConfirm(null);
    }
  };

  // Export ke CSV
  const handleExportCSV = () => {
    const filtered = getFilteredTransactions();
    if (filtered.length === 0) {
      showToast('Tidak ada data untuk diekspor', 'error');
      return;
    }

    const headers = ['Tanggal', 'Tipe', 'Kategori', 'Deskripsi', 'Jumlah'];
    const csvData = filtered.map(trx => [
      trx.date,
      trx.type === 'expense' ? 'Pengeluaran' : 'Pemasukan',
      trx.category,
      trx.description || '-',
      trx.type === 'expense' ? `-${trx.amount}` : trx.amount
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
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

  // Get filtered transactions untuk export
  const getFilteredTransactions = () => {
    let filtered = [...transactions];
    
    if (typeFilter !== 'semua') {
      filtered = filtered.filter(trx => trx.type === typeFilter);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(trx => 
        (trx.description && trx.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (trx.category && trx.category.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    return filtered;
  };

  // Hitung statistik
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

  if (loading && transactions.length === 0) {
    return (
      <div className="min-h-screen bg-[#f9f9ff] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00685f] mx-auto mb-4"></div>
          <p className="text-gray-500">Memuat riwayat transaksi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f9f9ff] text-[#151c27] h-screen flex overflow-hidden font-sans antialiased">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        .material-symbols-outlined { 
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; 
          display: inline-block; 
          line-height: 1; 
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

      {/* Confirm Delete Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md mx-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-3xl text-rose-600">warning</span>
              <h3 className="text-lg font-bold text-gray-800">Hapus Transaksi?</h3>
            </div>
            <p className="text-gray-600 mb-2">
              Apakah Anda yakin ingin menghapus transaksi ini?
            </p>
            <p className="text-sm text-gray-500 mb-6">Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 font-medium hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={() => handleDeleteTransaction(showDeleteConfirm)}
                className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-5 sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Manrope, sans-serif' }}>
                Riwayat Aktivitas
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Kelola dan lihat semua transaksi keuangan Anda
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                Export CSV
              </button>
              <button
                onClick={() => navigate('/transaction')}
                className="flex items-center gap-2 bg-[#00685f] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#005049] transition-all"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                Catat Transaksi
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Statistik Ringkasan */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Total Transaksi</p>
                    <p className="text-2xl font-bold text-gray-800">{statistics.totalTransactions}</p>
                  </div>
                  <span className="material-symbols-outlined text-3xl text-gray-400">receipt_long</span>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Total Pemasukan</p>
                    <p className="text-2xl font-bold text-emerald-600">{formatRupiah(statistics.totalIncome)}</p>
                  </div>
                  <span className="material-symbols-outlined text-3xl text-emerald-500">arrow_upward</span>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Total Pengeluaran</p>
                    <p className="text-2xl font-bold text-rose-600">{formatRupiah(statistics.totalExpense)}</p>
                  </div>
                  <span className="material-symbols-outlined text-3xl text-rose-500">arrow_downward</span>
                </div>
              </div>
            </div>

            {/* Filter Section */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base">search</span>
                  <input
                    type="text"
                    placeholder="Cari transaksi..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#00685f]"
                  />
                </div>

                {/* Filter Tipe */}
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#00685f]"
                >
                  <option value="semua">Semua Tipe</option>
                  <option value="income">Pemasukan</option>
                  <option value="expense">Pengeluaran</option>
                </select>

                {/* Filter Waktu */}
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#00685f]"
                >
                  <option value="semua">Semua Waktu</option>
                  <option value="hariIni">Hari Ini</option>
                  <option value="mingguIni">Minggu Ini</option>
                  <option value="bulanIni">Bulan Ini</option>
                </select>

                {/* Sort Order */}
                <button
                  onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm hover:bg-gray-100 transition-all"
                >
                  <span className="material-symbols-outlined text-base">
                    {sortOrder === 'desc' ? 'arrow_downward' : 'arrow_upward'}
                  </span>
                  {sortOrder === 'desc' ? 'Terbaru' : 'Terlama'}
                </button>
              </div>
            </div>

            {/* Transactions List */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">Tanggal</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">Kategori</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">Deskripsi</th>
                      <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500">Jumlah</th>
                      <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-12">
                          <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">inbox</span>
                          <p className="text-sm text-gray-400">Belum ada transaksi</p>
                          <button
                            onClick={() => navigate('/transaction')}
                            className="mt-3 text-xs text-[#00685f] font-medium hover:underline"
                          >
                            + Catat transaksi pertama
                          </button>
                        </td>
                      </tr>
                    ) : (
                      transactions.map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-gray-50 transition-all">
                          <td className="px-6 py-3">
                            <div className="text-xs font-medium text-gray-800">{formatDate(transaction.date)}</div>
                            <div className="text-[10px] text-gray-400">{transaction.date}</div>
                          </td>
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-2">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                transaction.type === 'expense' ? 'bg-rose-100' : 'bg-emerald-100'
                              }`}>
                                <span className="material-symbols-outlined text-xs">
                                  {transaction.type === 'expense' ? 'shopping_bag' : 'payments'}
                                </span>
                              </div>
                              <span className="text-xs font-medium text-gray-700">{transaction.category}</span>
                            </div>
                          </td>
                          <td className="px-6 py-3">
                            <span className="text-xs text-gray-600">
                              {transaction.description || '-'}
                            </span>
                          </td>
                          <td className={`px-6 py-3 text-right text-sm font-bold ${
                            transaction.type === 'expense' ? 'text-rose-600' : 'text-emerald-600'
                          }`}>
                            {transaction.type === 'expense' ? '-' : '+'}{formatRupiah(transaction.amount)}
                          </td>
                          <td className="px-6 py-3 text-center">
                            <button
                              onClick={() => setShowDeleteConfirm(transaction.id)}
                              className="text-gray-400 hover:text-rose-600 transition-all"
                              title="Hapus transaksi"
                            >
                              <span className="material-symbols-outlined text-base">delete</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Load More Button */}
              {hasMore && transactions.length > 0 && (
                <div className="p-4 border-t border-gray-100 text-center">
                  <button
                    onClick={() => fetchTransactions(false)}
                    disabled={loadingMore}
                    className="px-6 py-2 text-sm font-medium text-[#00685f] hover:bg-gray-50 rounded-lg transition-all disabled:opacity-50"
                  >
                    {loadingMore ? (
                      <span className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#00685f] border-t-transparent"></div>
                        Memuat...
                      </span>
                    ) : (
                      'Muat Lebih Banyak'
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Info Footer */}
            {transactions.length > 0 && (
              <div className="text-center text-xs text-gray-400">
                Menampilkan {transactions.length} dari {totalCount} transaksi
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HistoryPage;