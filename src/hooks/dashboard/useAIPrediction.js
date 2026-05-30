import { useState, useCallback, useRef } from 'react';
import { predictFinancialHealth } from '../../services/api';

export const useAIPrediction = () => {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const fetchingRef = useRef(false);
  const fetchedRef = useRef(false);

  const fetchPrediction = useCallback(async (incomeValue, userIdValue, transactions = []) => {
    // Jika sudah pernah fetch dan berhasil, jangan fetch lagi
    if (fetchedRef.current && prediction) {
      console.log('[AI] Already fetched, skipping...');
      return prediction;
    }
    
    // Jika sedang dalam proses fetch, jangan fetch lagi
    if (fetchingRef.current) {
      console.log('[AI] Already fetching, skipping...');
      return;
    }
    
    fetchingRef.current = true;
    setLoading(true);
    setError(false);
    
    try {
      console.log('[AI] Fetching prediction...');
      const result = await predictFinancialHealth(userIdValue, incomeValue);
      setPrediction(result);
      fetchedRef.current = true;
      return result;
    } catch (error) {
      console.error('[AI] Prediction error:', error);
      setError(true);
      
      // Fallback response
      const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      const ratio = incomeValue > 0 ? expense / incomeValue : 0;
      
      let label = 'Moderate';
      if (ratio <= 0.3) label = 'Financially Healthy';
      else if (ratio >= 0.8) label = 'At Risk';
      
      const fallback = {
        success: true,
        is_fallback: true,
        prediction: { label, confidence: 0.6 },
        recommendation: label === 'Financially Healthy' 
          ? '✅ Keuangan Anda dalam kondisi baik! Pertahankan kebiasaan baik Anda.'
          : label === 'At Risk'
          ? '⚠️ Perhatikan pengeluaran Anda! Coba kurangi pos yang tidak penting.'
          : '📊 Keuangan Anda cukup stabil. Terus pantau pengeluaran harian.',
        source: 'fallback'
      };
      
      setPrediction(fallback);
      fetchedRef.current = true;
      return fallback;
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [prediction]);

  const refreshPrediction = useCallback(async (incomeValue) => {
    // Reset flag agar bisa fetch ulang
    fetchedRef.current = false;
    const userId = localStorage.getItem('user_id');
    return await fetchPrediction(incomeValue, userId ? parseInt(userId) : 1, []);
  }, [fetchPrediction]);

  return { prediction, loading, error, fetchPrediction, refreshPrediction };
};