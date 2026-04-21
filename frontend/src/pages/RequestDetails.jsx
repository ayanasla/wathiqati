import React, { useState, useEffect } from 'react';
import { getRequest, getRequestDocument, getRequestLocation } from '../api';
import { useLanguage } from '../components/LanguageContext';
import StatusBadge from '../components/ui/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { format } from 'date-fns';
import { useNavigate, useParams } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Download,
  User,
  Users,
  Phone,
  Calendar,
  CreditCard,
  MapPin,
  Map
} from 'lucide-react';

export default function RequestDetails() {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [docInfo, setDocInfo] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  const { id } = useParams();

  useEffect(() => {
    async function load() {
      try {
        const req = await getRequest(id);
        setRequest(req);

        // نحمي التطبيق إلا ماكانش function فـ API
        if (typeof getRequestDocument === 'function') {
          try {
            const doc = await getRequestDocument(id);
            setDocInfo(doc);
          } catch (docError) {
            console.warn("Error fetching document:", docError);
            // Document info will be null, but we can still display the request
          }
        } else {
          console.warn("getRequestDocument is not defined in API");
        }

        // Fetch the location separately to ensure fresh location data
        if (typeof getRequestLocation === 'function') {
          try {
            const loc = await getRequestLocation(id);
            // Merge location data with request data
            if (loc) {
              setLocation(loc);
            }
          } catch (locError) {
            console.warn("Error fetching location:", locError);
            // Location will be null, but we can still display the request
            // Since request.preparationLocation is already available
          }
        } else {
          console.warn("getRequestLocation is not defined in API");
        }
      } catch (error) {
        console.error("ERROR LOADING REQUEST =", error);
      } finally {
        setLoading(false);
      }
    }

    if (id) load();
    else setLoading(false);
  }, [id]);

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-500">
          {isRTL ? 'الطلب غير موجود' : 'Demande introuvable'}
        </p>
      </div>
    );
  }

  const InfoRow = ({ icon: Icon, label, value, dir }) =>
    value ? (
      <div className="flex items-start gap-3 py-3 border-b border-slate-50 last:border-0" dir={dir}>
        <Icon className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-xs text-slate-400">{label}</p>
          <p className="font-medium text-slate-800 text-sm">{value}</p>
        </div>
      </div>
    ) : null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      <button
        onClick={() => navigate(createPageUrl('MyRequests'))}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-[#9B1C1C] transition-colors mb-6"
      >
        <BackArrow className="w-4 h-4" />
        {t('myRequests')}
      </button>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {t(request.documentType)}
            </h1>
            <p className="text-slate-500 mt-1 text-sm">
              {request.requestNumber}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <StatusBadge status={request.status} />

            {((request.status === 'approved' || request.status === 'document_generated') &&
              (request.pdfUrl || request.documentUrl)) && (
              <a
                href={request.pdfUrl || request.documentUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="rounded-xl gap-2 bg-[#C8A951] hover:bg-[#D4B75F] text-[#4A0808] font-semibold">
                  <Download className="w-4 h-4" />
                  {t('downloadPdf')}
                </Button>
              </a>
            )}
          </div>
        </div>

        {((request.status === 'approved' || request.status === 'document_generated') &&
          (location?.preparationLocation || request.preparationLocation)) && (
          <div className="mt-6 p-6 bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-2xl shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <span className="text-lg">📍</span>
              </div>

              <div className="flex-1">
                <h3 className="text-sm font-bold text-emerald-800 mb-1">
                  {t('preparationLocation')}
                </h3>

                <p className="text-base font-semibold text-emerald-900 mb-2">
                  {location?.preparationLocation || request.preparationLocation}
                </p>

                <p className="text-sm text-emerald-700 mb-3">
                  {t('collectionInstructions')}
                </p>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    location?.preparationLocation || request.preparationLocation
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Map className="w-4 h-4" />
                  {t('viewOnMap') || 'View on Map'}
                </a>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-0">
              <CardTitle className="text-sm text-[#9B1C1C] flex items-center gap-2">
                <User className="w-4 h-4" />
                {t('frenchInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <InfoRow icon={User} label={t('firstName')} value={request.firstNameFr} />
              <InfoRow icon={User} label={t('lastName')} value={request.lastNameFr} />
              <InfoRow icon={MapPin} label={t('placeOfBirth')} value={request.placeOfBirthFr} />
              <InfoRow icon={Users} label={t('fatherName')} value={request.fatherNameFr} />
              <InfoRow icon={Users} label={t('motherName')} value={request.motherNameFr} />
              <InfoRow icon={MapPin} label={t('address')} value={request.addressFr} />
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md" dir="rtl">
            <CardHeader className="pb-0">
              <CardTitle className="text-sm text-[#9B1C1C] flex items-center gap-2">
                <User className="w-4 h-4" />
                {t('arabicInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <InfoRow icon={User} label="الاسم" value={request.firstNameAr} dir="rtl" />
              <InfoRow icon={User} label="اللقب" value={request.lastNameAr} dir="rtl" />
              <InfoRow icon={MapPin} label="مكان الازدياد" value={request.placeOfBirthAr} dir="rtl" />
              <InfoRow icon={Users} label="اسم الأب" value={request.fatherNameAr} dir="rtl" />
              <InfoRow icon={Users} label="اسم الأم" value={request.motherNameAr} dir="rtl" />
              <InfoRow icon={MapPin} label="العنوان" value={request.addressAr} dir="rtl" />
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md md:col-span-2">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <InfoRow
                  icon={Calendar}
                  label={t('dateOfBirth')}
                  value={
                    request.dateOfBirth
                      ? format(new Date(request.dateOfBirth), 'dd/MM/yyyy')
                      : ''
                  }
                />
                <InfoRow icon={CreditCard} label={t('nationalId')} value={request.nationalId} />
                <InfoRow icon={Phone} label={t('phone')} value={request.phone} />
              </div>

              {request.purpose && (
                <div className="mt-4 p-4 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-400 mb-1">{t('purpose')}</p>
                  <p className="text-sm text-slate-700">{request.purpose}</p>
                </div>
              )}

              {request.rejectionReason && request.status === 'rejected' && (
                <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-100">
                  <p className="text-xs text-red-400 mb-1">{t('rejectionReason')}</p>
                  <p className="text-sm text-red-700">{request.rejectionReason}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}