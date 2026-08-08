import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

export const PageHeader = ({ title, subtitle }) => (
  <div className="mb-8">
    <h2 className="text-3xl font-bold text-white">{title}</h2>
    {subtitle && <p className="text-slate-400 mt-2 max-w-2xl leading-relaxed">{subtitle}</p>}
  </div>
);

export const Card = ({ children, className = '' }) => (
  <div className={`glass-card p-6 ${className}`}>{children}</div>
);

export const Spinner = ({ label }) => (
  <div className="flex items-center gap-3 text-slate-400 text-sm">
    <Loader2 className="w-4 h-4 animate-spin text-mint" />
    {label}
  </div>
);

export const ErrorNote = ({ error }) =>
  !error ? null : (
    <div className="flex items-start gap-3 rounded-xl border border-emergency/40 bg-emergency/10 p-4 text-sm text-red-200">
      <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-emergency" />
      <span>{String(error)}</span>
    </div>
  );

const SEVERITY_STYLES = {
  major: 'bg-emergency/15 text-red-200 border-emergency/50',
  moderate: 'bg-urgent/15 text-amber-200 border-urgent/50',
  minor: 'bg-routine/15 text-emerald-200 border-routine/50',
};

export const SeverityBadge = ({ severity }) => {
  const key = String(severity || '').toLowerCase();
  const style = SEVERITY_STYLES[key] || 'bg-slate-700/40 text-slate-300 border-slate-600';
  return (
    <span className={`px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wide ${style}`}>
      {severity || 'unknown'}
    </span>
  );
};

export const Disclaimer = ({ children }) => (
  <p className="text-xs text-slate-500 leading-relaxed border-t border-slate-800 pt-4 mt-6">
    {children}
  </p>
);
