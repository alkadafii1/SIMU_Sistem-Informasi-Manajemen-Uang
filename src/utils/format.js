/**
 * Format angka ke format Rupiah Indonesia
 * @param {number} angka - Nilai yang akan diformat
 * @returns {string} - Format Rupiah (contoh: Rp 1.000.000)
 */
export const formatRupiah = (angka) => {
  if (angka === undefined || angka === null) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(angka);
};

/**
 * Format tanggal ke format Indonesia
 * @param {string|Date} date - Tanggal yang akan diformat
 * @returns {string} - Format tanggal (contoh: 28 Mei 2026)
 */
export const formatDate = (date) => {
  if (!date) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
};

/**
 * Format persentase
 * @param {number} value - Nilai (0-100)
 * @returns {string} - Format persentase (contoh: 75%)
 */
export const formatPercent = (value) => {
  return `${Math.min(100, Math.round(value))}%`;
};