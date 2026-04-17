import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../LanguageContext';

export default function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();
  const isFr = language === 'fr';

  return (
    <button
      onClick={toggleLanguage}
      className="relative flex items-center h-9 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors px-1 overflow-hidden"
      style={{ width: 72 }}
      aria-label="Toggle language"
    >
      <motion.div
        layout
        animate={{ x: isFr ? 0 : 36 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="absolute w-8 h-7 rounded-full bg-[#9B1C1C] shadow-sm"
        style={{ left: 2 }}
      />
      <span className={`relative z-10 w-9 text-center text-xs font-bold transition-colors ${isFr ? 'text-white' : 'text-slate-500'}`}>
        FR
      </span>
      <span className={`relative z-10 w-9 text-center text-xs font-bold transition-colors ${!isFr ? 'text-white' : 'text-slate-500'}`}>
        ع
      </span>
    </button>
  );
}