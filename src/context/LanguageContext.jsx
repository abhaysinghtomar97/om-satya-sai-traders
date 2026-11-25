// src/context/LanguageContext.jsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '@/lib/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('hi'); // Default Hindi ya 'en' rakh sakte hain

  useEffect(() => {
    const savedLang = localStorage.getItem('osst_lang');
    if (savedLang && (savedLang === 'en' || savedLang === 'hi')) {
      setLang(savedLang);
    }
  }, []);

  const switchLanguage = (newLang) => {
    setLang(newLang);
    localStorage.setItem('osst_lang', newLang);
  };

  const t = translations[lang];

  return (
    <LanguageContext.Provider value={{ lang, switchLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}