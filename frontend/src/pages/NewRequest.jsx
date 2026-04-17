import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { createRequest } from '../api';
import { useLanguage } from '../components/LanguageContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, CheckCircle, FileText, User, Users, Phone, Loader2 } from 'lucide-react';

const DOCUMENT_TYPES = [
  'certificat_residence','certificat_vie','certificat_celibat','extrait_naissance',
  'certificat_bonne_vie','fiche_etat_civil','legalisation_signature','certificat_nationalite',
];

export default function NewRequest() {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [requestNumber, setRequestNumber] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);

  const urlParams = new URLSearchParams(window.location.search);
  const preselectedType = urlParams.get('type');

  const [formData, setFormData] = useState({
    document_type: preselectedType || '',
    first_name_fr: '', last_name_fr: '', first_name_ar: '', last_name_ar: '',
    date_of_birth: '', place_of_birth_fr: '', place_of_birth_ar: '',
    national_id: '', address_fr: '', address_ar: '', phone: '',
    father_name_fr: '', father_name_ar: '', mother_name_fr: '', mother_name_ar: '',
    municipality: '',
    purpose: '',
  });

  const update = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const FieldError = ({ field }) => {
    return validationErrors[field] ? (
      <p className="text-red-600 text-sm mt-1">{validationErrors[field]}</p>
    ) : null;
  };

  const generateRequestNumber = () => {
    const date = new Date();
    const y = date.getFullYear().toString().slice(-2);
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const rand = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `YM-${y}${m}-${rand}`;
  };

  const handleSubmit = async () => {
    setSubmitError(null);
    setValidationErrors({});

    // Validate all required fields before submission
    const errors = {};

    if (!formData.document_type) {
      errors.document_type = 'Please select a document type';
    }

    if (!formData.municipality?.trim()) {
      errors.municipality = 'Municipality is required';
    }

    if (!formData.first_name_fr?.trim()) {
      errors.first_name_fr = 'First name (French) is required';
    }

    if (!formData.last_name_fr?.trim()) {
      errors.last_name_fr = 'Last name (French) is required';
    }

    if (!formData.first_name_ar?.trim()) {
      errors.first_name_ar = 'First name (Arabic) is required';
    }

    if (!formData.last_name_ar?.trim()) {
      errors.last_name_ar = 'Last name (Arabic) is required';
    }

    if (!formData.date_of_birth) {
      errors.date_of_birth = 'Date of birth is required';
    }

    if (!formData.national_id?.trim()) {
      errors.national_id = 'National ID is required';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setSubmitError('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const reqNum = generateRequestNumber();
      
      // Filter out only truly undefined/null values, keep empty strings for validation
      const requestData = Object.fromEntries(
        Object.entries({
          ...formData,
          request_number: reqNum,
        }).filter(([key, value]) => value !== null && value !== undefined)
      );
      
      const data = await createRequest(requestData);
      setRequestNumber(data.requestNumber || data.request_number || reqNum);
      setSuccess(true);
    } catch (error) {
      console.error('Request submission error:', error);

      // Handle backend validation errors
      if (error.errors) {
        setValidationErrors(error.errors);
        setSubmitError('Please correct the highlighted errors');
      } else {
        setSubmitError(error.message || 'Unable to create request. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const canGoNext = () => {
    if (step === 1) return !!formData.document_type;
    if (step === 2) return !!(formData.first_name_fr && formData.last_name_fr && formData.first_name_ar && formData.last_name_ar && formData.date_of_birth && formData.national_id);
    if (step === 4) return !!formData.municipality;
    return true;
  };

  const steps = [
    { num: 1, label: t('selectDocument'), icon: FileText },
    { num: 2, label: t('personalInfo'), icon: User },
    { num: 3, label: t('familyInfo'), icon: Users },
    { num: 4, label: t('contactInfo'), icon: Phone },
  ];

  if (success) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 sm:py-24 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
          <div className="w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-emerald-500" />
          </div>
        </motion.div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">{t('requestSubmitted')}</h2>
        <p className="text-slate-500 mb-8">{isRTL ? 'يمكنك تتبع طلبك من خلال الرقم أدناه' : 'Vous pouvez suivre votre demande avec le numéro ci-dessous'}</p>
        <div className="bg-red-50 border border-[#9B1C1C]/15 rounded-2xl p-6 mb-8">
          <p className="text-sm text-slate-500 mb-2">{t('requestNumber')}</p>
          <p className="text-3xl font-bold text-[#9B1C1C] tracking-wider">{requestNumber}</p>
        </div>
        <Button onClick={() => navigate(createPageUrl('MyRequests'))} className="bg-[#9B1C1C] hover:bg-[#7F1D1D] text-white px-8 py-3 rounded-xl">
          {t('myRequests')}
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      {/* Steps */}
      <div className="flex items-center justify-center mb-10 gap-2 overflow-x-auto pb-2">
        {steps.map((s, i) => (
          <React.Fragment key={s.num}>
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all
              ${step === s.num ? 'bg-[#9B1C1C] text-white shadow-md' : step > s.num ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
              <s.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{s.label}</span>
              <span className="sm:hidden">{s.num}</span>
            </div>
            {i < steps.length - 1 && <div className="w-6 h-px bg-slate-200 flex-shrink-0" />}
          </React.Fragment>
        ))}
      </div>

      <motion.div key={step} initial={{ opacity: 0, x: isRTL ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
        {/* Error Display */}
        {submitError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-800 font-medium">{submitError}</p>
          </div>
        )}

        {step === 1 && (
          <Card className="border-0 shadow-lg shadow-slate-200/60">
            <CardHeader className="pb-3"><CardTitle className="text-xl text-slate-800">{t('selectDocument')}</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {DOCUMENT_TYPES.map(type => (
                <button key={type} onClick={() => update('document_type', type)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-start transition-all
                    ${formData.document_type === type ? 'border-[#9B1C1C] bg-red-50' : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'}`}>
                  <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${formData.document_type === type ? 'border-[#9B1C1C]' : 'border-slate-300'}`}>
                    {formData.document_type === type && <div className="w-3 h-3 rounded-full bg-[#9B1C1C]" />}
                  </div>
                  <div>
                    <p className={`font-medium ${formData.document_type === type ? 'text-[#9B1C1C]' : 'text-slate-800'}`}>{t(type)}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{t(`${type}_desc`)}</p>
                  </div>
                </button>
              ))}
              <FieldError field="document_type" />
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="border-0 shadow-lg shadow-slate-200/60">
            <CardHeader className="pb-3"><CardTitle className="text-xl text-slate-800">{t('personalInfo')}</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-slate-50 rounded-xl p-5 space-y-4">
                <p className="text-sm font-semibold text-[#9B1C1C]">{t('frenchInfo')}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>{t('firstName')} *</Label>
                    <Input value={formData.first_name_fr} onChange={e => update('first_name_fr', e.target.value)} className="mt-1" />
                    <FieldError field="first_name_fr" />
                  </div>
                  <div>
                    <Label>{t('lastName')} *</Label>
                    <Input value={formData.last_name_fr} onChange={e => update('last_name_fr', e.target.value)} className="mt-1" />
                    <FieldError field="last_name_fr" />
                  </div>
                </div>
                <div>
                  <Label>{t('placeOfBirth')}</Label>
                  <Input value={formData.place_of_birth_fr} onChange={e => update('place_of_birth_fr', e.target.value)} className="mt-1" />
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-5 space-y-4" dir="rtl">
                <p className="text-sm font-semibold text-[#9B1C1C]">{t('arabicInfo')}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>{t('firstNameAr')} *</Label>
                    <Input value={formData.first_name_ar} onChange={e => update('first_name_ar', e.target.value)} className="mt-1" />
                    <FieldError field="first_name_ar" />
                  </div>
                  <div>
                    <Label>{t('lastNameAr')} *</Label>
                    <Input value={formData.last_name_ar} onChange={e => update('last_name_ar', e.target.value)} className="mt-1" />
                    <FieldError field="last_name_ar" />
                  </div>
                </div>
                <div>
                  <Label>{t('placeOfBirthAr')}</Label>
                  <Input value={formData.place_of_birth_ar} onChange={e => update('place_of_birth_ar', e.target.value)} className="mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>{t('dateOfBirth')} *</Label>
                  <Input type="date" value={formData.date_of_birth} onChange={e => update('date_of_birth', e.target.value)} className="mt-1" />
                  <FieldError field="date_of_birth" />
                </div>
                <div>
                  <Label>{t('nationalId')} *</Label>
                  <Input value={formData.national_id} onChange={e => update('national_id', e.target.value)} className="mt-1" placeholder="AB123456" />
                  <FieldError field="national_id" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card className="border-0 shadow-lg shadow-slate-200/60">
            <CardHeader className="pb-3"><CardTitle className="text-xl text-slate-800">{t('familyInfo')}</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-slate-50 rounded-xl p-5 space-y-4">
                <p className="text-sm font-semibold text-[#9B1C1C]">{t('frenchInfo')}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><Label>{t('fatherName')}</Label><Input value={formData.father_name_fr} onChange={e => update('father_name_fr', e.target.value)} className="mt-1" /></div>
                  <div><Label>{t('motherName')}</Label><Input value={formData.mother_name_fr} onChange={e => update('mother_name_fr', e.target.value)} className="mt-1" /></div>
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-5 space-y-4" dir="rtl">
                <p className="text-sm font-semibold text-[#9B1C1C]">{t('arabicInfo')}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><Label>{t('fatherNameAr')}</Label><Input value={formData.father_name_ar} onChange={e => update('father_name_ar', e.target.value)} className="mt-1" /></div>
                  <div><Label>{t('motherNameAr')}</Label><Input value={formData.mother_name_ar} onChange={e => update('mother_name_ar', e.target.value)} className="mt-1" /></div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 4 && (
          <Card className="border-0 shadow-lg shadow-slate-200/60">
            <CardHeader className="pb-3"><CardTitle className="text-xl text-slate-800">{t('contactInfo')}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label>{t('phone')}</Label><Input value={formData.phone} onChange={e => update('phone', e.target.value)} className="mt-1" placeholder="+212 6XX XXX XXX" /></div>
              <div>
                <Label>{t('municipality')} *</Label>
                <Input value={formData.municipality} onChange={e => update('municipality', e.target.value)} className="mt-1" placeholder="Yaacoub El Mansour" />
                <FieldError field="municipality" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label>{t('address')}</Label><Textarea value={formData.address_fr} onChange={e => update('address_fr', e.target.value)} className="mt-1" rows={3} /></div>
                <div dir="rtl"><Label>{t('addressAr')}</Label><Textarea value={formData.address_ar} onChange={e => update('address_ar', e.target.value)} className="mt-1" rows={3} /></div>
              </div>
              <div><Label>{t('purpose')}</Label><Textarea value={formData.purpose} onChange={e => update('purpose', e.target.value)} className="mt-1" rows={2} /></div>
            </CardContent>
          </Card>
        )}
      </motion.div>

      <div className="flex justify-between mt-8">
        {step > 1 ? (
          <Button variant="outline" onClick={() => setStep(step - 1)} className="gap-2 rounded-xl">
            {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}{t('back')}
          </Button>
        ) : <div />}
        {step < 4 ? (
          <Button onClick={() => setStep(step + 1)} disabled={!canGoNext()} className="gap-2 bg-[#9B1C1C] hover:bg-[#7F1D1D] text-white rounded-xl">
            {steps[step]?.label}{isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={submitting} className="gap-2 bg-[#C8A951] hover:bg-[#D4B75F] text-[#4A0808] rounded-xl font-semibold shadow-lg">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}{t('submit')}
          </Button>
        )}
      </div>
    </div>
  );
}