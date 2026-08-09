import React, { useEffect, useState } from 'react';
import { Pill, FileText, LineChart, Mic, ArrowRight, ShieldCheck, Activity, Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { health } from '../api';
import { Card } from './ui';

const FEATURE_CARDS = [
  {
    id: 'medicines',
    title: 'Medicine Safety Check',
    description: 'Ensure prescription safety and avoid adverse drug interactions.',
    icon: Pill,
    color: 'from-emerald-400/25 to-teal-500/5',
    borderColor: 'group-hover:border-emerald-500/50',
    iconColor: 'text-emerald-400',
    benefits: [
      'Grounded FDA label verification',
      'Duplicate molecule detection',
      'OCR drug name normalization',
    ],
  },
  {
    id: 'decode',
    title: 'Decode Documents',
    description: 'Convert complex jargon and discharge notes into clear instructions.',
    icon: FileText,
    color: 'from-sky-400/25 to-indigo-500/5',
    borderColor: 'group-hover:border-sky-500/50',
    iconColor: 'text-sky-400',
    benefits: [
      'Multi-language translation support',
      'Automatic warnings extraction',
      'Grounded clinical explanation',
    ],
  },
  {
    id: 'labs',
    title: 'Lab Report Trends',
    description: 'Track biomarkers and project long-term health trajectories.',
    icon: LineChart,
    color: 'from-amber-400/25 to-orange-500/5',
    borderColor: 'group-hover:border-amber-500/50',
    iconColor: 'text-amber-400',
    benefits: [
      'Deterministic trend calculations',
      'Automated unit conversions',
      'Drift indicators & projections',
    ],
  },
  {
    id: 'scribe',
    title: 'Consultation Scribe',
    description: 'Transcribe medical conversations into structured clinical summaries.',
    icon: Mic,
    color: 'from-pink-400/25 to-rose-500/5',
    borderColor: 'group-hover:border-pink-500/50',
    iconColor: 'text-pink-400',
    benefits: [
      'Structured SOAP note layout',
      'Key medications extracted',
      'Clinician uncertainty warning system',
    ],
  },
];

const Dashboard = ({ setTab }) => {
  const [healthStatus, setHealthStatus] = useState({ loading: true, online: false, data: null });

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const data = await health();
        setHealthStatus({ loading: false, online: true, data });
      } catch (err) {
        setHealthStatus({ loading: false, online: false, data: null });
      }
    };
    checkHealth();
  }, []);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-navy-900/60 border border-slate-800/80 p-8 lg:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-mint/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mint/10 border border-mint/20 text-mint text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            Empowering Patient Autonomy
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Healthcare Information, <span className="text-transparent bg-clip-text bg-gradient-to-r from-mint to-teal-400">Decoded</span> &amp; Usable.
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Sentri extracts, verifies, and translates complex medical paperwork, lab trends, and consultations. We make medical data easy to digest so you can make informed decisions.
          </p>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
          <Activity className="w-6 h-6 text-mint" />
          Sentri Features Suite
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {FEATURE_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                onClick={() => setTab(card.id)}
                className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-800/80 bg-navy-900/40 p-6 transition-all duration-300 hover:scale-[1.01] hover:bg-navy-900/80 hover:shadow-glow-mint hover:shadow-lg"
              >
                <div className={`absolute top-0 left-0 w-32 h-32 bg-gradient-to-br ${card.color} blur-2xl opacity-50 group-hover:opacity-100 transition-opacity`}></div>
                
                <div className="relative z-10 flex flex-col h-full justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-xl bg-slate-800/40 border border-slate-700/30 ${card.iconColor}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-slate-500 group-hover:text-mint transition-colors">
                        <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-white group-hover:text-mint transition-colors">
                        {card.title}
                      </h3>
                      <p className="text-slate-400 text-sm leading-relaxed">
                        {card.description}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-slate-800/60 pt-4">
                    <ul className="grid grid-cols-1 gap-2">
                      {card.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-xs text-slate-500 group-hover:text-slate-400 transition-colors">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-mint transition-colors"></span>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* System Status Connection Widget */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl border border-slate-800/80 bg-navy-900/20">
        <div className="flex items-center gap-3">
          {healthStatus.loading ? (
            <div className="w-3.5 h-3.5 rounded-full bg-slate-600 animate-pulse"></div>
          ) : healthStatus.online ? (
            <div className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
            </div>
          ) : (
            <div className="w-3.5 h-3.5 rounded-full bg-red-500"></div>
          )}
          
          <div>
            <div className="text-sm font-semibold text-white flex items-center gap-2">
              System Gateway
              {healthStatus.loading ? (
                <span className="text-xs text-slate-500 font-normal">Checking connection...</span>
              ) : healthStatus.online ? (
                <span className="text-xs text-emerald-400 font-normal flex items-center gap-1">
                  <Wifi className="w-3 h-3" /> Online
                </span>
              ) : (
                <span className="text-xs text-red-400 font-normal flex items-center gap-1">
                  <WifiOff className="w-3 h-3" /> Offline
                </span>
              )}
            </div>
            
            {healthStatus.online && healthStatus.data && (
              <div className="text-[11px] text-slate-500 mt-0.5">
                Active Models: <span className="text-slate-400 font-mono">{healthStatus.data.text_model}</span> / <span className="text-slate-400 font-mono">{healthStatus.data.audio_model}</span>
              </div>
            )}
            
            {!healthStatus.loading && !healthStatus.online && (
              <div className="text-[11px] text-slate-500 mt-0.5">
                Unable to reach API server. Ensure backend is running locally or configured.
              </div>
            )}
          </div>
        </div>

        {healthStatus.online && healthStatus.data && (
          <div className="flex items-center gap-2">
            {healthStatus.data.groq_key_configured ? (
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wide">
                AI Service Active
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wide flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                API Key Required
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
