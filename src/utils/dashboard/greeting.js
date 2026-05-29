/**
 * Mendapatkan sapaan berdasarkan waktu
 * @param {string} name
 * @returns {string}
 */
export const getGreeting = (name) => {
  const hour = new Date().getHours();
  
  if (hour < 12) {
    return `Selamat pagi, ${name}! ☀️`;
  }
  if (hour < 15) {
    return `Selamat siang, ${name}! 🌤️`;
  }
  if (hour < 18) {
    return `Selamat sore, ${name}! 🌆`;
  }
  return `Selamat malam, ${name}! 🌙`;
};

/**
 * Mendapatkan ikon berdasarkan waktu
 * @returns {string}
 */
export const getGreetingIcon = () => {
  const hour = new Date().getHours();
  if (hour < 12) return '🌅';
  if (hour < 15) return '☀️';
  if (hour < 18) return '🌤️';
  return '🌙';
};