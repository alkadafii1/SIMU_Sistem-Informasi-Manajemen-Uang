import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../../services/api';

export const useDashboardData = (navigate) => {
  const [setup, setSetup] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dailyBudget, setDailyBudget] = useState(0);
  const [weeklyExpenses, setWeeklyExpenses] = useState([0, 0, 0, 0, 0, 0, 0]);
  
  const fetchInProgress = useRef(false);

  // Gunakan useCallback agar fungsi stabil
  const fetchData = useCallback(async () => {
    // Cegah multiple fetch bersamaan
    if (fetchInProgress.current) return;
    
    fetchInProgress.current = true;
    setLoading(true);
    
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

      setTransactions(allTransactions);

      const income = userSetup.income;
      const remaining = (income + totalIncomeAmount) - totalExpenseAmount;
      const daysLeft = 30 - new Date().getDate();
      setDailyBudget(daysLeft > 0 ? remaining / daysLeft : remaining);

      // Hitung weekly expenses
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      const weekExp = [0, 0, 0, 0, 0, 0, 0];
      allTransactions.forEach((tx) => {
        if (tx.type === 'expense') {
          const txDate = new Date(tx.date);
          if (txDate >= startOfWeek && txDate <= now) {
            weekExp[txDate.getDay()] += tx.amount;
          }
        }
      });
      setWeeklyExpenses(weekExp);

      return { userSetup, allTransactions };

    } catch (error) {
      console.error('Gagal fetch dashboard:', error);
      if (error.response?.status === 404) {
        navigate('/setup-financial');
      }
      throw error;
    } finally {
      setLoading(false);
      fetchInProgress.current = false;
    }
  }, [navigate]);

  // Fetch pertama kali
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    setup,
    transactions,
    loading,
    dailyBudget,
    weeklyExpenses,
    refetch: fetchData
  };
};