import React, { createContext, useState, useContext, useEffect } from 'react';
import idTranslations from '../locales/id.json';
import enTranslations from '../locales/en.json';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'id';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const changeLanguage = (lang) => {
    setLanguage(lang);
  };

  const translations = {
    id: idTranslations,
    en: enTranslations,
  };

  const t = (key) => {
    const currentTranslations = translations[language];
    const value = currentTranslations[key];
    
    if (value === undefined) {
      console.warn(`Translation missing for key: ${key} in language: ${language}`);
      return key;
    }
    
    return value;
  };

  // Fungsi khusus untuk translate kategori
  const tc = (category, type = 'expense') => {
    // Coba cari di kategori berdasarkan tipe
    const categoryKey = `category_${type}_${category.replace(/\s/g, '_')}`;
    const translated = t(categoryKey);
    
    if (translated !== categoryKey) {
      return translated;
    }
    
    // Fallback ke mapping langsung
    const categoryMap = {
      id: {
        'Makanan & Minuman': 'Makanan & Minuman',
        'Belanja Harian': 'Belanja Harian',
        'Transportasi': 'Transportasi',
        'Tagihan & Utilitas': 'Tagihan & Utilitas',
        'Hiburan & Hobi': 'Hiburan & Hobi',
        'Kesehatan': 'Kesehatan',
        'Pendidikan': 'Pendidikan',
        'Investasi': 'Investasi',
        'Lainnya': 'Lainnya',
        'Gaji Bulanan': 'Gaji Bulanan',
        'Bonus': 'Bonus',
        'Proyek Sampingan': 'Proyek Sampingan',
        'Hadiah': 'Hadiah',
        'Kebutuhan': 'Kebutuhan',
        'Keinginan': 'Keinginan',
        'Tabungan': 'Tabungan',
      },
      en: {
        'Makanan & Minuman': 'Food & Beverages',
        'Belanja Harian': 'Daily Shopping',
        'Transportasi': 'Transportation',
        'Tagihan & Utilitas': 'Bills & Utilities',
        'Hiburan & Hobi': 'Entertainment & Hobbies',
        'Kesehatan': 'Health',
        'Pendidikan': 'Education',
        'Investasi': 'Investment',
        'Lainnya': 'Others',
        'Gaji Bulanan': 'Monthly Salary',
        'Bonus': 'Bonus',
        'Proyek Sampingan': 'Side Project',
        'Hadiah': 'Gift',
        'Kebutuhan': 'Needs',
        'Keinginan': 'Wants',
        'Tabungan': 'Savings',
      }
    };
    
    return categoryMap[language]?.[category] || category;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t, tc }}>
      {children}
    </LanguageContext.Provider>
  );
};