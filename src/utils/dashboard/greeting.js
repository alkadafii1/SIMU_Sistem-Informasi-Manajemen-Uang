export const getGreeting = (name, t) => {
  const hour = new Date().getHours();
  
  if (hour < 12) {
    return `${t('greetingMorning')}, ${name}! ☀️`;
  }
  if (hour < 15) {
    return `${t('greetingAfternoon')}, ${name}! 🌤️`;
  }
  if (hour < 18) {
    return `${t('greetingEvening')}, ${name}! 🌆`;
  }
  return `${t('greetingNight')}, ${name}! 🌙`;
};