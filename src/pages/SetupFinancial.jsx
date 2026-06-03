import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import IncomeInput from '../components/SetupFinancial/IncomeInput';
import AllocationSlider from '../components/SetupFinancial/AllocationSlider';
import GoalsSelector from '../components/SetupFinancial/GoalsSelector';
import PreviewChart from '../components/SetupFinancial/PreviewChart';
import { ALLOCATION_COLORS } from '../constants/setupData';

const SetupFinancial = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  
  // State pendapatan
  const [income, setIncome] = useState(5000000);
  
  // State alokasi persentase
  const [pctKebutuhan, setPctKebutuhan] = useState(50);
  const [pctKeinginan, setPctKeinginan] = useState(30);
  const [pctTabungan, setPctTabungan] = useState(20);
  
  // State goals
  const [selectedGoals, setSelectedGoals] = useState(['rumah']);

  const totalPercentage = pctKebutuhan + pctKeinginan + pctTabungan;
  const isValid = totalPercentage === 100 && income > 0;

  // Cek apakah user sudah pernah setup sebelumnya
  useEffect(() => {
    const checkExistingSetup = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        
        const response = await api.get('/user/setup');
        
        // Jika sudah pernah setup, redirect ke dashboard dengan pesan
        if (response.data.success && response.data.setup) {
          navigate('/dashboard', { 
            state: { 
              message: '⚠️ Anda sudah melakukan setup finansial sebelumnya. Jika ingin mengubah alokasi, silakan gunakan menu Pengaturan.' 
            }
          });
        }
      } catch (error) {
        // Jika 404 (belum pernah setup), biarkan tetap di halaman
        if (error.response?.status !== 404) {
          console.error('Error checking setup:', error);
          // Jika error lain (401 unauthorized), redirect ke login
          if (error.response?.status === 401) {
            localStorage.clear();
            navigate('/login');
          }
        }
      } finally {
        setChecking(false);
      }
    };
    
    checkExistingSetup();
  }, [navigate]);

  // Hitung nominal
  const kebutuhanNominal = (income * pctKebutuhan) / 100;
  const keinginanNominal = (income * pctKeinginan) / 100;
  const tabunganNominal = (income * pctTabungan) / 100;

  // Format Rupiah
  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(angka);
  };

  // Toggle goal selection
  const toggleGoal = (id) => {
    if (selectedGoals.includes(id)) {
      setSelectedGoals(selectedGoals.filter(g => g !== id));
    } else {
      setSelectedGoals([...selectedGoals, id]);
    }
  };

  // Handle apply strategy
  const handleApplyStrategy = async () => {
    if (!isValid) {
      alert('Pastikan total alokasi 100% dan pendapatan diisi!');
      return;
    }

    setLoading(true);
    try {
      const response = await api.put('/user/setup', {
        income: income,
        allocation: {
          kebutuhan: pctKebutuhan,
          keinginan: pctKeinginan,
          tabungan: pctTabungan
        },
        goals: selectedGoals
      });

      if (response.data.success) {
        navigate('/dashboard', { state: { fromSetup: true } });
      }
    } catch (error) {
      console.error('Gagal menyimpan setup:', error);
      alert('Terjadi kesalahan, silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  // Update persentase dengan menjaga total 100%
  const updateKebutuhan = (value) => {
    let newVal = Math.min(100, Math.max(0, value));
    let remaining = 100 - newVal;
    if (remaining >= 0) {
      setPctKebutuhan(newVal);
      const currentTotal = pctKeinginan + pctTabungan;
      if (currentTotal > 0) {
        setPctKeinginan(Math.round((pctKeinginan / currentTotal) * remaining));
        setPctTabungan(remaining - Math.round((pctKeinginan / currentTotal) * remaining));
      } else {
        setPctKeinginan(Math.round(remaining * 0.6));
        setPctTabungan(remaining - Math.round(remaining * 0.6));
      }
    }
  };

  const updateKeinginan = (value) => {
    let newVal = Math.min(100 - pctKebutuhan, Math.max(0, value));
    setPctKeinginan(newVal);
    setPctTabungan(100 - pctKebutuhan - newVal);
  };

  const updateTabungan = (value) => {
    let newVal = Math.min(100 - pctKebutuhan, Math.max(0, value));
    setPctTabungan(newVal);
    setPctKeinginan(100 - pctKebutuhan - newVal);
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-slate-50 via-white to-[#f0f7f6] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1E4D4A]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-50 via-white to-[#f0f7f6] font-sans">
      {/* Premium Ambient Background Blurs */}
      <div className="fixed -top-40 -right-40 w-96 h-96 bg-[#1E4D4A]/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="fixed -bottom-30 -left-30 w-80 h-80 bg-[#A3B18A]/8 rounded-full blur-[90px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto px-5 py-6 md:p-8 lg:p-12 relative z-10">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-[#1E4D4A] rounded-2xl flex items-center justify-center shadow-lg shadow-[#1E4D4A]/20">
            <span className="material-symbols-outlined text-white">wallet</span>
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">Atur Strategi Keuangan</h1>
            <p className="text-xs text-slate-400">Sesuaikan alokasi anggaran sesuai kebutuhanmu</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Kolom kiri - Setup */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Input Pendapatan dengan Format Rupiah */}
            <IncomeInput income={income} setIncome={setIncome} />

            {/* Alokasi Anggaran */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-[#1E4D4A]">tune</span>
                  Alokasi Anggaran
                </label>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${totalPercentage === 100 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                  Total: {totalPercentage}%
                </span>
              </div>

              <AllocationSlider 
                title="Kebutuhan Pokok"
                color={ALLOCATION_COLORS.kebutuhan}
                percentage={pctKebutuhan}
                nominal={kebutuhanNominal}
                onUpdate={updateKebutuhan}
                maxValue={100}
                description="Cicilan, tagihan, makan, transportasi"
                formatRupiah={formatRupiah}
              />

              <AllocationSlider 
                title="Gaya Hidup & Keinginan"
                color={ALLOCATION_COLORS.keinginan}
                percentage={pctKeinginan}
                nominal={keinginanNominal}
                onUpdate={updateKeinginan}
                maxValue={100 - pctKebutuhan}
                description="Jajan, hiburan, self-reward"
                formatRupiah={formatRupiah}
              />

              <AllocationSlider 
                title="Tabungan & Investasi"
                color={ALLOCATION_COLORS.tabungan}
                percentage={pctTabungan}
                nominal={tabunganNominal}
                onUpdate={updateTabungan}
                maxValue={100 - pctKebutuhan}
                description="Dana darurat, investasi, masa depan"
                formatRupiah={formatRupiah}
              />
            </div>

            {/* Pilihan Goals */}
            <GoalsSelector selectedGoals={selectedGoals} toggleGoal={toggleGoal} />
          </div>

          {/* Kolom Kanan - Preview Chart */}
          <div className="lg:col-span-5">
            <PreviewChart 
              pctKebutuhan={pctKebutuhan}
              pctKeinginan={pctKeinginan}
              pctTabungan={pctTabungan}
              kebutuhanNominal={kebutuhanNominal}
              keinginanNominal={keinginanNominal}
              tabunganNominal={tabunganNominal}
              totalPercentage={totalPercentage}
              formatRupiah={formatRupiah}
            />
            
            {/* Tombol Apply */}
            <button
              onClick={handleApplyStrategy}
              disabled={!isValid || loading}
              className={`w-full mt-4 py-3.5 rounded-xl font-bold text-sm shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 ${
                isValid && !loading
                  ? 'bg-[#1E4D4A] hover:bg-[#143533] text-white shadow-lg shadow-[#1E4D4A]/20' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Menyimpan...
                </>
              ) : (
                'Terapkan Strategi Keuangan'
              )}
            </button>
            
            {!isValid && (
              <p className="text-xs text-rose-500 text-center mt-3">
                {totalPercentage !== 100 ? 'Total alokasi harus 100%' : 'Pendapatan harus diisi'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Informasi Penting */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20">
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 shadow-md">
          <p className="text-xs text-amber-700 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">info</span>
            ⚠️ Setup hanya dilakukan SEKALI. Alokasi ini akan digunakan untuk dashboard Anda.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SetupFinancial;