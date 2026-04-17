import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  fr: {
    home: "Accueil", newRequest: "Nouvelle demande", myRequests: "Mes demandes",
    admin: "Administration", logout: "Déconnexion", login: "Connexion",
    district: "Arrondissement Yakoub El Mansour", city: "Rabat",
    country: "Royaume du Maroc", districtShort: "Yakoub El Mansour",
    heroTitle: "Services Administratifs en Ligne",
    heroSubtitle: "Arrondissement Yakoub El Mansour — Rabat",
    ourServices: "Nos Services", startRequest: "Faire une demande",
    trackRequest: "Suivre ma demande",
    heroDesc: "Demandez vos documents officiels rapidement et simplement, sans vous déplacer.",
    certificat_residence: "Certificat de résidence",
    certificat_vie: "Certificat de vie",
    certificat_celibat: "Certificat de célibat",
    extrait_naissance: "Extrait d'acte de naissance",
    certificat_bonne_vie: "Certificat de bonne vie et mœurs",
    fiche_etat_civil: "Fiche d'état civil",
    legalisation_signature: "Légalisation de signature",
    certificat_nationalite: "Certificat de nationalité",
    certificat_residence_desc: "Justificatif de domicile officiel délivré par l'arrondissement",
    certificat_vie_desc: "Attestation prouvant que le demandeur est en vie",
    certificat_celibat_desc: "Attestation officielle de célibat pour démarches administratives",
    extrait_naissance_desc: "Copie intégrale ou extrait de l'acte de naissance",
    certificat_bonne_vie_desc: "Attestation de moralité et de bonne conduite citoyenne",
    fiche_etat_civil_desc: "Document récapitulatif de la situation civile et familiale",
    legalisation_signature_desc: "Authentification officielle de signature sur documents",
    certificat_nationalite_desc: "Attestation de la nationalité marocaine",
    firstName: "Prénom", lastName: "Nom de famille",
    firstNameAr: "الاسم", lastNameAr: "اللقب",
    dateOfBirth: "Date de naissance", placeOfBirth: "Lieu de naissance",
    placeOfBirthAr: "مكان الازدياد", nationalId: "N° CIN",
    address: "Adresse", addressAr: "العنوان", phone: "Téléphone",
    fatherName: "Nom du père", fatherNameAr: "اسم الأب",
    motherName: "Nom de la mère", motherNameAr: "اسم الأم",
    purpose: "Motif de la demande", submit: "Soumettre la demande",
    pending: "En attente", in_review: "En révision", approved: "Approuvée",
    rejected: "Rejetée", document_generated: "Document généré",
    requestSubmitted: "Votre demande a été soumise avec succès",
    requestNumber: "Numéro de demande", downloadPdf: "Télécharger le document",
    noRequests: "Vous n'avez aucune demande en cours",
    allRequests: "Toutes les demandes", approve: "Approuver", reject: "Rejeter",
    generatePdf: "Générer le document", adminNotes: "Notes administratives",
    rejectionReason: "Motif du rejet", selectDocument: "Sélectionnez un document",
    required: "Obligatoire", optional: "Optionnel", back: "Retour", save: "Enregistrer",
    cancel: "Annuler", date: "Date", actions: "Actions", details: "Détails",
    frenchInfo: "Informations en français", arabicInfo: "المعلومات بالعربية",
    personalInfo: "Informations personnelles", familyInfo: "Informations familiales",
    contactInfo: "Coordonnées", loading: "Chargement...", search: "Rechercher",
    filter: "Filtrer", all: "Tous", preparationLocation: "Lieu de collecte du document",
    collectionInstructions: "Rendez-vous à ce lieu pour récupérer votre document",
    viewOnMap: "Voir sur la carte",
  },
  ar: {
    home: "الرئيسية", newRequest: "طلب جديد", myRequests: "طلباتي",
    admin: "الإدارة", logout: "تسجيل الخروج", login: "تسجيل الدخول",
    district: "مقاطعة يعقوب المنصور", city: "الرباط",
    country: "المملكة المغربية", districtShort: "يعقوب المنصور",
    heroTitle: "الخدمات الإدارية الرقمية",
    heroSubtitle: "مقاطعة يعقوب المنصور — الرباط",
    ourServices: "خدماتنا", startRequest: "تقديم طلب",
    trackRequest: "تتبع طلبي",
    heroDesc: "اطلب وثائقك الرسمية بسرعة وسهولة دون الحاجة للتنقل.",
    certificat_residence: "شهادة السكنى",
    certificat_vie: "شهادة الحياة",
    certificat_celibat: "شهادة عدم الزواج",
    extrait_naissance: "نسخة من عقد الازدياد",
    certificat_bonne_vie: "شهادة حسن السيرة والسلوك",
    fiche_etat_civil: "بطاقة الحالة المدنية",
    legalisation_signature: "التصديق على التوقيع",
    certificat_nationalite: "شهادة الجنسية المغربية",
    certificat_residence_desc: "وثيقة رسمية تثبت محل إقامة المواطن",
    certificat_vie_desc: "شهادة تثبت أن الشخص المعني على قيد الحياة",
    certificat_celibat_desc: "وثيقة تثبت الحالة العزبية للمواطن",
    extrait_naissance_desc: "نسخة رسمية من سجل الحالة المدنية",
    certificat_bonne_vie_desc: "شهادة تثبت حسن السيرة والسلوك",
    fiche_etat_civil_desc: "ملخص الوضعية المدنية والعائلية للمواطن",
    legalisation_signature_desc: "توثيق رسمي للتوقيع على الوثائق الإدارية",
    certificat_nationalite_desc: "إثبات التمتع بالجنسية المغربية",
    firstName: "الاسم", lastName: "اللقب",
    firstNameAr: "الاسم بالعربية", lastNameAr: "اللقب بالعربية",
    dateOfBirth: "تاريخ الازدياد", placeOfBirth: "مكان الازدياد (بالفرنسية)",
    placeOfBirthAr: "مكان الازدياد", nationalId: "رقم البطاقة الوطنية",
    address: "العنوان (بالفرنسية)", addressAr: "العنوان", phone: "الهاتف",
    fatherName: "اسم الأب (بالفرنسية)", fatherNameAr: "اسم الأب",
    motherName: "اسم الأم (بالفرنسية)", motherNameAr: "اسم الأم",
    purpose: "سبب الطلب", submit: "تقديم الطلب",
    pending: "قيد الانتظار", processing: "قيد المعالجة", approved: "مقبول",
    rejected: "مرفوض", ready: "جاهز",
    requestSubmitted: "تم تقديم طلبك بنجاح",
    requestNumber: "رقم الطلب", downloadPdf: "تحميل الوثيقة",
    noRequests: "لا توجد لديك طلبات حالية",
    allRequests: "جميع الطلبات", approve: "قبول", reject: "رفض",
    generatePdf: "إنشاء الوثيقة", adminNotes: "ملاحظات إدارية",
    rejectionReason: "سبب الرفض", selectDocument: "اختر نوع الوثيقة",
    required: "مطلوب", optional: "اختياري", back: "رجوع", save: "حفظ",
    cancel: "إلغاء", date: "التاريخ", actions: "الإجراءات", details: "التفاصيل",
    frenchInfo: "المعلومات بالفرنسية", arabicInfo: "المعلومات بالعربية",
    personalInfo: "المعلومات الشخصية", familyInfo: "معلومات العائلة",
    contactInfo: "معلومات الاتصال", loading: "جار التحميل...", search: "بحث",
    filter: "تصفية", all: "الكل", preparationLocation: "مكان استلام الوثيقة",
    collectionInstructions: "توجه إلى هذا المكان لاستلام وثيقتك",
    viewOnMap: "عرض على الخريطة",
  }
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('fr');
  useEffect(() => {
    const savedLang = localStorage.getItem('preferred_language');
    if (savedLang) setLanguage(savedLang);
  }, []);
  const toggleLanguage = () => {
    const newLang = language === 'fr' ? 'ar' : 'fr';
    setLanguage(newLang);
    localStorage.setItem('preferred_language', newLang);
  };
  const t = (key) => translations[language][key] || key;
  const isRTL = language === 'ar';
  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
}