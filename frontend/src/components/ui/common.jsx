import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

/**
 * Error Alert Component - Reusable inline error display
 */
export function ErrorAlert({ error, onDismiss, title = 'Error', variant = 'error' }) {
  if (!error) return null;

  const config = {
    error: { bg: 'bg-red-50', border: 'border-red-200', icon: AlertCircle, color: 'text-red-600', title: 'Error' },
    warning: { bg: 'bg-amber-50', border: 'border-amber-200', icon: AlertTriangle, color: 'text-amber-600', title: 'Warning' },
    success: { bg: 'bg-green-50', border: 'border-green-200', icon: CheckCircle, color: 'text-green-600', title: 'Success' },
    info: { bg: 'bg-blue-50', border: 'border-blue-200', icon: Info, color: 'text-blue-600', title: 'Info' },
  }[variant];

  const Icon = config.icon;
  const message = typeof error === 'string' ? error : error?.message || 'An unknown error occurred';

  return (
    <div className={`${config.bg} border ${config.border} rounded-lg p-4 mb-4 flex items-start gap-3`}>
      <Icon className={`w-5 h-5 ${config.color} flex-shrink-0 mt-0.5`} />
      <div className="flex-1">
        <h3 className={`font-semibold ${config.color}`}>{title}</h3>
        <p className="text-sm text-slate-600 mt-1">{message}</p>
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className="text-slate-400 hover:text-slate-600 flex-shrink-0">
          ✕
        </button>
      )}
    </div>
  );
}

/**
 * Loading Skeleton Component
 */
export function Skeleton({ className = '', lines = 3 }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array(lines).fill(0).map((_, i) => (
        <div key={i} className="h-4 bg-slate-200 rounded animate-pulse" />
      ))}
    </div>
  );
}

/**
 * Loading Overlay Component
 */
export function LoadingOverlay({ isVisible, message = 'Loading...' }) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-[#9B1C1C] rounded-full animate-spin" />
        <p className="text-slate-600 font-medium">{message}</p>
      </div>
    </div>
  );
}

/**
 * Empty State Component
 */
export function EmptyState({ title, description, icon: Icon, action, actionLabel }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {Icon && <Icon className="w-12 h-12 text-slate-300 mb-4" />}
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 text-center mb-6 max-w-md">{description}</p>
      {action && (
        <button onClick={action} className="px-4 py-2 bg-[#9B1C1C] text-white rounded-lg hover:bg-[#7F1D1D] transition-colors font-medium">
          {actionLabel}
        </button>
      )}
    </div>
  );
}

/**
 * Form Error Component
 */
export function FormError({ message }) {
  if (!message) return null;
  return <p className="text-red-600 text-sm font-medium mt-1">{message}</p>;
}

/**
 * Page Header Component with loading state
 */
export function PageHeader({ title, subtitle, loading = false, action, actionLabel }) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
          {subtitle && <p className="text-slate-600 mt-1">{subtitle}</p>}
        </div>
        {action && (
          <button onClick={action} disabled={loading} className="px-4 py-2 bg-[#9B1C1C] text-white rounded-lg hover:bg-[#7F1D1D] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium">
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
