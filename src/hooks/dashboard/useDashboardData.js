import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../../services/api';

export const useDashboardData = (navigate) => {
  const [setup, setSetup] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dailyBudget, setDailyBudget] = useState(0);
  const [weeklyExpenses, setWeeklyExpenses] = useState([0, 0, 0, 0, 0, 0, 0]);
  
  const isMountedRef = useRef(true);
  const isFetchingRef = useRef(false);

  const fetchData = useCallback(async () => {
    if (isFetchingRef.current) {
      console.log('⏭️ Fetch already in progress, skipping...');
      return null;
    }
    
    isFetchingRef.current = true;
    console.log('🟡 [useDashboardData] Fetching dashboard data...');
    setLoading(true);
    
    try {
      const [setupRes, transRes] = await Promise.all([
        api.get('/user/setup'),
        api.get('/transactions'),
      ]);
      
      if (!isMountedRef.current) return null;
      
      const userSetup = setupRes.data.setup;
      const allTransactions = transRes.data.transactions || [];
      
      console.log(`📊 [useDashboardData] Got ${allTransactions.length} transactions`);
      
      setSetup(userSetup);
      setTransactions([...allTransactions]);

      // Hitung total income (tanpa Tarik dari Tabungan)
      const totalIncomeAmount = allTransactions
        .filter((t) => t.type === 'income' && t.category !== 'Tarik dari Tabungan')
        .reduce((sum, t) => sum + t.amount, 0);
      
      // Hitung total expense (tanpa Transfer ke Tabungan)
      const totalExpenseAmount = allTransactions
        .filter((t) => t.type === 'expense' && t.category !== 'Transfer ke Tabungan')
        .reduce((sum, t) => sum + t.amount, 0);
      
      // Hitung transfer ke tabungan
      const savingsTransfers = allTransactions
        .filter((t) => t.category === 'Transfer ke Tabungan')
        .reduce((sum, t) => sum + t.amount, 0);
      
      // Hitung tarik dari tabungan
      const savingsWithdraws = allTransactions
        .filter((t) => t.category === 'Tarik dari Tabungan')
        .reduce((sum, t) => sum + t.amount, 0);
      
      // Hitung Saldo Aktif
      const activeBalance = (userSetup.income + totalIncomeAmount + savingsWithdraws) - (totalExpenseAmount + savingsTransfers);
      
      // ========== PERHITUNGAN DAILY BUDGET YANG BENAR ==========
      const today = new Date();
      const currentDate = today.getDate();
      const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      const daysLeft = daysInMonth - currentDate;
      
      // Daily budget = sisa saldo aktif / sisa hari di bulan ini
      const dailyBudgetCalc = daysLeft > 0 && activeBalance > 0 ? activeBalance / daysLeft : 0;
      
      console.log(`📅 Tanggal: ${currentDate}, Total hari bulan ini: ${daysInMonth}, Sisa hari: ${daysLeft}`);
      console.log(`💰 Saldo Aktif: ${activeBalance}, Daily Budget: ${dailyBudgetCalc}`);
      
      setDailyBudget(dailyBudgetCalc);

      // Weekly expenses
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      const weekExp = [0, 0, 0, 0, 0, 0, 0];
      allTransactions.forEach((tx) => {
        if (tx.type === 'expense' && tx.category !== 'Transfer ke Tabungan') {
          const txDate = new Date(tx.date);
          if (txDate >= startOfWeek && txDate <= now) {
            weekExp[txDate.getDay()] += tx.amount;
          }
        }
      });
      setWeeklyExpenses([...weekExp]);

      console.log('✅ [useDashboardData] Fetch completed');
      return { userSetup, allTransactions };

    } catch (error) {
      console.error('❌ [useDashboardData] Fetch error:', error);
      if (error.response?.status === 404 && isMountedRef.current) {
        navigate('/setup-financial');
      }
      return null;
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
      isFetchingRef.current = false;
    }
  }, [navigate]);

  const refetchData = useCallback(async () => {
    console.log('🔄 [useDashboardData] Manual refetch triggered');
    isFetchingRef.current = false;
    return await fetchData();
  }, [fetchData]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchData();
    
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchData]);

  return {
    setup,
    transactions,
    loading,
    dailyBudget,
    weeklyExpenses,
    refetchData
  };
};