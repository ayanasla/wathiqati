import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { getRequests } from '../api';
import { useLanguage } from '../components/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import StatusBadge from '../components/ui/StatusBadge';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { FileText, Eye, Download, PlusCircle, Inbox, MapPin } from 'lucide-react';

export default function MyRequests() {
  const { t, isRTL } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only load requests if user is authenticated and auth is not loading
    if (!authLoading && user) {
      async function load() {
        try {
          const data = await getRequests();
          // Ensure data is always an array
          const requestsArray = Array.isArray(data) ? data : [];
          setRequests(requestsArray);
        } catch (error) {
          console.error(error);
          setRequests([]); // Set empty array on error
        } finally {
          setLoading(false);
        }
      }
      load();
    } else if (!authLoading && !user) {
      // If not authenticated, stop loading
      setLoading(false);
    }
  }, [user, authLoading]);

  if (authLoading || loading) return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Skeleton className="h-8 w-48 mb-8" />
      <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}</div>
    </div>
  );

  if (!user && !authLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-6">You need to be logged in to view your requests.</p>
        <Button onClick={() => navigate('/login')} className="bg-blue-600 hover:bg-blue-700">
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">{t('myRequests')}</h1>
        <Link to={createPageUrl('NewRequest')}>
          <Button className="bg-[#9B1C1C] hover:bg-[#7F1D1D] text-white rounded-xl gap-2 shadow-md">
            <PlusCircle className="w-4 h-4" />{t('newRequest')}
          </Button>
        </Link>
      </div>

      {requests.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-6">
            <Inbox className="w-10 h-10 text-slate-300" />
          </div>
          <p className="text-lg text-slate-500 mb-4">{t('noRequests')}</p>
          <Link to={createPageUrl('NewRequest')}>
            <Button className="bg-[#9B1C1C] hover:bg-[#7F1D1D] text-white rounded-xl gap-2">
              <PlusCircle className="w-4 h-4" />{t('startRequest')}
            </Button>
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {requests.map((req, i) => (
            <motion.div key={req.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="border-0 shadow-md shadow-slate-200/50 hover:shadow-lg transition-shadow">
                <CardContent className="p-5 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-[#9B1C1C]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800">{t(req.documentType)}</h3>
                        <p className="text-sm text-slate-500 mt-0.5">
                          {req.requestNumber} • {(req.createdAt) ? format(new Date(req.createdAt), 'dd/MM/yyyy') : ''}
                        </p>
                        <div className="mt-2"><StatusBadge status={req.status} /></div>
                        {(req.status === 'approved' || req.status === 'document_generated') && req.preparationLocation && (
                          <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600">
                            <MapPin className="w-3 h-3" />
                            <span>{t('preparationLocation')}</span>
                          </div>
                        )}
                        {(req.status === 'approved' || req.status === 'document_generated') && req.preparationLocation && (
                          <div className="mt-3 p-3 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">📍</span>
                              <div>
                                <p className="text-xs font-semibold text-emerald-800">{t('preparationLocation')}</p>
                                <p className="text-sm font-medium text-emerald-900">{req.preparationLocation}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Link to={createPageUrl(`RequestDetails/${req.id}`)}>
                        <Button variant="outline" size="sm" className="rounded-xl gap-2">
                          <Eye className="w-4 h-4" />{t('details')}
                        </Button>
                      </Link>
                      {req.status === 'document_generated' && req.pdfUrl && (
                        <a href={req.pdfUrl} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" className="rounded-xl gap-2 bg-[#C8A951] hover:bg-[#D4B75F] text-[#4A0808] font-semibold">
                            <Download className="w-4 h-4" />{t('downloadPdf')}
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}