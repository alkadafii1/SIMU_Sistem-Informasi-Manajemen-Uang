import { useState } from 'react';
import { predictFinancialHealth } from '../services/api';

export const useAIPrediction = () => {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchPrediction = async (incomeValue, userIdValue, transactions = []) => {
    setLoading(true);
    setError(false);
    
    try {
      const result = await predictFinancialHealth(userIdValue, incomeValue);
      setPrediction(result);
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
      return fallback;
    } finally {
      setLoading(false);
    }
  };

  return { prediction, loading, error, fetchPrediction };
};