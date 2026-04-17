import React from 'react';
import { motion } from 'framer-motion';
import { Home, HeartPulse, Heart, FileText, Shield, User, Pencil, Flag, ArrowRight, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

const iconMap = {
  certificat_residence: Home,
  certificat_vie: HeartPulse,
  certificat_celibat: Heart,
  extrait_naissance: FileText,
  certificat_bonne_vie: Shield,
  fiche_etat_civil: User,
  legalisation_signature: Pencil,
  certificat_nationalite: Flag,
};

export default function DocumentCard({ type, onClick, index = 0 }) {
  const { t, isRTL } = useLanguage();
  const Icon = iconMap[type] || FileText;
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(155, 28, 28, 0.12)' }}
      onClick={onClick}
      className="group cursor-pointer bg-white rounded-2xl p-6 border border-slate-100 hover:border-[#C8A951]/40 transition-all duration-300 h-full"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#9B1C1C] to-[#7F1D1D] flex items-center justify-center shadow-md shadow-[#9B1C1C]/20 group-hover:scale-105 transition-transform duration-300">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-[#C8A951]/15 transition-colors duration-300">
          <Arrow className="w-4 h-4 text-slate-400 group-hover:text-[#C8A951] transition-colors" />
        </div>
      </div>
      <h3 className="text-base font-semibold text-slate-800 mb-2 group-hover:text-[#9B1C1C] transition-colors leading-snug">
        {t(type)}
      </h3>
      <p className="text-xs text-slate-500 leading-relaxed">{t(`${type}_desc`)}</p>
    </motion.div>
  );
}