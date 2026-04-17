import React, { useState, useEffect } from 'react';
import { useLanguage } from '../components/LanguageContext';
import StatusBadge from '../components/ui/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { Skeleton } from '../components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';
import { getRequest, updateRequest, approveRequest, uploadDocument, generateDocumentRequest } from '../services/api.client';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle, FileDown, Upload, Loader2, User, FileText } from 'lucide-react';

export default function AdminRequestDetail() {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [preparationLocation, setPreparationLocation] = useState('');
  const [documentFile, setDocumentFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');

  useEffect(() => {
    async function load() {
      try {
        const req = await getRequest(id);
        if (req) {
          setRequest(req);
          setNewStatus(req.status || 'pending');
          setAdminNotes(req.adminNotes || '');
          setRejectionReason(req.rejectionReason || '');
          setPreparationLocation(req.preparationLocation || '');
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
    else setLoading(false);
  }, [id]);

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  const refreshRequest = async () => {
    const req = await getRequest(id);
    if (req) {
      setRequest(req);
      setNewStatus(req.status || 'pending');
      setAdminNotes(req.adminNotes || '');
      setRejectionReason(req.rejectionReason || '');
      setPreparationLocation(req.preparationLocation || '');
    }
    return req;
  };

  const updateStatus = async () => {
    setUpdating(true);
    const updateData = { status: newStatus, adminNotes: adminNotes };
    if (newStatus === 'rejected') updateData.rejectionReason = rejectionReason;
    try {
      await updateRequest(id, updateData);
      const refreshed = await refreshRequest();
      if (refreshed) {
        console.log('[AdminRequestDetail] Status updated successfully:', { id, status: refreshed.status });
      }
    } catch (error) {
      console.error('[AdminRequestDetail] Update status failed:', error);
      alert('Unable to update status.');
    } finally {
      setUpdating(false);
    }
  };

  const handleApprove = async () => {
    if (!preparationLocation.trim()) {
      alert('Please specify a preparation location before approving.');
      return;
    }

    setUpdating(true);
    try {
      await approveRequest(id, preparationLocation);
      const refreshed = await refreshRequest();
      if (refreshed) {
        console.log('[AdminRequestDetail] Request approved successfully:', { id, status: refreshed.status });
      }
      alert('Request approved successfully! PDF generated.');
    } catch (error) {
      console.error('[AdminRequestDetail] Approve request failed:', error);
      alert('Unable to approve request.');
    } finally {
      setUpdating(false);
    }
  };

  const generateDocument = async () => {
    setGeneratingPdf(true);
    try {
      await generateDocumentRequest(id);
      const refreshed = await refreshRequest();
      if (refreshed) {
        console.log('[AdminRequestDetail] Document generated successfully:', { id, status: refreshed.status });
      }
      alert('Document generated successfully!');
    } catch (error) {
      console.error('[AdminRequestDetail] Generate document failed:', error);
      alert('Unable to generate document.');
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleDocumentUpload = async () => {
    if (!documentFile) {
      alert('Please select a file to upload');
      return;
    }

    setUploading(true);

    try {
      await uploadDocument(id, documentFile, { preparationLocation });
      const refreshed = await refreshRequest();
      if (refreshed) {
        setNewStatus(refreshed.status || 'document_generated');
        console.log('[AdminRequestDetail] Document uploaded successfully:', { id, status: refreshed.status });
      }
      setDocumentFile(null);
      alert('Document uploaded successfully!');
    } catch (error) {
      console.error('[AdminRequestDetail] Failed to upload document:', error);
      alert('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Skeleton className="h-8 w-48 mb-6" /><Skeleton className="h-96 w-full rounded-2xl" />
    </div>
  );

  if (!request) return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <p className="text-slate-500">{isRTL ? 'الطلب غير موجود' : 'Demande introuvable'}</p>
    </div>
  );

  const InfoRow = ({ label, value, dir }) => value ? (
    <div className="flex items-start justify-between py-2 border-b border-slate-50 text-sm" dir={dir}>
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-800">{value}</span>
    </div>
  ) : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <button onClick={() => navigate(createPageUrl('AdminDashboard'))}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-[#9B1C1C] transition-colors mb-6">
        <BackArrow className="w-4 h-4" />{t('allRequests')}
      </button>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{t(request.documentType)}</h1>
            <p className="text-slate-500 mt-1 text-sm">{request.requestNumber} • {request.firstNameFr} {request.lastNameFr}</p>
          </div>
          <StatusBadge status={request.status} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-sm text-[#9B1C1C] flex items-center gap-2"><User className="w-4 h-4" />{t('personalInfo')}</CardTitle>
              </CardHeader>
              <CardContent>
                <InfoRow label={t('firstName')} value={request.firstNameFr} />
                <InfoRow label={t('lastName')} value={request.lastNameFr} />
                <InfoRow label="الاسم" value={request.firstNameAr} dir="rtl" />
                <InfoRow label="اللقب" value={request.lastNameAr} dir="rtl" />
                <InfoRow label={t('dateOfBirth')} value={request.dateOfBirth ? format(new Date(request.dateOfBirth), 'dd/MM/yyyy') : ''} />
                <InfoRow label={t('nationalId')} value={request.nationalId} />
                <InfoRow label={t('placeOfBirth')} value={request.placeOfBirthFr} />
                <InfoRow label="مكان الازدياد" value={request.placeOfBirthAr} dir="rtl" />
                <InfoRow label={t('fatherName')} value={request.fatherNameFr} />
                <InfoRow label="اسم الأب" value={request.fatherNameAr} dir="rtl" />
                <InfoRow label={t('motherName')} value={request.motherNameFr} />
                <InfoRow label="اسم الأم" value={request.motherNameAr} dir="rtl" />
                <InfoRow label={t('phone')} value={request.phone} />
                <InfoRow label={t('address')} value={request.addressFr} />
                <InfoRow label="العنوان" value={request.addressAr} dir="rtl" />
                <InfoRow label={t('purpose')} value={request.purpose} />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card className="border-0 shadow-md">
              <CardHeader><CardTitle className="text-sm text-[#9B1C1C]">{t('actions')}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs text-slate-500">Statut</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger className="mt-1 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['pending', 'in_review', 'approved', 'rejected', 'document_generated'].map(s => (
                        <SelectItem key={s} value={s}>{t(s)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {newStatus === 'rejected' && (
                  <div>
                    <Label className="text-xs text-slate-500">{t('rejectionReason')}</Label>
                    <Textarea value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} className="mt-1 rounded-xl" rows={3} />
                  </div>
                )}
                <div>
                  <Label className="text-xs text-slate-500">{t('adminNotes')}</Label>
                  <Textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} className="mt-1 rounded-xl" rows={3} />
                </div>
                <div>
                  <Label className="text-xs text-slate-500">📍 Preparation Location</Label>
                  <Input 
                    type="text" 
                    placeholder="Arrondissement Yaacoub El Mansour - Rabat"
                    value={preparationLocation} 
                    onChange={e => setPreparationLocation(e.target.value)} 
                    className="mt-1 rounded-xl" 
                  />
                  {request.preparationLocation && (
                    <p className="text-xs text-slate-500 mt-1">Currently set: {request.preparationLocation}</p>
                  )}
                </div>
                <Button onClick={updateStatus} disabled={updating} className="w-full bg-[#9B1C1C] hover:bg-[#7F1D1D] rounded-xl gap-2">
                  {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}{t('save')}
                </Button>
                {newStatus === 'approved' && (
                  <Button onClick={handleApprove} disabled={updating || !preparationLocation.trim()} className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl gap-2">
                    {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}Approve & Generate PDF
                  </Button>
                )}
                <div className="border-t border-slate-100 pt-4 space-y-4">
                  <div>
                    <Label className="text-xs text-slate-500">Upload Document (PDF)</Label>
                    <Input 
                      type="file" 
                      accept=".pdf"
                      onChange={e => setDocumentFile(e.target.files?.[0] || null)}
                      className="mt-1 rounded-xl"
                    />
                  </div>
                  <Button onClick={handleDocumentUpload} disabled={uploading || !documentFile} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-2">
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}Upload Document
                  </Button>
                  <Button onClick={generateDocument} disabled={generatingPdf} className="w-full bg-[#C8A951] hover:bg-[#D4B75F] text-[#4A0808] font-semibold rounded-xl gap-2">
                    {generatingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}{t('generatePdf')}
                  </Button>
                </div>
                {(request.pdf_url || request.documentUrl) && (
                  <a href={request.pdf_url || request.documentUrl} target="_blank" rel="noopener noreferrer" className="block">
                    <Button variant="outline" className="w-full rounded-xl gap-2">
                      <FileText className="w-4 h-4" />{t('downloadPdf')}
                    </Button>
                  </a>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
}