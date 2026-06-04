import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GOALS_OPTIONS } from '../../constants/setupData';
import api from '../../services/api';
import { formatRupiah } from '../../utils/format';

const GoalsCard = ({ 
  goalsData = [], 
  unallocatedSavings = 0, 
  formatRupiah, 
  cardBg, 
  borderColor, 
  textPrimary, 
  textSecondary, 
  t, 
  isDarkMode, 
  onTransactionSuccess 
}) => {
  const navigate = useNavigate();
  
  const [showAllocationModal, setShowAllocationModal] = useState(false);
  const [allocationAmount, setAllocationAmount] = useState('');
  const [selectedAllocationGoal, setSelectedAllocationGoal] = useState(null);
  const [isAllocating, setIsAllocating] = useState(false);
  const [allocationType, setAllocationType] = useState('to_goal');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [displayAmount, setDisplayAmount] = useState('');

  const showToastMsg = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

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
      showToastMsg('Pilih target terlebih dahulu!', 'error');
      return;
    }
    
    const amount = parseInt(allocationAmount, 10);
    const validation = validateAllocationAmount(amount, unallocatedSavings);
    if (!validation.valid) {
      showToastMsg(validation.message, 'error');
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
        showToastMsg(`Berhasil mengalokasikan ${formatRupiah(amount)} ke ${goalLabel}`, 'success');
        setShowAllocationModal(false);
        setAllocationAmount('');
        setDisplayAmount('');
        setSelectedAllocationGoal(null);
        
        if (onTransactionSuccess) {
          await onTransactionSuccess();
        }
      } else {
        showToastMsg('Gagal mengalokasikan dana', 'error');
      }
    } catch (error) {
      console.error('Error allocating:', error);
      showToastMsg(error.response?.data?.message || 'Gagal mengalokasikan, coba lagi', 'error');
    } finally {
      setIsAllocating(false);
    }
  };
  
  const handleWithdrawFromGeneral = async () => {
    const amount = parseInt(allocationAmount, 10);
    const validation = validateAllocationAmount(amount, unallocatedSavings);
    if (!validation.valid) {
      showToastMsg(validation.message, 'error');
      return;
    }
    
    setIsAllocating(true);
    try {
      console.log('💰 Withdrawing from general savings:', amount);
      
      const response = await api.post('/transactions', {
        type: 'income',
        amount: amount,
        category: 'Tarik dari Tabungan',
        description: `WITHDRAW_GENERAL`,
        date: new Date().toISOString().split('T')[0]
      });
      
      console.log('📡 Withdraw response:', response.data);
      
      if (response.data.success) {
        showToastMsg(`Berhasil menarik ${formatRupiah(amount)} ke Saldo Aktif`, 'success');
        setShowAllocationModal(false);
        setAllocationAmount('');
        setDisplayAmount('');
        
        if (onTransactionSuccess) {
          console.log('🔄 Calling onTransactionSuccess after withdraw');
          await onTransactionSuccess();
          console.log('✅ onTransactionSuccess completed');
        }
      } else {
        showToastMsg('Gagal menarik dana', 'error');
      }
    } catch (error) {
      console.error('Error withdrawing:', error);
      showToastMsg(error.response?.data?.message || 'Gagal menarik dana, coba lagi', 'error');
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

  const getCardBg = () => isDarkMode ? 'bg-gray-800' : 'bg-white';
  const getBorderColor = () => isDarkMode ? 'border-gray-700' : 'border-gray-200';
  const getTextPrimary = () => isDarkMode ? 'text-white' : 'text-gray-900';
  const getTextSecondary = () => isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const getGoalItemBg = () => isDarkMode ? 'bg-gray-700' : 'bg-gray-50';
  const getProgressTrackBg = () => isDarkMode ? 'bg-gray-600' : 'bg-gray-200';
  const getGeneralSavingsBg = () => isDarkMode ? 'bg-amber-900/20 border border-amber-800' : 'bg-amber-50 border border-amber-200';

  if (!goalsData.length && unallocatedSavings === 0) {
    return (
      <div className={`${getCardBg()} rounded-lg border ${getBorderColor()} shadow-sm p-4`}>
        <div className="flex items-center gap-2 mb-3">
          <h3 className={`text-sm font-bold ${getTextPrimary()}`}>{t('goals')}</h3>
        </div>
        <div className="text-center py-4">
          <span className="material-symbols-outlined text-3xl text-gray-300 dark:text-gray-600 mb-2">add_circle</span>
          <p className={`text-xs ${getTextSecondary()} mb-2`}>{t('noTransactions')}</p>
          <button onClick={() => navigate('/goals-setting')} className="text-xs font-medium text-[#00685f] hover:underline">+ {t('addGoal')}</button>
        </div>
      </div>
    );
  }

  return (
    <>
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
                  onClick={() => { setAllocationType('to_goal'); setSelectedAllocationGoal(null); }}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    allocationType === 'to_goal'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : `${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'}`
                  }`}
                >
                  {t('allocateToGoal')}
                </button>
                <button
                  onClick={() => { setAllocationType('withdraw'); setSelectedAllocationGoal(null); }}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    allocationType === 'withdraw'
                      ? 'bg-amber-600 text-white shadow-md'
                      : `${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'}`
                  }`}
                >
                  {t('withdrawToActive')}
                </button>
              </div>
              
              {allocationType === 'to_goal' && goalsData.length > 0 && (
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
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className={`text-sm font-bold ${getTextPrimary()}`}>{t('goals')}</h3>
          </div>
          <button onClick={() => navigate('/goals-setting')} className="text-xs font-medium text-[#00685f] hover:underline">
            {t('manageGoals')}
          </button>
        </div>
        
        <div className="space-y-3">
          {goalsData.map((goal) => (
            <div key={goal.id} className={`p-3 rounded-xl ${getGoalItemBg()}`}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${goal.color}15` }}>
                  <span className="material-symbols-outlined" style={{ color: goal.color }}>{goal.icon}</span>
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-bold ${getTextPrimary()}`}>{goal.label}</p>
                  <p className={`text-[10px] ${getTextSecondary()}`}>
                    {t('targetAmount')}: {formatRupiah(goal.target)}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${getTextPrimary()}`}>{Math.round(goal.progress)}%</p>
                  <p className={`text-[9px] ${getTextSecondary()}`}>{t('achieved')}</p>
                </div>
              </div>
              
              <div className={`w-full ${getProgressTrackBg()} rounded-full h-2 mb-2 overflow-hidden`}>
                <div 
                  className="h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(goal.progress, 100)}%`, backgroundColor: goal.color }}
                ></div>
              </div>
              
              <div className="flex justify-between text-[11px]">
                <span className={`font-medium ${getTextSecondary()}`}>{t('savedAmount')}: {formatRupiah(goal.savedAmount)}</span>
                <span className={`font-medium ${getTextSecondary()}`}>{t('remainingAmount')}: {formatRupiah(goal.target - goal.savedAmount)}</span>
              </div>
            </div>
          ))}
          
          {/* Tabungan Umum */}
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
                className="flex-1 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-all flex items-center justify-center gap-1"
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
                className="flex-1 py-2 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white transition-all flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">arrow_upward</span>
                {t('withdrawToActive')}
              </button>
            </div>
          </div>
        </div>
        
        {/* Atur Target & Transfer ke Tabungan */}
        <div className="flex gap-2 mt-3">
          <button 
            onClick={() => navigate('/goals-setting')} 
            className="flex-1 py-2 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all flex items-center justify-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">settings</span>
            {t('manageGoals') || 'Atur Target'}
          </button>
          
          <button 
            onClick={() => navigate('/transaction', { state: { openTransferMode: true } })} 
            className="flex-1 py-2 rounded-lg text-xs font-semibold bg-[#00685f] hover:bg-[#005049] text-white transition-all flex items-center justify-center gap-1 shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">savings</span>
            {t('transferToSavings') || 'Transfer ke Tabungan'}
          </button>
        </div>
      </div>
    </>
  );
};

export default GoalsCard;