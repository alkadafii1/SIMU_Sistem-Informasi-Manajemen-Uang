import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function TransactionPage({ monthlyIncome, setMonthlyIncome, transactions, setTransactions }) {
  const navigate = useNavigate();
  
  // State data user & avatar disinkronkan dengan localStorage
  const [userData, setUserData] = useState({
    name: 'Celvin Alfiansyah',
    email: 'celvin@email.com'
  });
  const [userAvatar, setUserAvatar] = useState(null);

  useEffect(() => {
    const storedName = localStorage.getItem('user_name');
    const storedEmail = localStorage.getItem('user_email');
    const storedAvatar = localStorage.getItem('user_avatar'); // Mengambil foto profil
    
    if (storedName || storedEmail) {
      setUserData({
        name: storedName || 'Celvin Alfiansyah',
        email: storedEmail || 'celvin@email.com'
      });
    }

    if (storedAvatar) {
      setUserAvatar(storedAvatar); // Set avatar jika ada di localStorage
    }
  }, []);

  const userInitial = userData.name ? userData.name.charAt(0).toUpperCase() : 'U';

  // State untuk form transaksi
  const [transactionType, setTransactionType] = useState('pengeluaran'); 
  const [amountString, setAmountString] = useState('0');
  const [category, setCategory] = useState('Makanan & Minuman');
  const [note, setNote] = useState('');

  // Fungsi Keypad Digital
  const handleKeyPress = (value) => {
    if (value === 'backspace') {
      if (amountString.length <= 1) {
        setAmountString('0');
      } else {
        setAmountString(amountString.slice(0, -1));
      }
    } else if (value === '.') {
      if (!amountString.includes('.')) {
        setAmountString(amountString + '.');
      }
    } else {
      if (amountString === '0') {
        setAmountString(String(value));
      } else {
        setAmountString(amountString + value);
      }
    }
  };

  // AKSI SIMPAN TRANSAKSI - Terkoneksi 100% ke State Management Global App.jsx
  const handleSaveTransaction = () => {
    const numericAmount = parseFloat(amountString) || 0;
    
    if (numericAmount <= 0) {
      alert('Mohon masukkan nominal transaksi yang valid terlebih dahulu!');
      return;
    }

    // 1. Mutasi Pengurangan / Penambahan Saldo Utama di App.jsx
    if (transactionType === 'pengeluaran') {
      setMonthlyIncome((prev) => prev - numericAmount);
    } else {
      setMonthlyIncome((prev) => prev + numericAmount);
    }

    // 2. Buat Objek Record Baru dan Masukkan Ke Urutan Teratas Array Riwayat Transaksi Global
    const newRecord = {
      type: transactionType,
      amount: numericAmount,
      category: category,
      note: note.trim() || (transactionType === 'pengeluaran' ? `Belanja ${category}` : `Pendapatan ${category}`),
      date: 'Baru saja'
    };

    setTransactions([newRecord, ...transactions]);

    // 3. Alihkan navigasi halaman kembali ke Dashboard Utama secara instan
    navigate('/dashboard');
  };

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(angka);
  };

  // Pengelompokan list pilihan kategori bawaan berdasarkan tipe transaksi
  const expenseCategories = ['Makanan & Minuman', 'Belanja Harian', 'Transportasi', 'Tagihan & Utilitas', 'Hiburan & Hobi', 'Kesehatan'];
  const incomeCategories = ['Gaji Bulanan', 'Investasi', 'Proyek Sampingan', 'Pemberian/Bonus'];
  const currentCategories = transactionType === 'pengeluaran' ? expenseCategories : incomeCategories;

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

        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* SISI KIRI: SIDEBAR LAYOUT */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col justify-between p-6 h-full flex-shrink-0 hidden md:flex">
        <div className="space-y-8">
          <div onClick={() => navigate('/dashboard')} className="cursor-pointer flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-xl bg-[#00685f] flex items-center justify-center text-white shadow-xs">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
            </div>
            <span className="text-xl font-extrabold text-[#00685f] tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>WealthFlow</span>
          </div>

          <nav className="space-y-1.5">
            <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-slate-500 hover:text-[#00685f] hover:bg-slate-50 font-medium text-sm border-none cursor-pointer text-left transition-all">
              <span className="material-symbols-outlined">dashboard</span>
              <span>Dashboard</span>
            </button>
            <button onClick={() => navigate('/statistics')} className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-slate-500 hover:text-[#00685f] hover:bg-slate-50 font-medium text-sm border-none cursor-pointer text-left transition-all">
              <span className="material-symbols-outlined">analytics</span>
              <span>Statistik Analisis</span>
            </button>
            <button onClick={() => navigate('/history')} className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-slate-500 hover:text-[#00685f] hover:bg-slate-50 font-medium text-sm border-none cursor-pointer text-left transition-all">
              <span className="material-symbols-outlined">receipt_long</span>
              <span>Riwayat Aktivitas</span>
            </button>
            <button onClick={() => navigate('/transaction')} className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl bg-[#00685f]/10 text-[#00685f] font-semibold text-sm border-none cursor-pointer text-left">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
              <span>Target Tabungan</span>
            </button>
            <button onClick={() => navigate('/settings')} className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-slate-500 hover:text-[#00685f] hover:bg-slate-50 font-medium text-sm border-none cursor-pointer text-left transition-all">
              <span className="material-symbols-outlined">settings</span>
              <span>Pengaturan</span>
            </button>
          </nav>
        </div>

        {/* PROFILE FOOTER SIDEBAR (SINKRON AVATAR & NAMA) */}
        <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
          {userAvatar ? (
            <img 
              src={userAvatar} 
              alt="Profile" 
              className="w-10 h-10 rounded-full object-cover border border-slate-100"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#d8e5e2] flex items-center justify-center font-bold text-[#00685f]">
              {userInitial}
            </div>
          )}
          <div className="flex flex-col text-left overflow-hidden">
            <span className="text-xs font-bold text-slate-800 truncate">{userData.name}</span>
            <span className="text-[10px] text-slate-400 font-medium truncate">{userData.email}</span>
          </div>
        </div>
      </aside>

      {/* SISI KANAN: WORKSPACE CONTENT */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* TOP BAR / HEADER */}
        <header className="bg-white/80 backdrop-blur-md px-8 py-4 flex items-center justify-between border-b border-slate-100 z-20 flex-shrink-0">
          <div className="flex flex-col text-left">
            <h2 className="text-xl font-bold text-slate-800 tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>Catat Transaksi</h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Pantau mutasi dompet real-time</p>
          </div>
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 transition-all border-none cursor-pointer"
          >
            Batal
          </button>
        </header>

        {/* UTAMA GRID FORM CONTAINER */}
        <main className="flex-1 overflow-y-auto p-8 no-scrollbar">
          <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* COLUMN LEFT (SPAN 5): CALCULATION DISPLAY & DIGITAL PAD */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Type Switcher Tabs */}
              <div className="bg-slate-100 p-1 rounded-2xl flex gap-1">
                <button 
                  onClick={() => { setTransactionType('pengeluaran'); setCategory('Makanan & Minuman'); }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold border-none cursor-pointer transition-all ${transactionType === 'pengeluaran' ? 'bg-white text-rose-600 shadow-xs' : 'bg-transparent text-slate-400 font-medium'}`}
                >
                  Pengeluaran
                </button>
                <button 
                  onClick={() => { setTransactionType('pemasukan'); setCategory('Gaji Bulanan'); }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold border-none cursor-pointer transition-all ${transactionType === 'pemasukan' ? 'bg-white text-[#00685f] shadow-xs' : 'bg-transparent text-slate-400 font-medium'}`}
                >
                  Pemasukan
                </button>
              </div>

              {/* Display Monitor Screen */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0px_4px_20px_rgba(0,0,0,0.01)] text-center relative overflow-hidden">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Jumlah Nominal</span>
                <div className={`text-3xl font-black tracking-tight ${transactionType === 'pengeluaran' ? 'text-rose-600' : 'text-[#00685f]'}`} style={{ fontFamily: 'Manrope, sans-serif' }}>
                  {formatRupiah(parseFloat(amountString) || 0)}
                </div>
              </div>

              {/* Keypad Grid System */}
              <div className="grid grid-cols-3 gap-2 bg-slate-100/70 p-2 rounded-3xl">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((val) => (
                  <button 
                    key={val} 
                    onClick={() => handleKeyPress(val)}
                    className="py-4 text-xl font-bold text-slate-700 bg-white hover:bg-slate-50 active:scale-95 rounded-xl border-none cursor-pointer transition-all duration-100"
                  >
                    {val}
                  </button>
                ))}
                <button onClick={() => handleKeyPress('.')} className="py-4 text-xl font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 active:scale-95 rounded-xl border-none cursor-pointer transition-all">.</button>
                <button onClick={() => handleKeyPress('0')} className="py-4 text-xl font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 active:scale-95 rounded-xl border-none cursor-pointer transition-all">0</button>
                <button onClick={() => handleKeyPress('backspace')} className="py-4 text-rose-600 bg-rose-50 hover:bg-rose-100 active:scale-95 rounded-xl border-none cursor-pointer transition-all flex items-center justify-center">
                  <span className="material-symbols-outlined">backspace</span>
                </button>
              </div>

            </div>

            {/* COLUMN RIGHT (SPAN 7): CATEGORIES SELECTOR & NOTES FIELD */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-100 space-y-6 shadow-[0px_4px_20px_rgba(0,0,0,0.01)]">
              
              {/* Category Grid Section */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block text-left">Pilih Kategori Pos</label>
                <div className="grid grid-cols-2 gap-2.5">
                  {currentCategories.map((cat) => {
                    const isSelected = category === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`py-3 px-4 rounded-xl text-xs font-semibold border text-center cursor-pointer transition-all duration-150 ${isSelected ? (transactionType === 'pengeluaran' ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-[#00685f]/5 text-[#00685f] border-[#00685f]/20') : 'bg-transparent text-slate-500 border-slate-100 hover:bg-slate-50 hover:border-slate-200'}`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Memo/Note Input Field */}
              <div className="space-y-2 text-left">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Catatan Transaksi (Opsional)</label>
                <input 
                  type="text" 
                  placeholder="Contoh: Beli nasi goreng pak de banyuwangi"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium placeholder-slate-300 focus:outline-none focus:border-[#00685f] focus:bg-white transition-all"
                />
              </div>

              {/* Tombol Simpan Transaksi */}
              <button 
                onClick={handleSaveTransaction}
                className={`w-full text-white py-4 rounded-xl font-bold shadow-lg transition-all active:scale-[0.99] border-none cursor-pointer text-base flex items-center justify-center gap-2 ${transactionType === 'pengeluaran' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/10' : 'bg-[#00685f]'}`}
              >
                <span>Simpan {transactionType === 'pengeluaran' ? 'Pengeluaran' : 'Pemasukan'}</span>
              </button>
            </div>

          </div>
        </main>
      </div>

    </div>
  );
}

export default TransactionPage;