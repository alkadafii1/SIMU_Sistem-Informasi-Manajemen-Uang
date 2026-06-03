import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GOALS_OPTIONS } from '../../constants/setupData';
import api from '../../services/api';
import { formatRupiah } from '../../utils/format';

const GoalsCard = ({ selectedGoals, formatRupiah, cardBg, borderColor, textPrimary, textSecondary, t, isDarkMode }) => {
  const navigate = useNavigate();
  const [goalsData, setGoalsData] = useState([]);
  const [unallocatedSavings, setUnallocatedSavings] = useState(0);
  const [totalSavings, setTotalSavings] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // State untuk modal alokasi
  const [showAllocationModal, setShowAllocationModal] = useState(false);
  const [allocationAmount, setAllocationAmount] = useState('');
  const [selectedAllocationGoal, setSelectedAllocationGoal] = useState(null);
  const [isAllocating, setIsAllocating] = useState(false);
  const [allocationType, setAllocationType] = useState('to_goal');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [displayAmount, setDisplayAmount] = useState('');

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [goalsRes, transactionsRes] = await Promise.all([
        api.get('/user/goals'),
        api.get('/transactions')
      ]);
      
      const userGoals = goalsRes.data.goals || [];
      const transactions = transactionsRes.data.transactions || [];
      
      let totalTopUpToGeneral = 0;
      let totalAllocatedToGoals = 0;
      let totalWithdrawFromGeneral = 0;
      
      const savingsByGoal = {};
      
      userGoals.forEach(goal => {
        if (goal.isSelected) {
          savingsByGoal[goal.id] = 0;
        }
      });
      
      transactions.forEach(tx => {
        if (tx.category === 'Transfer ke Tabungan') {
          const description = tx.description || '';
          const amount = tx.amount;
          
          if (description.includes('Alokasi dari Tabungan Umum ke')) {
            totalAllocatedToGoals += amount;
            
            for (const goal of userGoals) {
              if (goal.isSelected) {
                const goalInfo = GOALS_OPTIONS.find(g => g.id === goal.id);
                const goalLabel = goalInfo?.label || goal.id;
                if (description.includes(goalLabel)) {
                  savingsByGoal[goal.id] = (savingsByGoal[goal.id] || 0) + amount;
                  break;
                }
              }
            }
          } else {
            totalTopUpToGeneral += amount;
          }
        } else if (tx.category === 'Tarik dari Tabungan') {
          totalWithdrawFromGeneral += tx.amount;
        }
      });
      
      const totalGeneralSavings = totalTopUpToGeneral - (totalAllocatedToGoals + totalWithdrawFromGeneral);
      const unallocated = Math.max(0, totalGeneralSavings);
      
      setUnallocatedSavings(unallocated);
      setTotalSavings(totalTopUpToGeneral);
      
      const mergedGoals = userGoals
        .filter(goal => goal.isSelected)
        .map(goal => {
          const originalGoal = GOALS_OPTIONS.find(g => g.id === goal.id);
          const savedAmount = savingsByGoal[goal.id] || 0;
          const targetAmount = goal.target || originalGoal?.defaultTarget || 100000000;
          const progress = targetAmount > 0 ? (savedAmount / targetAmount) * 100 : 0;
          
          return {
            id: goal.id,
            label: originalGoal?.label || goal.label || goal.id,
            icon: originalGoal?.icon || 'target',
            color: originalGoal?.color || '#00685f',
            target: targetAmount,
            savedAmount: savedAmount,
            progress: Math.min(progress, 100),
            rawProgress: progress
          };
        });
      
      setGoalsData(mergedGoals);
    } catch (error) {
      console.error('Error fetching goals:', error);
      setGoalsData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAmountChange = (e) => {
    let value = e.target.value;
    let numericValue = value.replace(/[^0-9]/g, '');
    let numberValue = numericValue === '' ? 0 : parseInt(numericValue, 10);
    
    if (numberValue > 10000000000) {
      numberValue = 10000000000;
      numericValue = numberValue.toString();
    }
    
    setAllocationAmount(numericValue);
    
    if (numericValue && numericValue !== '0') {
      setDisplayAmount(formatRupiah(parseInt(numericValue, 10)));
    } else {
      setDisplayAmount('');
    }
  };

  const handleFocus = (e) => {
    e.target.select();
  };

  const validateAllocationAmount = (amount, maxAmount) => {
    const numAmount = parseInt(amount, 10);
    if (isNaN(numAmount) || numAmount <= 0) {
      return { valid: false, message: 'Masukkan nominal yang valid (lebih dari 0)' };
    }
    if (numAmount > maxAmount) {
      return { valid: false, message: `Nominal melebihi saldo Tabungan Umum (${formatRupiah(maxAmount)})` };
    }
    if (numAmount < 1000) {
      return { valid: false, message: 'Minimal nominal Rp 1.000' };
    }
    if (numAmount > 10000000000) {
      return { valid: false, message: 'Maksimal nominal Rp 10 Miliar' };
    }
    return { valid: true, message: '' };
  };

  const handleAllocateToGoal = async () => {
    if (!selectedAllocationGoal) {
      showToast('Pilih target terlebih dahulu!', 'error');
      return;
    }
    
    const amount = parseInt(allocationAmount, 10);
    const validation = validateAllocationAmount(amount, unallocatedSavings);
    if (!validation.valid) {
      showToast(validation.message, 'error');
      return;
    }
    
    setIsAllocating(true);
    try {
      const selectedGoal = GOALS_OPTIONS.find(g => g.id === selectedAllocationGoal);
      const goalLabel = selectedGoal?.label || selectedAllocationGoal;
      
      const response = await api.post('/transactions', {
        type: 'expense',
        amount: amount,
        category: 'Transfer ke Tabungan',
        description: `Alokasi dari Tabungan Umum ke ${goalLabel}`,
        date: new Date().toISOString().split('T')[0]
      });
      
      if (response.data.success) {
        showToast(`Berhasil mengalokasikan ${formatRupiah(amount)} ke ${goalLabel}`, 'success');
        setShowAllocationModal(false);
        setAllocationAmount('');
        setDisplayAmount('');
        setSelectedAllocationGoal(null);
        setTimeout(() => fetchData(), 500);
      } else {
        showToast('Gagal mengalokasikan dana', 'error');
      }
    } catch (error) {
      console.error('Error allocating:', error);
      showToast(error.response?.data?.message || 'Gagal mengalokasikan, coba lagi', 'error');
    } finally {
      setIsAllocating(false);
    }
  };
  
  const handleWithdrawFromGeneral = async () => {
    const amount = parseInt(allocationAmount, 10);
    const validation = validateAllocationAmount(amount, unallocatedSavings);
    if (!validation.valid) {
      showToast(validation.message, 'error');
      return;
    }
    
    setIsAllocating(true);
    try {
      const response = await api.post('/transactions', {
        type: 'income',
        amount: amount,
        category: 'Tarik dari Tabungan',
        description: `Tarik dari Tabungan Umum`,
        date: new Date().toISOString().split('T')[0]
      });
      
      if (response.data.success) {
        showToast(`Berhasil menarik ${formatRupiah(amount)} ke Saldo Aktif`, 'success');
        setShowAllocationModal(false);
        setAllocationAmount('');
        setDisplayAmount('');
        setTimeout(() => fetchData(), 500);
      } else {
        showToast('Gagal menarik dana', 'error');
      }
    } catch (error) {
      console.error('Error withdrawing:', error);
      showToast(error.response?.data?.message || 'Gagal menarik dana, coba lagi', 'error');
    } finally {
      setIsAllocating(false);
    }
  };

  const handleCloseModal = () => {
    setShowAllocationModal(false);
    setAllocationAmount('');
    setDisplayAmount('');
    setSelectedAllocationGoal(null);
    setAllocationType('to_goal');
  };

  const getGoalIcon = (goalId) => {
    const iconMap = { 'rumah': '🏠', 'mobil': '🚗', 'liburan': '✈️', 'gadget': '💻', 'darurat': '🛡️' };
    return iconMap[goalId] || '🎯';
  };

  const getCardBg = () => {
    if (isDarkMode) return 'bg-gray-800';
    return 'bg-white';
  };

  const getBorderColor = () => {
    if (isDarkMode) return 'border-gray-700';
    return 'border-gray-200';
  };

  const getTextPrimary = () => {
    if (isDarkMode) return 'text-white';
    return 'text-gray-900';
  };

  const getTextSecondary = () => {
    if (isDarkMode) return 'text-gray-400';
    return 'text-gray-500';
  };

  const getGoalItemBg = () => {
    if (isDarkMode) return 'bg-gray-700';
    return 'bg-gray-50';
  };

  const getProgressTrackBg = () => {
    if (isDarkMode) return 'bg-gray-600';
    return 'bg-gray-200';
  };

  const getGeneralSavingsBg = () => {
    if (isDarkMode) return 'bg-amber-900/20 border border-amber-800';
    return 'bg-amber-50 border border-amber-200';
  };

  if (loading) {
    return (
      <div className={`${getCardBg()} rounded-lg border ${getBorderColor()} shadow-sm p-4`}>
        <div className="flex items-center gap-2 mb-3">
          <h3 className={`text-sm font-bold ${getTextPrimary()}`}>{t('goals')}</h3>
        </div>
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#00685f] border-t-transparent"></div>
        </div>
      </div>
    );
  }
  
  if (!goalsData.length && unallocatedSavings === 0) {
    return (
      <div className={`${getCardBg()} rounded-lg border ${getBorderColor()} shadow-sm p-4`}>
        <div className="flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-emerald-600">savings</span>
          <h3 className={`text-sm font-bold ${getTextPrimary()}`}>{t('goals')}</h3>
        </div>
        <div className="text-center py-4">
          <span className="material-symbols-outlined text-3xl text-gray-300 dark:text-gray-600 mb-2">add_circle</span>
          <p className={`text-xs ${getTextSecondary()} mb-2`}>{t('noTransactions')}</p>
          <button onClick={() => navigate('/goals-setting')} className="mt-2 px-4 py-2 text-sm font-medium bg-[#00685f] text-white rounded-lg hover:bg-[#005049] transition-all">
            + {t('addGoal')}
          </button>
        </div>
        
        {/* Button Atur & Transfer berjajar di bawah */}
        <div className="flex gap-3 mt-4">
          <button 
            onClick={() => navigate('/goals-setting')} 
            className="flex-1 py-2 text-center text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all flex items-center justify-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">settings</span>
            {t('manageGoals')}
          </button>
          <button 
            onClick={() => navigate('/transaction')} 
            className="flex-1 py-2 text-center text-xs font-semibold bg-[#00685f] hover:bg-[#005049] text-white rounded-lg transition-all flex items-center justify-center gap-1 shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">savings</span>
            {t('transferToSavings')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-5 left-1/2 transform -translate-x-1/2 z-50 w-auto max-w-md px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 ${
          toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
        }`}>
          <span className="material-symbols-outlined text-xl">
            {toast.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
      )}

      {/* Modal Alokasi Tabungan Umum */}
      {showAllocationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${getCardBg()} rounded-2xl max-w-md w-full shadow-xl overflow-hidden`}>
            <div className={`p-5 border-b ${getBorderColor()} flex justify-between items-center`}>
              <h3 className={`text-lg font-bold ${getTextPrimary()}`}>
                {allocationType === 'to_goal' ? t('allocateToGoal') : t('withdrawToActive')}
              </h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <div className={`${isDarkMode ? 'bg-amber-900/20' : 'bg-amber-50'} p-3 rounded-lg`}>
                <p className={`text-sm ${isDarkMode ? 'text-amber-300' : 'text-amber-700'}`}>
                  {t('generalSavings')}: <strong>{formatRupiah(unallocatedSavings)}</strong>
                </p>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setAllocationType('to_goal');
                    setSelectedAllocationGoal(null);
                  }}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    allocationType === 'to_goal'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : `${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'}`
                  }`}
                >
                  {t('allocateToGoal')}
                </button>
                <button
                  onClick={() => {
                    setAllocationType('withdraw');
                    setSelectedAllocationGoal(null);
                  }}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    allocationType === 'withdraw'
                      ? 'bg-amber-600 text-white shadow-md'
                      : `${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'}`
                  }`}
                >
                  {t('withdrawToActive')}
                </button>
              </div>
              
              {allocationType === 'to_goal' && (
                <div>
                  <label className={`block text-xs font-semibold ${getTextSecondary()} mb-2`}>{t('selectGoal')}</label>
                  <div className="grid grid-cols-2 gap-2">
                    {goalsData.map((goal) => (
                      <button
                        key={goal.id}
                        onClick={() => setSelectedAllocationGoal(goal.id)}
                        className={`py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                          selectedAllocationGoal === goal.id
                            ? 'bg-emerald-600 text-white shadow-md'
                            : `${isDarkMode ? 'bg-gray-800 text-gray-400 border-gray-700' : 'bg-gray-50 text-gray-600 border-gray-200'} border`
                        }`}
                      >
                        <span>{getGoalIcon(goal.id)}</span> {goal.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <label className={`block text-xs font-semibold ${getTextSecondary()} mb-2`}>{t('amountToAllocate')}</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Rp</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={displayAmount}
                    onChange={handleAmountChange}
                    onFocus={handleFocus}
                    placeholder="0"
                    className={`w-full pl-8 pr-4 py-2 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-900'} border ${getBorderColor()} rounded-lg text-sm focus:outline-none focus:border-[#00685f] focus:ring-1 focus:ring-[#00685f]`}
                  />
                </div>
                <p className={`text-[10px] ${getTextSecondary()} mt-1`}>Minimal Rp 1.000, maksimal Rp 10 Miliar</p>
              </div>
              
              {allocationAmount && parseInt(allocationAmount, 10) > 0 && (
                <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} p-3 rounded-lg`}>
                  <p className="text-xs text-gray-500">{t('preview')}</p>
                  <p className={`text-sm ${getTextPrimary()}`}>
                    {allocationType === 'to_goal' 
                      ? `${t('willBeAllocatedTo')} ${selectedAllocationGoal ? goalsData.find(g => g.id === selectedAllocationGoal)?.label : ''}`
                      : t('willBeWithdrawnTo')}
                  </p>
                  <p className="text-sm font-bold text-emerald-600">
                    {formatRupiah(parseInt(allocationAmount, 10))}
                  </p>
                  <p className={`text-xs ${getTextSecondary()} mt-1`}>
                    {t('remainingSavings')}: {formatRupiah(unallocatedSavings - parseInt(allocationAmount, 10))}
                  </p>
                </div>
              )}
            </div>
            
            <div className={`p-5 border-t ${getBorderColor()} flex gap-3`}>
              <button
                onClick={handleCloseModal}
                className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
                {t('cancel')}
              </button>
              <button
                onClick={allocationType === 'to_goal' ? handleAllocateToGoal : handleWithdrawFromGeneral}
                disabled={isAllocating || !allocationAmount || parseInt(allocationAmount, 10) <= 0 || (allocationType === 'to_goal' && !selectedAllocationGoal)}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                  allocationType === 'to_goal'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-amber-600 hover:bg-amber-700 text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isAllocating ? t('processing') : (allocationType === 'to_goal' ? t('allocate') : t('withdraw'))}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CARD */}
      <div className={`${getCardBg()} rounded-lg border ${getBorderColor()} shadow-sm p-4`}>
        <div className="flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-emerald-600">savings</span>
          <h3 className={`text-sm font-bold ${getTextPrimary()}`}>{t('goals')}</h3>
        </div>
        
        <div className="space-y-3">
          {goalsData.map((goal) => {
            const progress = goal.progress;
            const savedAmount = goal.savedAmount;
            const targetAmount = goal.target;
            
            return (
              <div key={goal.id} className={`p-3 rounded-xl ${getGoalItemBg()}`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${goal.color}15` }}>
                    <span className="material-symbols-outlined" style={{ color: goal.color }}>{goal.icon}</span>
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-bold ${getTextPrimary()}`}>{goal.label}</p>
                    <p className={`text-[10px] ${getTextSecondary()}`}>
                      {t('targetAmount')}: {formatRupiah(targetAmount)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${getTextPrimary()}`}>{Math.round(progress)}%</p>
                    <p className={`text-[9px] ${getTextSecondary()}`}>{t('achieved')}</p>
                  </div>
                </div>
                
                <div className={`w-full ${getProgressTrackBg()} rounded-full h-2 mb-2 overflow-hidden`}>
                  <div 
                    className="h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${Math.min(progress, 100)}%`, 
                      backgroundColor: goal.color,
                      boxShadow: !isDarkMode ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
                    }}
                  ></div>
                </div>
                
                <div className="flex justify-between text-[11px]">
                  <span className={`font-medium ${getTextSecondary()}`}>{t('savedAmount')}: {formatRupiah(savedAmount)}</span>
                  <span className={`font-medium ${getTextSecondary()}`}>{t('remainingAmount')}: {formatRupiah(targetAmount - savedAmount)}</span>
                </div>
              </div>
            );
          })}
          
          {/* Tabungan Umum dengan tombol alokasi */}
          {unallocatedSavings > 0 && (
            <div className={`p-3 rounded-xl ${getGeneralSavingsBg()}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-amber-800' : 'bg-amber-100'}`}>
                  <span className={`material-symbols-outlined ${isDarkMode ? 'text-amber-300' : 'text-amber-600'}`}>savings</span>
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-bold ${getTextPrimary()}`}>{t('generalSavings')}</p>
                  <p className={`text-[10px] ${getTextSecondary()}`}>{t('unallocated')}</p>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-black ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>{formatRupiah(unallocatedSavings)}</p>
                  <p className={`text-[9px] ${getTextSecondary()}`}>{t('available') || 'tersedia'}</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setAllocationType('to_goal');
                    setSelectedAllocationGoal(null);
                    setAllocationAmount('');
                    setDisplayAmount('');
                    setShowAllocationModal(true);
                  }}
                  className="flex-1 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-all flex items-center justify-center gap-1 shadow-sm"
                >
                  <span className="material-symbols-outlined text-sm">assignment</span>
                  {t('allocateToGoal')}
                </button>
                <button
                  onClick={() => {
                    setAllocationType('withdraw');
                    setAllocationAmount('');
                    setDisplayAmount('');
                    setShowAllocationModal(true);
                  }}
                  className="flex-1 py-2 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white transition-all flex items-center justify-center gap-1 shadow-sm"
                >
                  <span className="material-symbols-outlined text-sm">arrow_upward</span>
                  {t('withdrawToActive')}
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* BUTTON BERJajar di Bawah */}
        <div className="flex gap-3 mt-4">
          <button 
            onClick={() => navigate('/goals-setting')} 
            className="flex-1 py-2 text-center text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all flex items-center justify-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">settings</span>
            {t('manageGoals')}
          </button>
          <button 
            onClick={() => navigate('/transaction')} 
            className="flex-1 py-2 text-center text-xs font-semibold bg-[#00685f] hover:bg-[#005049] text-white rounded-lg transition-all flex items-center justify-center gap-1 shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">savings</span>
            {t('transferToSavings')}
          </button>
        </div>
      </div>
    </>
  );
};

export default GoalsCard;