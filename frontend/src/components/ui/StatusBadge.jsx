import React from 'react';
import { useLanguage } from '../LanguageContext';
import { Clock, Loader2, CheckCircle, XCircle, FileCheck } from 'lucide-react';

const statusConfig = {
  pending:           { icon: Clock,      bgColor: 'bg-amber-50',        textColor: 'text-amber-700',   borderColor: 'border-amber-200' },
  in_review:         { icon: Loader2,    bgColor: 'bg-blue-50',         textColor: 'text-blue-700',    borderColor: 'border-blue-200', animate: true },
  approved:          { icon: CheckCircle,bgColor: 'bg-emerald-50',      textColor: 'text-emerald-700', borderColor: 'border-emerald-200' },
  rejected:          { icon: XCircle,    bgColor: 'bg-red-50',          textColor: 'text-red-700',     borderColor: 'border-red-200' },
  document_generated:{ icon: FileCheck,  bgColor: 'bg-[#C8A951]/10',    textColor: 'text-[#7F1D1D]',   borderColor: 'border-[#C8A951]/40' },
  ready:             { icon: CheckCircle,bgColor: 'bg-emerald-50',      textColor: 'text-emerald-700', borderColor: 'border-emerald-200' },
};

export default function StatusBadge({ status }) {
  const { t } = useLanguage();
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${config.bgColor} ${config.textColor} ${config.borderColor}`}>
      <Icon className={`w-3.5 h-3.5 ${config.animate ? 'animate-spin' : ''}`} />
      {t(status)}
    </span>
  );
}