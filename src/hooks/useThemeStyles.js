import { useTheme } from '../context/ThemeContext';

export const useThemeStyles = () => {
  const { isDarkMode } = useTheme();

  return {
    isDarkMode,
    bgColor: isDarkMode ? 'bg-gray-900' : 'bg-gray-50',
    cardBg: isDarkMode ? 'bg-gray-800' : 'bg-white',
    borderColor: isDarkMode ? 'border-gray-700' : 'border-gray-200',
    textPrimary: isDarkMode ? 'text-white' : 'text-gray-800',
    textSecondary: isDarkMode ? 'text-gray-400' : 'text-gray-500',
  };
};