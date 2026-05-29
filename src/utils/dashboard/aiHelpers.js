/**
 * Warna berdasarkan status AI
 * @param {string} label - Status label ('Financially Healthy', 'At Risk', 'Moderate')
 * @returns {string} - Kode warna hex
 */
export const getStatusColor = (label) => {
  if (label === 'Financially Healthy') return '#10b981';
  if (label === 'At Risk') return '#ef4444';
  return '#f59e0b';
};

/**
 * Mendapatkan ikon berdasarkan status AI
 * @param {string} label - Status label
 * @returns {string} - Emoji ikon
 */
export const getStatusIcon = (label) => {
  if (label === 'Financially Healthy') return '✅';
  if (label === 'At Risk') return '⚠️';
  return '📊';
};

/**
 * Mendapatkan teks status dalam Bahasa Indonesia
 * @param {string} label - Status label (Inggris)
 * @returns {string} - Status dalam Bahasa Indonesia
 */
export const getStatusText = (label) => {
  if (label === 'Financially Healthy') return 'Sehat Finansial';
  if (label === 'At Risk') return 'Berisiko';
  return 'Cukup Stabil';
};