import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { useLanguage } from '../context/LanguageContext';
import { GOALS_OPTIONS } from '../constants/setupData';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import Spinner from '../components/Spinner';

function GoalsSetting() {
  const navigate = useNavigate();
  const { isDarkMode, bgColor, cardBg, borderColor, textPrimary, textSecondary } = useThemeStyles();
  const { t } = useLanguage();
  
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const userData = {
    name: localStorage.getItem('user_name') || 'Pengguna',
    email: localStorage.getItem('user_email') || 'email@example.com',
  };
  const userAvatar = localStorage.getItem('user_avatar');
  const userInitial = userData.name.charAt(0).toUpperCase();

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const response = await api.get('/user/goals');
        const userGoals = response.data.goals || [];
        const initializedGoals = GOALS_OPTIONS.map(goal => {
          const savedGoal = userGoals.find(g => g.id === goal.id);
          return {
            ...goal,
            target: savedGoal?.target || goal.defaultTarget,
            isSelected: savedGoal?.isSelected || false
          };
        });
        setGoals(initializedGoals);
      } catch (error) {
        console.error('Error fetching goals:', error);
        const defaultGoals = GOALS_OPTIONS.map(goal => ({
          ...goal,
          target: goal.defaultTarget,
          isSelected: false
        }));
        setGoals(defaultGoals);
      } finally {
        setLoading(false);
      }
    };
    fetchGoals();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(angka);
  };

  const parseRupiahToNumber = (value) => {
    return parseInt(value.replace(/[^0-9]/g, '')) || 0;
  };

  const handleTargetChange = (id, value) => {
    const numericValue = parseRupiahToNumber(value);
    setGoals(prev => prev.map(goal =>
      goal.id === id ? { ...goal, target: numericValue } : goal
    ));
  };

  const handleToggleGoal = (id) => {
    setGoals(prev => prev.map(goal =>
      goal.id === id ? { ...goal, isSelected: !goal.isSelected } : goal
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const goalsToSave = goals.map(goal => ({
        id: goal.id,
        target: goal.target,
        isSelected: goal.isSelected
      }));
      await api.put('/user/goals', { goals: goalsToSave });
      showToast('Target tabungan berhasil disimpan!', 'success');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (error) {
      console.error('Error saving goals:', error);
      showToast('Gagal menyimpan target, silakan coba lagi', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Spinner fullScreen text="Memuat target tabungan..." />;
  }

  return (
    <div className={`min-h-screen ${bgColor}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          vertical-align: middle;
        }
        .toast-slide {
          animation: slideDown 0.3s ease forwards;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {toast.show && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 toast-slide w-auto max-w-md px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 ${
          toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
        }`}>
          <span className="material-symbols-outlined text-xl">
            {toast.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
      )}

      <div className="flex h-screen overflow-hidden">
        <Sidebar userData={userData} userAvatar={userAvatar} userInitial={userInitial} />

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className={`${cardBg} border-b ${borderColor} px-6 py-4 sticky top-0 z-10 flex-shrink-0`}>
            <div className="flex justify-between items-center">
              <div>
                <h1 className={`text-xl font-bold ${textPrimary}`}>Atur Target Tabungan</h1>
                <p className={`text-xs ${textSecondary} mt-0.5`}>Tentukan target nominal untuk setiap impianmu</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
            <div className="max-w-3xl mx-auto space-y-6">

              {/* Info Card */}
              <div className={`rounded-xl border p-4 flex items-start gap-3 ${
                isDarkMode
                  ? 'bg-blue-950 border-blue-800 text-blue-200'
                  : 'bg-blue-50 border-blue-200 text-blue-900'
              }`}>
                <span className={`material-symbols-outlined text-xl mt-0.5 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`}>info</span>
                <div>
                  <p className="font-semibold text-sm mb-1">💡 Cara Menabung untuk Target:</p>
                  <p className={`text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                    Buka halaman <strong>Catat Transaksi</strong> → Pilih <strong>Transfer</strong> → Pilih <strong>Transfer ke Tabungan</strong> → Masukkan nominal → Simpan. Progress akan otomatis terhitung!
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className={`text-lg font-bold ${textPrimary}`}>Pilih Target & Tentukan Nominal</h2>

                {goals.map((goal) => (
                  <div
                    key={goal.id}
                    className={`${cardBg} rounded-xl border ${borderColor} p-5 transition-all ${
                      goal.isSelected ? `ring-2 ring-[#00685f] ${isDarkMode ? 'ring-offset-gray-800' : 'ring-offset-white'}` : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <button
                        onClick={() => handleToggleGoal(goal.id)}
                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-1 transition-all ${
                          goal.isSelected
                            ? 'bg-[#00685f] border-[#00685f] text-white'
                            : `border-gray-300 dark:border-gray-600 hover:border-[#00685f] ${textSecondary}`
                        }`}
                      >
                        {goal.isSelected && (
                          <span className="material-symbols-outlined text-sm">check</span>
                        )}
                      </button>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${goal.color}20` }}>
                            <span className="material-symbols-outlined text-2xl" style={{ color: goal.color }}>{goal.icon}</span>
                          </div>
                          <div>
                            <h3 className={`font-bold ${textPrimary}`}>{goal.label}</h3>
                            <p className={`text-xs ${textSecondary}`}>
                              {goal.isSelected ? 'Target aktif' : 'Belum dipilih'}
                            </p>
                          </div>
                        </div>

                        {goal.isSelected && (
                          <div>
                            <label className={`text-xs font-medium ${textSecondary} block mb-2`}>Target Nominal</label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">Rp</span>
                              <input
                                type="text"
                                value={formatRupiah(goal.target)}
                                onChange={(e) => handleTargetChange(goal.id, e.target.value)}
                                className={`w-full pl-8 pr-4 py-2.5 rounded-lg text-sm border focus:outline-none focus:border-[#00685f] focus:ring-1 focus:ring-[#00685f] transition-all ${
                                  isDarkMode
                                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                                }`}
                                placeholder="Masukkan target nominal"
                              />
                            </div>
                            <p className={`text-[10px] ${textSecondary} mt-1`}>Contoh: Rp 500.000.000 untuk rumah impian</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-3 bg-[#00685f] hover:bg-[#005049] text-white font-semibold rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <div className="flex items-center justify-center gap-2">
                      <Spinner size="sm" text="Menyimpan..." />
                    </div>
                  ) : (
                    'Simpan Target Tabungan'
                  )}
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className={`px-6 py-3 rounded-xl font-medium transition-all ${
                    isDarkMode
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GoalsSetting;