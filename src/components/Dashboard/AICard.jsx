import React from 'react';

const AICard = ({
  prediction,
  loading,
  error,
  onRefresh,
  getStatusColor,
  getStatusIcon,
  getStatusText,
  formatRupiah,
  isDarkMode,
  cardBg,
  borderColor,
  textPrimary,
  textSecondary,
  t,
  isOnline,
}) => {
  return (
    <div className={`${cardBg} rounded-lg border ${borderColor} shadow-sm overflow-hidden`}>
      <div className={`px-5 py-3 border-b ${borderColor} flex justify-between items-center`}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-base">robot_2</span>
          </div>
          <div>
            <h3 className={`text-sm font-semibold ${textPrimary}`}>{t('aiAssistant')}</h3>
            <p className={`text-[10px] ${textSecondary}`}>{t('monthlyPrediction')}</p>
          </div>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className={`flex items-center gap-1 px-3 py-1 text-xs ${textSecondary} ${
            isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
          } rounded-lg transition-all`}
        >
          <span className="material-symbols-outlined text-sm">refresh</span>
          {t('refresh')}
        </button>
      </div>

      <div className="px-5 py-4">
        {loading ? (
          <div className={`flex items-center gap-3 ${textSecondary}`}>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#00685f] border-t-transparent"></div>
            <span className="text-sm">{t('analyzing')}</span>
          </div>
        ) : prediction ? (
          <div>
            <div className="flex items-center gap-3 flex-wrap mb-3">
              <span className={`text-sm ${textSecondary}`}>{t('status')}:</span>
              <span
                className="px-3 py-1 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: getStatusColor(prediction.prediction?.label) }}
              >
                {getStatusIcon(prediction.prediction?.label)} {getStatusText(prediction.prediction?.label)}
              </span>
              <span
                className={`text-xs ${textSecondary} ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                } px-2 py-1 rounded-full`}
              >
                Confidence: {Math.round((prediction.prediction?.confidence || 0) * 100)}%
              </span>
            </div>

            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg p-3 mb-2 border ${borderColor}`}>
              <p className={`${textPrimary} text-sm leading-relaxed`}>{prediction.recommendation}</p>
            </div>

            <div className={`text-[10px] ${textSecondary} flex flex-wrap items-center justify-between gap-2`}>
              <div className="flex items-center gap-2">
                {prediction.source === 'generative_ai_gemini' && (
                  <>
                    <span className="material-symbols-outlined text-xs">bolt</span>
                    <span>✨ Dihasilkan oleh Gemini AI</span>
                  </>
                )}
                {prediction.is_fallback && (
                  <>
                    <span className="material-symbols-outlined text-xs">cloud_off</span>
                    <span>📝 Prediksi sementara (mode offline)</span>
                  </>
                )}
              </div>
              
              {/* Indikator offline mode di dalam AICard */}
              {!isOnline && !prediction.is_fallback && (
                <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 dark:bg-amber-900/30 rounded-full">
                  <span className="material-symbols-outlined text-amber-500 text-xs">cloud_off</span>
                  <span className="text-amber-600 dark:text-amber-400 text-[9px]">{t('offlineMode') || 'Offline'}</span>
                </div>
              )}
            </div>
          </div>
        ) : error ? (
          <div className={`${textSecondary} text-sm text-center py-4`}>
            {error}
          </div>
        ) : (
          <div className={`${textSecondary} text-sm text-center py-4`}>
            {t('refresh')} {t('aiAssistant')}
          </div>
        )}
      </div>
    </div>
  );
};

export default AICard;