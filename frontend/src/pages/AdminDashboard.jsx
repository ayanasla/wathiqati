import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { getRequests, getAdminRequests, updateRequest, startReviewRequest } from '../api';
import { useLanguage } from '../components/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import StatusBadge from '../components/ui/StatusBadge';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Skeleton } from '../components/ui/skeleton';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Search, FileText, Clock, FileCheck, Eye, Filter, BarChart3 } from 'lucide-react';

const STATUS_LIST = ['pending', 'in_review', 'approved', 'rejected', 'document_generated'];

export default function AdminDashboard() {
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingAll, setProcessingAll] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function load() {
      try {
        // Use admin endpoint if user is admin, otherwise use user endpoint
        const data = user?.role === 'admin' ? await getAdminRequests() : await getRequests();
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
  }, [user]);

  const filtered = requests.filter(req => {
    const matchStatus = statusFilter === 'all' || req.status === statusFilter;
    const matchSearch = !searchQuery ||
      req.requestNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.firstNameFr?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.lastNameFr?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.nationalId?.includes(searchQuery);
    return matchStatus && matchSearch;
  });

  const stats = requests.reduce((acc, req) => {
    acc.total += 1;
    if (req.status === 'pending') acc.pending += 1;
    if (req.status === 'in_review') acc.processing += 1;
    if (req.status === 'approved' || req.status === 'document_generated' || req.status === 'ready') acc.ready += 1;
    return acc;
  }, { total: 0, pending: 0, processing: 0, ready: 0 });

  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Skeleton className="h-8 w-48 mb-8" />
      <div className="grid grid-cols-4 gap-4 mb-8">{[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}</div>
      <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
    </div>
  );


  const statCards = [
    { label: isRTL ? 'المجموع' : 'Total', value: stats.total, icon: BarChart3, color: 'bg-slate-100 text-slate-600' },
    { label: t('pending'), value: stats.pending, icon: Clock, color: 'bg-amber-50 text-amber-700' },
    { label: t('processing'), value: stats.processing, icon: FileText, color: 'bg-blue-50 text-blue-700' },
    { label: t('ready'), value: stats.ready, icon: FileCheck, color: 'bg-emerald-50 text-emerald-700' },
  ];

  const handleStatusChange = async (requestId, newStatus) => {
    try {
      await updateRequest(requestId, { status: newStatus });
      // Update local state
      setRequests(prev => prev.map(req => 
        req.id === requestId ? { ...req, status: newStatus } : req
      ));
      console.log('[AdminDashboard] Status updated:', { requestId, status: newStatus });
    } catch (error) {
      console.error('[AdminDashboard] Failed to update status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  const handleProcessAllPending = async () => {
    const pendingRequests = requests.filter(req => req.status === 'pending');
    if (pendingRequests.length === 0) return;

    setProcessingAll(true);
    try {
      const results = await Promise.all(pendingRequests.map(async (req) => {
        try {
          await startReviewRequest(req.id);
          console.log('[AdminDashboard] Request moved to in_review:', req.id);
          return { id: req.id };
        } catch (error) {
          console.error('Failed to start review for request', req.id, error);
          return { id: req.id, error };
        }
      }));

      const failedCount = results.filter(result => result.error).length;
      if (failedCount > 0) {
        alert(`${failedCount} request(s) failed to process. Please check the console for details.`);
      }

      const refreshedRequests = await getAdminRequests();
      setRequests(Array.isArray(refreshedRequests) ? refreshedRequests : []);
    } catch (refreshError) {
      console.error('[AdminDashboard] Failed to refresh requests after processing:', refreshError);
    } finally {
      setProcessingAll(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-8">{t('admin')}</h1>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <Button onClick={() => navigate(createPageUrl('AdminCreateRequest'))} className="bg-[#9B1C1C] hover:bg-[#7F1D1D] text-white px-6 py-2 rounded-xl">
          Create New Request
        </Button>
        <Button onClick={handleProcessAllPending} disabled={processingAll || stats.pending === 0} className="bg-[#1D4ED8] hover:bg-[#1E40AF] text-white px-6 py-2 rounded-xl">
          {processingAll ? 'Processing pending requests...' : `Process ${stats.pending} pending request${stats.pending === 1 ? '' : 's'}`}
        </Button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {statCards.map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="border-0 shadow-md">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                    <p className="text-xs text-slate-500">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder={t('search') + '...'} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 rounded-xl" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-52 rounded-xl">
            <Filter className="w-4 h-4 mr-2" /><SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('all')}</SelectItem>
            {STATUS_LIST.map(s => <SelectItem key={s} value={s}>{t(s)}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-3">
        {filtered.map((req, i) => (
          <motion.div key={req.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-[#9B1C1C]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 text-sm">{t(req.documentType)}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {req.requestNumber} • {req.firstNameFr} {req.lastNameFr}
                        {(req.created_date || req.createdAt) ? ` • ${format(new Date(req.created_date || req.createdAt), 'dd/MM/yyyy')}` : ''}
                      </p>
                      <div className="mt-1.5"><StatusBadge status={req.status} /></div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                    <Select value={req.status} onValueChange={(value) => handleStatusChange(req.id, value)}>
                      <SelectTrigger className="w-32 h-8 text-xs rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_LIST.map(s => <SelectItem key={s} value={s}>{t(s)}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Link to={createPageUrl(`AdminRequestDetail?id=${req.id}`)}>
                      <Button variant="outline" size="sm" className="rounded-xl gap-2 h-8">
                        <Eye className="w-4 h-4" />{t('details')}
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-400">{isRTL ? 'لا توجد نتائج' : 'Aucun résultat'}</div>
        )}
      </div>
    </div>
  );
}