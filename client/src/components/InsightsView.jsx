import React from 'react';
import { Lightbulb, TrendingUp, AlertCircle, Heart, Zap, Activity } from 'lucide-react';

const InsightsView = () => {
  return (
    <div className="w-full max-w-5xl mx-auto animate-[fadeSlideIn_0.3s_ease]">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">AI Health Insights</h1>
        <p className="text-slate-400">Personalized analytics and preventive health recommendations derived from your vitals history.</p>
      </div>

      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        <div className="bg-navy-850 p-6 rounded-2xl border border-slate-800/60 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Health Score</span>
            <div className="p-2 rounded-xl bg-mint/10 text-mint">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-4xl font-extrabold text-white">88</span>
            <span className="text-slate-500 font-semibold">/ 100</span>
          </div>
          <p className="text-xs text-mint font-semibold">Good overall baseline stability</p>
        </div>

        <div className="bg-navy-850 p-6 rounded-2xl border border-slate-800/60 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Avg Resting HR</span>
            <div className="p-2 rounded-xl bg-mint/10 text-mint">
              <Heart className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-4xl font-extrabold text-white">76</span>
            <span className="text-slate-500 font-semibold">BPM</span>
          </div>
          <p className="text-xs text-slate-400">Within optimal resting range (60-100)</p>
        </div>

        <div className="bg-navy-850 p-6 rounded-2xl border border-slate-800/60 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Risk Pattern</span>
            <div className="p-2 rounded-xl bg-urgent/10 text-urgent">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-2xl font-extrabold text-urgent">Mild Tachycardia</span>
          </div>
          <p className="text-xs text-slate-400">1 spike detected during afternoon hours</p>
        </div>

      </div>

      {/* AI Intelligence Feed */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-mint" />
          Automated Preventive Recommendations
        </h3>

        <div className="bg-navy-850 p-6 rounded-2xl border border-slate-800/60 flex flex-col md:flex-row gap-6 items-start">
          <div className="w-12 h-12 rounded-xl bg-mint/10 border border-mint/30 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-6 h-6 text-mint" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h4 className="text-white font-bold text-lg">Cardiovascular Recovery Trend</h4>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-mint/10 text-mint border border-mint/20">Positive Trend</span>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed mb-4">
              Your post-scan heart rate stabilization has improved by 14% over the last 14 days. Maintaining regular physical activity will help preserve low resting pulse variability.
            </p>
            <div className="bg-navy-900 p-4 rounded-xl border border-slate-800 text-xs text-slate-400 font-mono">
              Recommendation: Continue 30 mins of daily moderate aerobic exercise.
            </div>
          </div>
        </div>

        <div className="bg-navy-850 p-6 rounded-2xl border border-slate-800/60 flex flex-col md:flex-row gap-6 items-start">
          <div className="w-12 h-12 rounded-xl bg-urgent/10 border border-urgent/30 flex items-center justify-center flex-shrink-0">
            <Activity className="w-6 h-6 text-urgent" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h4 className="text-white font-bold text-lg">Stress & Hydration Correlation</h4>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-urgent/10 text-urgent border border-urgent/20">Attention Advised</span>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed mb-4">
              rPPG signal analysis indicates micro-variations consistent with mild dehydration during late afternoon scans, which coincides with your reported headache symptoms.
            </p>
            <div className="bg-navy-900 p-4 rounded-xl border border-slate-800 text-xs text-slate-400 font-mono">
              Recommendation: Increase fluid intake by 500ml between 1:00 PM and 4:00 PM.
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default InsightsView;
