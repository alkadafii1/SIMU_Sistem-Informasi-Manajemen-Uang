import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Sidebar from '../components/Sidebar';

function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [userData, setUserData] = useState({ name: '', email: '' });
  const [userAvatar, setUserAvatar] = useState(null);
  const [setup, setSetup] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dailyBudget, setDailyBudget] = useState(0);
  const [weeklyExpenses, setWeeklyExpenses] = useState([0, 0, 0, 0, 0, 0, 0]);

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

  // Fetch data setup dan transaksi
  useEffect(() => {
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

        const sortedTransactions = [...allTransactions].sort((a, b) => 
          new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)
        );
        setTransactions(sortedTransactions);

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
              const dayIndex = txDate.getDay();
              weekExp[dayIndex] += tx.amount;
            }
          }
        });
        setWeeklyExpenses(weekExp);
      } catch (error) {
        console.error('Gagal fetch dashboard:', error);
        if (error.response?.status === 404) {
          navigate('/setup-financial');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [location, navigate]);

  // Popup welcome jika baru dari setup
  useEffect(() => {
    if (location.state?.fromSetup) {
      setShowWelcomePopup(true);
      setTimeout(() => setShowWelcomePopup(false), 5000);
    }
  }, [location.state]);

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(angka);
  };

  const userInitial = userData.name ? userData.name.charAt(0).toUpperCase() : 'U';

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#f9f9ff]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00685f]"></div>
      </div>
    );
  }

  if (!setup) return null;

  const { income, allocation } = setup;
  const pctKebutuhan = allocation.kebutuhan;
  const pctKeinginan = allocation.keinginan;
  const pctTabungan = allocation.tabungan;
  const budgetNeeds = (income * pctKebutuhan) / 100;
  const budgetWants = (income * pctKeinginan) / 100;
  const budgetSavings = (income * pctTabungan) / 100;

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalIncomeAmount = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalEffectiveIncome = income + totalIncomeAmount;
  const remainingBudget = totalEffectiveIncome - totalExpense;
  const savingsAchieved = remainingBudget;

  // Kategori untuk Needs dan Wants
  const needsCategories = ['Makanan & Minuman', 'Belanja Harian', 'Transportasi', 'Tagihan & Utilitas', 'Kesehatan', 'Pendidikan', 'Sewa', 'Cicilan'];
  const wantsCategories = ['Hiburan & Hobi', 'Makan di Luar', 'Belanja', 'Olahraga', 'Lainnya'];

  const totalExpenseNeeds = transactions
    .filter((t) => t.type === 'expense' && needsCategories.includes(t.category))
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenseWants = transactions
    .filter((t) => t.type === 'expense' && wantsCategories.includes(t.category))
    .reduce((sum, t) => sum + t.amount, 0);

  // Realisasi persentase terhadap budget masing-masing
  const needsUsedPercent = budgetNeeds > 0 ? (totalExpenseNeeds / budgetNeeds) * 100 : 0;
  const wantsUsedPercent = budgetWants > 0 ? (totalExpenseWants / budgetWants) * 100 : 0;
  const savingsPercent = budgetSavings > 0 ? (savingsAchieved / budgetSavings) * 100 : 0;

  // Donut chart untuk alokasi ideal
  const donutValues = [pctKebutuhan, pctKeinginan, pctTabungan];
  const donutColors = ['#00685f', '#66b5ad', '#b3d9d5'];
  let cumulativeOffset = 0;
  const donutSegments = donutValues.map((value) => {
    const dashArray = value;
    const offset = cumulativeOffset;
    cumulativeOffset += dashArray;
    return { dashArray, offset };
  });

  // Top kategori pengeluaran (3 terbesar)
  const expenseByCategory = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});
  const topCategories = Object.entries(expenseByCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  const categoryColors = ['#00685f', '#66b5ad', '#b3d9d5'];

  // Hitung total untuk donut kategori (sum dari topCategories)
  const totalTopCategories = topCategories.reduce((sum, [, amount]) => sum + amount, 0);
  let catCumulativeOffset = 0;
  const categoryDonutSegments = topCategories.map(([, amount], idx) => {
    const percent = totalTopCategories > 0 ? (amount / totalTopCategories) * 100 : 0;
    const dashArray = percent;
    const offset = catCumulativeOffset;
    catCumulativeOffset += dashArray;
    return { dashArray, offset, color: categoryColors[idx % categoryColors.length], category: topCategories[idx][0], amount };
  });

  // Grafik mingguan
  const maxWeekly = Math.max(...weeklyExpenses, 1);
  const weeklyHeights = weeklyExpenses.map((val) => (val / maxWeekly) * 60);
  const weekDays = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  return (
    <div className="bg-[#f9f9ff] text-[#151c27] min-h-screen flex flex-col md:flex-row font-sans antialiased">
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
      `}</style>

      {showWelcomePopup && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 font-semibold text-sm animate-bounce">
          <span className="material-symbols-outlined">check_circle</span>
          <span>Strategi Finansial Berhasil Diterapkan!</span>
        </div>
      )}

      <Sidebar userData={userData} userAvatar={userAvatar} userInitial={userInitial}/>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white/80 backdrop-blur-md px-4 py-3 md:px-8 md:py-4 flex justify-between items-center border-b border-slate-100 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="md:hidden w-9 h-9 rounded-full bg-[#d8e5e2] flex items-center justify-center font-bold text-[#00685f]">
              {userInitial}
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#00685f]" style={{ fontFamily: 'Manrope, sans-serif' }}>WealthFlow</h1>
              <p className="text-xs text-slate-400 hidden md:block">Ringkasan finansialmu</p>
            </div>
          </div>
          <button onClick={() => navigate('/transaction')} className="flex items-center gap-2 bg-[#00685f] text-white px-3 py-2 md:px-4 md:py-2.5 rounded-xl text-xs font-bold shadow-md transition-all active:scale-95">
            <span className="material-symbols-outlined text-sm">add</span>
            <span className="hidden md:inline">Catat Transaksi</span>
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-5 md:space-y-8 no-scrollbar">
          {/* Tiga kartu ringkasan */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
              <div className="text-xs text-slate-400 font-semibold">TOTAL PEMASUKAN</div>
              <div className="text-2xl font-extrabold text-slate-800 mt-1">{formatRupiah(totalEffectiveIncome)}</div>
            </div>
            <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
              <div className="text-xs text-slate-400 font-semibold">TOTAL PENGELUARAN</div>
              <div className="text-2xl font-extrabold text-slate-800 mt-1">{formatRupiah(totalExpense)}</div>
              <div className="text-xs text-amber-600 mt-2">
                Sisa limit anggaran {formatRupiah(income - totalExpense)}
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
              <div className="text-xs text-slate-400 font-semibold">TABUNGAN</div>
              <div className="text-2xl font-extrabold text-slate-800 mt-1">{formatRupiah(Math.max(0, savingsAchieved))}</div>
              <div className="text-xs text-emerald-600 mt-2">
                Mencapai {savingsPercent.toFixed(0)}% dari target bulan ini
              </div>
            </div>
          </div>

          {/* Rekomendasi Harian */}
          <div className="bg-white rounded-xl p-4 flex gap-3 border border-slate-100 shadow-sm">
            <span className="material-symbols-outlined text-[#00685f]">lightbulb</span>
            <div>
              <div className="text-[10px] font-bold text-[#00685f] uppercase tracking-wide">Rekomendasi Harian</div>
              <div className="text-xs text-slate-600 font-medium">
                Batas belanja hari ini: <strong>{formatRupiah(Math.max(0, dailyBudget))}</strong>
              </div>
            </div>
          </div>

          {/* Dua Kolom: Alokasi Anggaran (Kiri) + Kategori Pengeluaran (Kanan) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Kolom Kiri: Alokasi Anggaran (Donut + Progress Bars) */}
            <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
              <div className="text-sm font-bold text-slate-800 mb-4">Alokasi {pctKebutuhan}/{pctKeinginan}/{pctTabungan}</div>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                {/* Donut Chart */}
                <div className="relative w-28 h-28 flex-shrink-0 mx-auto sm:mx-0">
                  <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                    {donutSegments.map((seg, idx) => (
                      <circle
                        key={idx}
                        cx="18"
                        cy="18"
                        r="15.915"
                        fill="none"
                        stroke={donutColors[idx]}
                        strokeWidth="4"
                        strokeDasharray={`${seg.dashArray} 100`}
                        strokeDashoffset={-seg.offset}
                        strokeLinecap="round"
                      />
                    ))}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <div className="text-[8px] text-slate-400">Rasio</div>
                    <div className="text-xs font-black text-slate-800">
                      {pctKebutuhan}/{pctKeinginan}/{pctTabungan}
                    </div>
                  </div>
                </div>
                {/* Progress Bars */}
                <div className="flex-1 w-full space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span>Needs (Kebutuhan Pokok)</span>
                      <span>{Math.min(100, Math.round(needsUsedPercent))}% / {pctKebutuhan}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-[#00685f] h-2 rounded-full" style={{ width: `${Math.min(100, needsUsedPercent)}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span>Wants (Keinginan)</span>
                      <span>{Math.min(100, Math.round(wantsUsedPercent))}% / {pctKeinginan}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-[#66b5ad] h-2 rounded-full" style={{ width: `${Math.min(100, wantsUsedPercent)}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span>Savings (Tabungan & Investasi)</span>
                      <span>{Math.min(100, Math.round(savingsPercent))}% / {pctTabungan}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-[#b3d9d5] h-2 rounded-full" style={{ width: `${Math.min(100, savingsPercent)}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Kolom Kanan: Kategori Pengeluaran Terbesar dengan Donut Chart */}
            <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
              <div className="text-sm font-bold text-slate-800 mb-4">Kategori Pengeluaran Terbesar</div>
              {topCategories.length === 0 ? (
                <div className="text-xs text-slate-400 text-center py-8">Belum ada transaksi</div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  {/* Donut Chart Kategori */}
                  <div className="relative w-28 h-28 flex-shrink-0">
                    <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                      {categoryDonutSegments.map((seg, idx) => (
                        <circle
                          key={idx}
                          cx="18"
                          cy="18"
                          r="15.915"
                          fill="none"
                          stroke={seg.color}
                          strokeWidth="4"
                          strokeDasharray={`${seg.dashArray} 100`}
                          strokeDashoffset={-seg.offset}
                          strokeLinecap="round"
                        />
                      ))}
                      {/* Lingkaran tengah putih */}
                      <circle cx="18" cy="18" r="10" fill="white" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-[10px] font-bold text-slate-600">{topCategories.length}</div>
                        <div className="text-[8px] text-slate-400">Kategori</div>
                      </div>
                    </div>
                  </div>
                  {/* Legend Kategori */}
                  <div className="flex-1 w-full space-y-2">
                    {categoryDonutSegments.map((seg, idx) => {
                      const percent = totalTopCategories > 0 ? (seg.amount / totalTopCategories) * 100 : 0;
                      return (
                        <div key={idx} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: seg.color }}></span>
                            <span className="text-xs font-medium text-slate-600 truncate max-w-[100px]">{seg.category}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-800">{formatRupiah(seg.amount)}</span>
                            <span className="text-xs text-slate-400">({Math.round(percent)}%)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Grafik Mingguan */}
          <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-bold text-slate-800">Pengeluaran Mingguan</span>
              <button className="bg-slate-100 text-xs font-semibold text-slate-600 px-3 py-1.5 rounded-lg flex items-center gap-1">
                Minggu Ini <span className="material-symbols-outlined text-sm">expand_more</span>
              </button>
            </div>
            <div className="flex items-end justify-between gap-1 h-28 mt-2">
              {weekDays.map((day, idx) => (
                <div key={day} className="flex flex-col items-center gap-1 flex-1">
                  <div
                    className="w-full bg-teal-100 rounded-t-md transition-all duration-300"
                    style={{ height: `${weeklyHeights[idx]}px` }}
                  ></div>
                  <span className="text-[9px] font-semibold text-slate-500">{day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Transaksi Terakhir */}
          <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-bold text-slate-800">Transaksi Terakhir</span>
              <button onClick={() => navigate('/history')} className="text-xs font-bold text-[#00685f]">Lihat Semua</button>
            </div>
            {transactions.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-sm">Belum ada transaksi</div>
            ) : (
              transactions.slice(0, 3).map((tx) => (
                <div key={tx.id} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${tx.type === 'expense' ? 'bg-rose-50 text-rose-500' : 'bg-teal-50 text-teal-700'}`}>
                    <span className="material-symbols-outlined text-base">{tx.type === 'expense' ? 'shopping_bag' : 'payments'}</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-slate-800">{tx.description || tx.category}</div>
                    <div className="text-[10px] text-slate-400">{tx.category} • {tx.date}</div>
                  </div>
                  <div className={`text-xs font-extrabold ${tx.type === 'expense' ? 'text-rose-500' : 'text-teal-700'}`}>
                    {tx.type === 'expense' ? '-' : '+'} {formatRupiah(tx.amount)}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Banner Promo */}
          <div className="bg-gradient-to-r from-teal-800 to-teal-600 rounded-xl p-5 flex gap-4 shadow-md">
            <div className="flex-1">
              <div className="text-white font-extrabold text-base mb-1">Simpan lebih banyak untuk masa depanmu.</div>
              <div className="text-teal-100 text-xs font-medium mb-3">Mulai fitur auto-tabungan hari ini dan nikmati bunga hingga 4.5% p.a.</div>
              <button className="bg-white text-teal-800 text-xs font-extrabold px-4 py-2 rounded-lg">Coba Sekarang</button>
            </div>
            <div className="w-16 h-20 bg-white/10 rounded-xl flex items-center justify-center text-3xl">🌿</div>
          </div>
        </main>
      </div>

      {/* Floating Action Button untuk mobile */}
      <button
        onClick={() => navigate('/transaction')}
        className="fixed bottom-5 right-5 md:hidden w-12 h-12 bg-[#00685f] text-white rounded-full shadow-lg flex items-center justify-center z-50 border-none cursor-pointer"
      >
        <span className="material-symbols-outlined text-2xl">add</span>
      </button>
    </div>
  );
}

export default Dashboard;