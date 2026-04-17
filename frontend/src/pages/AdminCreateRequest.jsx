import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { createRequest } from '../api';
import { useLanguage } from '../components/LanguageContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { motion } from 'framer-motion';
import { CheckCircle, FileText, Loader2 } from 'lucide-react';

const DOCUMENT_TYPES = [
  'certificat_residence','certificat_vie','certificat_celibat','extrait_naissance',
  'certificat_bonne_vie','fiche_etat_civil','legalisation_signature','certificat_nationalite',
];

export default function AdminCreateRequest() {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [response, setResponse] = useState(null);

  const [formData, setFormData] = useState({
    document_type: '',
    first_name_fr: '', last_name_fr: '', first_name_ar: '', last_name_ar: '',
    date_of_birth: '', place_of_birth_fr: '', place_of_birth_ar: '',
    national_id: '', address_fr: '', address_ar: '', phone: '',
    father_name_fr: '', father_name_ar: '', mother_name_fr: '', mother_name_ar: '',
    purpose: '', notes: '',
  });

  const update = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const data = await createRequest(formData);
      setResponse(data);
      setSuccess(true);
    } catch (error) {
      console.error(error);
      alert('Unable to create request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success && response) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 sm:py-24 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
          <div className="w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-emerald-500" />
          </div>
        </motion.div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Request Created Successfully</h2>
        <p className="text-slate-500 mb-8">Request details:</p>
        <div className="bg-slate-50 border rounded-2xl p-6 mb-8 text-left">
          <p><strong>Request ID:</strong> {response.id}</p>
          <p><strong>Status:</strong> {response.status}</p>
          {response.pdf_url && <p><strong>PDF Link:</strong> <a href={response.pdf_url} target="_blank" rel="noopener noreferrer">Download PDF</a></p>}
        </div>
        <Button onClick={() => navigate(createPageUrl('AdminDashboard'))} className="bg-[#9B1C1C] hover:bg-[#7F1D1D] text-white px-8 py-3 rounded-xl">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Create Official Document Request
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Document Type */}
            <div>
              <Label htmlFor="document_type">Document Type *</Label>
              <Select value={formData.document_type} onValueChange={(value) => update('document_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map(type => (
                    <SelectItem key={type} value={type}>{type.replace(/_/g, ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Personal Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name_fr">First Name (FR) *</Label>
                <Input id="first_name_fr" value={formData.first_name_fr} onChange={(e) => update('first_name_fr', e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="first_name_ar">First Name (AR) *</Label>
                <Input id="first_name_ar" value={formData.first_name_ar} onChange={(e) => update('first_name_ar', e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="last_name_fr">Last Name (FR) *</Label>
                <Input id="last_name_fr" value={formData.last_name_fr} onChange={(e) => update('last_name_fr', e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="last_name_ar">Last Name (AR) *</Label>
                <Input id="last_name_ar" value={formData.last_name_ar} onChange={(e) => update('last_name_ar', e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="date_of_birth">Date of Birth *</Label>
                <Input id="date_of_birth" type="date" value={formData.date_of_birth} onChange={(e) => update('date_of_birth', e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="national_id">National ID *</Label>
                <Input id="national_id" value={formData.national_id} onChange={(e) => update('national_id', e.target.value)} required />
              </div>
            </div>

            {/* Birth Place */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="place_of_birth_fr">Place of Birth (FR)</Label>
                <Input id="place_of_birth_fr" value={formData.place_of_birth_fr} onChange={(e) => update('place_of_birth_fr', e.target.value)} />
              </div>
              <div>
                <Label htmlFor="place_of_birth_ar">Place of Birth (AR)</Label>
                <Input id="place_of_birth_ar" value={formData.place_of_birth_ar} onChange={(e) => update('place_of_birth_ar', e.target.value)} />
              </div>
            </div>

            {/* Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="address_fr">Address (FR)</Label>
                <Input id="address_fr" value={formData.address_fr} onChange={(e) => update('address_fr', e.target.value)} />
              </div>
              <div>
                <Label htmlFor="address_ar">Address (AR)</Label>
                <Input id="address_ar" value={formData.address_ar} onChange={(e) => update('address_ar', e.target.value)} />
              </div>
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={formData.phone} onChange={(e) => update('phone', e.target.value)} />
            </div>

            {/* Family Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="father_name_fr">Father Name (FR)</Label>
                <Input id="father_name_fr" value={formData.father_name_fr} onChange={(e) => update('father_name_fr', e.target.value)} />
              </div>
              <div>
                <Label htmlFor="father_name_ar">Father Name (AR)</Label>
                <Input id="father_name_ar" value={formData.father_name_ar} onChange={(e) => update('father_name_ar', e.target.value)} />
              </div>
              <div>
                <Label htmlFor="mother_name_fr">Mother Name (FR)</Label>
                <Input id="mother_name_fr" value={formData.mother_name_fr} onChange={(e) => update('mother_name_fr', e.target.value)} />
              </div>
              <div>
                <Label htmlFor="mother_name_ar">Mother Name (AR)</Label>
                <Input id="mother_name_ar" value={formData.mother_name_ar} onChange={(e) => update('mother_name_ar', e.target.value)} />
              </div>
            </div>

            {/* Purpose */}
            <div>
              <Label htmlFor="purpose">Purpose</Label>
              <Textarea id="purpose" value={formData.purpose} onChange={(e) => update('purpose', e.target.value)} />
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" value={formData.notes} onChange={(e) => update('notes', e.target.value)} />
            </div>

            <Button type="submit" disabled={submitting} className="w-full bg-[#9B1C1C] hover:bg-[#7F1D1D] text-white">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Create Request
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}