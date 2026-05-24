import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function TransactionPage() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({ name: '', email: '' });
  const [userAvatar, setUserAvatar] = useState(null);
  const [transactionType, setTransactionType] = useState('expense');
  const [amountString, setAmountString] = useState('0');
  const [category, setCategory] = useState('Makanan & Minuman');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });

  // Ambil data user dari localStorage
  useEffect(() => {
    const storedName = localStorage.getItem('user_name');
    const storedEmail = localStorage.getItem('user_email');
    const storedAvatar = localStorage.getItem('user_avatar');
    setUserData({
      name: storedName || 'Pengguna',
      email: storedEmail || 'email@example.com'
    });
    if (storedAvatar) setUserAvatar(storedAvatar);
  }, []);

  // Cek apakah user sudah melakukan setup keuangan
  useEffect(() => {
    const checkSetup = async () => {
      try {
        await api.get('/user/setup');
      } catch (error) {
        if (error.response?.status === 404) {
          navigate('/setup-financial');
        } else {
          console.error('Error checking setup:', error);
        }
      }
    };
    checkSetup();
  }, [navigate]);

  // Helper untuk menampilkan toast
  const showToast = (message, type = 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'error' }), 4000);
  };

  const handleKeyPress = (value) => {
    if (value === 'backspace') {
      if (amountString.length <= 1) setAmountString('0');
      else setAmountString(amountString.slice(0, -1));
    } else if (value === '.') {
      if (!amountString.includes('.')) setAmountString(amountString + '.');
    } else {
      if (amountString === '0') setAmountString(String(value));
      else setAmountString(amountString + value);
    }
  };

  const handleSaveTransaction = async () => {
    const numericAmount = parseFloat(amountString) || 0;
    if (numericAmount <= 0) {
      showToast('Masukkan nominal transaksi yang valid (lebih dari 0)', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/transactions', {
        type: transactionType,
        amount: numericAmount,
        category: category,
        description: note.trim() || (transactionType === 'expense' ? `Belanja ${category}` : `Pendapatan ${category}`),
        date: new Date().toISOString().split('T')[0]
      });
      if (response.data.success) {
        showToast('Transaksi berhasil disimpan!', 'success');
        setTimeout(() => navigate('/dashboard'), 1000);
      } else {
        showToast('Gagal menyimpan transaksi, coba lagi', 'error');
      }
    } catch (error) {
      console.error('Error saving transaction:', error);
      let message = 'Terjadi kesalahan, silakan coba lagi';
      if (error.response?.data?.message) {
        message = error.response.data.message;
        // Jika pesan error berisi "Saldo tidak cukup", kita tambahkan informasi sisa budget
        if (message.includes('Sisa budget:')) {
          const match = message.match(/Sisa budget:\s*(\d+)/);
          if (match) {
            const sisa = match[1];
            message = `⛔ Saldo tidak mencukupi. Sisa budget Anda hanya Rp ${parseInt(sisa).toLocaleString('id-ID')}. Kurangi nominal atau tambah pemasukan.`;
          }
        } else if (message.toLowerCase().includes('setup')) {
          message = 'Anda belum melakukan pengaturan keuangan. Silakan isi pendapatan dan alokasi terlebih dahulu.';
          setTimeout(() => navigate('/setup-financial'), 2000);
        }
      }
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(angka);
  };

  const expenseCategories = ['Makanan & Minuman', 'Belanja Harian', 'Transportasi', 'Tagihan & Utilitas', 'Hiburan & Hobi', 'Kesehatan'];
  const incomeCategories = ['Gaji Bulanan', 'Investasi', 'Proyek Sampingan', 'Pemberian/Bonus'];
  const currentCategories = transactionType === 'expense' ? expenseCategories : incomeCategories;

  const userInitial = userData.name ? userData.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="bg-[#f9f9ff] text-[#151c27] h-screen flex overflow-hidden font-sans antialiased relative">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; display: inline-block; line-height: 1; vertical-align: middle; }
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

      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col justify-between p-6 h-full flex-shrink-0 hidden md:flex">
        <div className="space-y-8">
          <div onClick={() => navigate('/dashboard')} className="cursor-pointer flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-xl bg-[#00685f] flex items-center justify-center text-white shadow-xs">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
            </div>
            <span className="text-xl font-extrabold text-[#00685f]" style={{ fontFamily: 'Manrope, sans-serif' }}>WealthFlow</span>
          </div>
          <nav className="space-y-1.5">
            <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-slate-500 hover:text-[#00685f] hover:bg-slate-50 font-medium text-sm">Dashboard</button>
            <button onClick={() => navigate('/statistics')} className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-slate-500 hover:text-[#00685f] hover:bg-slate-50 font-medium text-sm">Statistik Analisis</button>
            <button onClick={() => navigate('/history')} className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-slate-500 hover:text-[#00685f] hover:bg-slate-50 font-medium text-sm">Riwayat Aktivitas</button>
            <button onClick={() => navigate('/transaction')} className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl bg-[#00685f]/10 text-[#00685f] font-semibold text-sm">Target Tabungan</button>
            <button onClick={() => navigate('/settings')} className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-slate-500 hover:text-[#00685f] hover:bg-slate-50 font-medium text-sm">Pengaturan</button>
          </nav>
        </div>
        <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
          {userAvatar ? <img src={userAvatar} alt="Profile" className="w-10 h-10 rounded-full object-cover border border-slate-100" /> : <div className="w-10 h-10 rounded-full bg-[#d8e5e2] flex items-center justify-center font-bold text-[#00685f]">{userInitial}</div>}
          <div className="flex flex-col text-left overflow-hidden">
            <span className="text-xs font-bold text-slate-800 truncate">{userData.name}</span>
            <span className="text-[10px] text-slate-400 font-medium truncate">{userData.email}</span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="bg-white/80 backdrop-blur-md px-8 py-4 flex items-center justify-between border-b border-slate-100 z-20 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800" style={{ fontFamily: 'Manrope, sans-serif' }}>Catat Transaksi</h2>
            <p className="text-xs text-slate-400 font-medium">Pantau mutasi dompet real-time</p>
          </div>
          <button onClick={() => navigate('/dashboard')} className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 transition-all">Batal</button>
        </header>

        <main className="flex-1 overflow-y-auto p-8 no-scrollbar">
          <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column - Keypad */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-100 p-1 rounded-2xl flex gap-1">
                <button onClick={() => { setTransactionType('expense'); setCategory('Makanan & Minuman'); }} className={`flex-1 py-2.5 rounded-xl text-xs font-bold ${transactionType === 'expense' ? 'bg-white text-rose-600 shadow-xs' : 'bg-transparent text-slate-400'}`}>Pengeluaran</button>
                <button onClick={() => { setTransactionType('income'); setCategory('Gaji Bulanan'); }} className={`flex-1 py-2.5 rounded-xl text-xs font-bold ${transactionType === 'income' ? 'bg-white text-[#00685f] shadow-xs' : 'bg-transparent text-slate-400'}`}>Pemasukan</button>
              </div>
              <div className="bg-white rounded-3xl p-6 border border-slate-100 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Jumlah Nominal</span>
                <div className={`text-3xl font-black tracking-tight ${transactionType === 'expense' ? 'text-rose-600' : 'text-[#00685f]'}`}>{formatRupiah(parseFloat(amountString) || 0)}</div>
              </div>
              <div className="grid grid-cols-3 gap-2 bg-slate-100/70 p-2 rounded-3xl">
                {[1,2,3,4,5,6,7,8,9].map(v => <button key={v} onClick={() => handleKeyPress(v)} className="py-4 text-xl font-bold text-slate-700 bg-white hover:bg-slate-50 active:scale-95 rounded-xl">{v}</button>)}
                <button onClick={() => handleKeyPress('.')} className="py-4 text-xl font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 active:scale-95 rounded-xl">.</button>
                <button onClick={() => handleKeyPress(0)} className="py-4 text-xl font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 active:scale-95 rounded-xl">0</button>
                <button onClick={() => handleKeyPress('backspace')} className="py-4 text-rose-600 bg-rose-50 hover:bg-rose-100 active:scale-95 rounded-xl flex items-center justify-center"><span className="material-symbols-outlined">backspace</span></button>
              </div>
            </div>

            {/* Right Column - Category & Note */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-100 space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block text-left">Pilih Kategori Pos</label>
                <div className="grid grid-cols-2 gap-2.5">
                  {currentCategories.map(cat => (
                    <button key={cat} onClick={() => setCategory(cat)} className={`py-3 px-4 rounded-xl text-xs font-semibold border text-center transition-all ${category === cat ? (transactionType === 'expense' ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-[#00685f]/5 text-[#00685f] border-[#00685f]/20') : 'bg-transparent text-slate-500 border-slate-100 hover:bg-slate-50'}`}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2 text-left">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Catatan Transaksi (Opsional)</label>
                <input type="text" placeholder="Contoh: Beli nasi goreng" value={note} onChange={e => setNote(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:outline-none focus:border-[#00685f]" />
              </div>
              <button onClick={handleSaveTransaction} disabled={loading} className={`w-full text-white py-4 rounded-xl font-bold shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-2 ${transactionType === 'expense' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-[#00685f] hover:bg-[#005049]'}`}>
                {loading ? 'Menyimpan...' : `Simpan ${transactionType === 'expense' ? 'Pengeluaran' : 'Pemasukan'}`}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default TransactionPage;