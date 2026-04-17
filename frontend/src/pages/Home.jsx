import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../components/LanguageContext';
import DocumentCard from '../components/ui/DocumentCard';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Shield, Clock, FileCheck, Globe, ChevronRight, ChevronLeft, MapPin } from 'lucide-react';

const DOCUMENT_TYPES = [
  'certificat_residence','certificat_vie','certificat_celibat','extrait_naissance',
  'certificat_bonne_vie','fiche_etat_civil','legalisation_signature','certificat_nationalite',
];

export default function Home() {
  const { t, isRTL } = useLanguage();
  const Arrow = isRTL ? ArrowLeft : ArrowRight;
  const Chevron = isRTL ? ChevronLeft : ChevronRight;

  const features = [
    { icon: Shield, titleFr: 'Sécurisé', titleAr: 'آمن', descFr: 'Données protégées', descAr: 'بياناتك محمية' },
    { icon: Clock,  titleFr: 'Rapide',   titleAr: 'سريع', descFr: 'Traitement en 48h', descAr: 'معالجة في 48 ساعة' },
    { icon: FileCheck, titleFr: 'Officiel', titleAr: 'رسمي', descFr: 'Documents certifiés', descAr: 'وثائق معتمدة' },
    { icon: Globe,  titleFr: 'Bilingue', titleAr: 'ثنائي اللغة', descFr: 'Arabe & Français', descAr: 'عربي وفرنسي' },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#9B1C1C] via-[#7F1D1D] to-[#4A0808]">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#C8A951]/10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3" />
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-32">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-white/80 text-sm mb-6">
              <MapPin className="w-4 h-4 text-[#C8A951]" />
              {isRTL ? 'مقاطعة يعقوب المنصور — الرباط' : 'Arrondissement Yakoub El Mansour — Rabat'}
            </div>
            <div className="text-4xl mb-4 opacity-40 select-none">✦ ✦ ✦</div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">{t('heroTitle')}</h1>
            <p className="text-lg sm:text-xl text-white/60 mb-10 leading-relaxed max-w-xl mx-auto">{t('heroDesc')}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/new-request"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#C8A951] text-[#4A0808] font-semibold rounded-xl hover:bg-[#D4B75F] transition-all shadow-lg shadow-[#C8A951]/30">
                {t('startRequest')}<Arrow className="w-5 h-5" />
              </Link>
              <Link to="/my-requests"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all backdrop-blur-sm border border-white/15">
                {t('trackRequest')}<Chevron className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L1440 60L1440 30C1200 60 960 0 720 30C480 60 240 0 0 30L0 60Z" fill="#f8fafc" />
          </svg>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {features.map((feature, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }}
              className="bg-white rounded-2xl p-5 sm:p-6 shadow-lg shadow-slate-200/50 border border-slate-100 hover:shadow-xl transition-shadow">
              <feature.icon className="w-8 h-8 text-[#C8A951] mb-3" />
              <h3 className="font-semibold text-[#9B1C1C] text-sm sm:text-base">{isRTL ? feature.titleAr : feature.titleFr}</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">{isRTL ? feature.descAr : feature.descFr}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Documents Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mb-12">
          <p className="text-sm font-medium text-[#9B1C1C]/60 uppercase tracking-widest mb-3">{isRTL ? 'ما نقدمه' : 'Ce que nous proposons'}</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">{t('ourServices')}</h2>
          <div className="w-16 h-1 bg-[#C8A951] rounded-full mx-auto" />
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {DOCUMENT_TYPES.map((type, i) => (
            <Link key={type} to={`/new-request?type=${type}`}>
              <DocumentCard type={type} index={i} />
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="bg-gradient-to-r from-[#9B1C1C] to-[#7F1D1D] rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '30px 30px' }} />
          <div className="relative">
            <p className="text-[#C8A951] text-3xl mb-4">★</p>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">{isRTL ? 'ابدأ طلبك الآن' : 'Commencez votre démarche dès maintenant'}</h3>
            <p className="text-white/70 mb-8 max-w-md mx-auto">{isRTL ? 'وفّر وقتك وتقدّم بطلبك عبر الإنترنت في دقائق' : 'Gagnez du temps et déposez votre dossier en ligne en quelques minutes'}</p>
            <Link to="/new-request"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#C8A951] text-[#4A0808] font-semibold rounded-xl hover:bg-[#D4B75F] transition-all shadow-lg">
              {t('startRequest')}<Arrow className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}