import React, { useState } from 'react';
import { Calendar, ChevronDown, Activity, ChevronRight, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';

const MOCK_SESSIONS = [
  {
    id: 's1',
    date: '2023-11-20T14:30:00',
    vitals: { bpm: 105, br: 22 },
    symptoms: 'Feeling very dizzy and my chest is a bit tight.',
    urgency: 'Emergency',
    explanation: 'Elevated heart rate combined with chest tightness and dizziness are red flags for acute cardiovascular issues.',
    next_step: 'Please visit the nearest emergency room immediately.',
    delta: '+31 bpm since last scan'
  },
  {
    id: 's2',
    date: '2023-11-15T09:15:00',
    vitals: { bpm: 74, br: 14 },
    symptoms: 'Just a routine checkup, feeling fine.',
    urgency: 'Routine',
    explanation: 'Vitals are well within normal ranges and no concerning symptoms reported.',
    next_step: 'Continue monitoring as usual.',
    delta: '-2 bpm since last scan'
  },
  {
    id: 's3',
    date: '2023-10-30T16:45:00',
    vitals: { bpm: 76, br: 15 },
    symptoms: 'Mild headache since this morning.',
    urgency: 'Routine',
    explanation: 'Mild isolated symptoms with normal vitals do not indicate an emergency.',
    next_step: 'Rest and hydrate. Consult a doctor if headache persists.',
    delta: 'N/A'
  }
];

const TrendGraph = () => (
  <div className="bg-navy-850 p-6 rounded-2xl border border-slate-800/60 mb-8">
    <div className="flex justify-between items-center mb-6">
      <div>
        <h3 className="text-white font-bold text-lg">Heart Rate Trends</h3>
        <p className="text-slate-400 text-sm">Last 30 Days</p>
      </div>
      <div className="flex gap-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-mint"></div>
          <span className="text-xs text-slate-300">Avg BPM</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emergency"></div>
          <span className="text-xs text-slate-300">Spike</span>
        </div>
      </div>
    </div>
    
    <div className="h-48 w-full relative">
      {/* Grid lines */}
      <div className="absolute inset-0 flex flex-col justify-between">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="w-full border-b border-slate-700/30 h-0"></div>
        ))}
      </div>
      
      {/* Simple SVG Graph */}
      <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5EEAD4" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#5EEAD4" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Fill */}
        <path d="M0,120 L150,110 L300,115 L450,130 L600,105 L750,20 L900,110 L900,192 L0,192 Z" fill="url(#lineGrad)" />
        {/* Line */}
        <path d="M0,120 L150,110 L300,115 L450,130 L600,105 L750,20 L900,110" fill="none" stroke="#5EEAD4" strokeWidth="3" strokeLinejoin="round" />
        
        {/* Data points */}
        <circle cx="150" cy="110" r="4" fill="#111C27" stroke="#5EEAD4" strokeWidth="2" />
        <circle cx="300" cy="115" r="4" fill="#111C27" stroke="#5EEAD4" strokeWidth="2" />
        <circle cx="450" cy="130" r="4" fill="#111C27" stroke="#5EEAD4" strokeWidth="2" />
        <circle cx="600" cy="105" r="4" fill="#111C27" stroke="#5EEAD4" strokeWidth="2" />
        
        {/* Spike point */}
        <circle cx="750" cy="20" r="6" fill="#F0524B" stroke="#111C27" strokeWidth="2" className="animate-pulse" />
        
        <circle cx="900" cy="110" r="4" fill="#111C27" stroke="#5EEAD4" strokeWidth="2" />
      </svg>
      
      <div className="absolute -top-4 right-[12%] bg-emergency text-white text-xs font-bold px-2 py-1 rounded shadow-lg">
        105 BPM
      </div>
    </div>
  </div>
);

const getUrgencyIcon = (urgency) => {
  switch (urgency) {
    case 'Emergency': return <AlertTriangle className="w-5 h-5 text-emergency" />;
    case 'Urgent': return <AlertCircle className="w-5 h-5 text-urgent" />;
    default: return <CheckCircle className="w-5 h-5 text-routine" />;
  }
};

const getUrgencyColor = (urgency) => {
  switch (urgency) {
    case 'Emergency': return 'text-emergency border-emergency/20 bg-emergency/10';
    case 'Urgent': return 'text-urgent border-urgent/20 bg-urgent/10';
    default: return 'text-routine border-routine/20 bg-routine/10';
  }
};

const HistoryView = () => {
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="w-full max-w-5xl mx-auto animate-[fadeSlideIn_0.3s_ease]">
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Session History</h1>
          <p className="text-slate-400">Review past scans, vitals, and triage recommendations.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-navy-850 border border-slate-700 rounded-lg text-slate-300 hover:text-white hover:border-slate-500 transition-colors">
          <Calendar className="w-4 h-4" />
          <span className="text-sm font-medium">Filter by Date</span>
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      <TrendGraph />

      <div className="flex flex-col gap-4">
        <h3 className="text-white font-bold text-lg mb-2">Recent Sessions</h3>
        
        {MOCK_SESSIONS.map((session) => {
          const date = new Date(session.date);
          const isExpanded = expandedId === session.id;
          
          return (
            <div key={session.id} className="bg-navy-850 rounded-2xl border border-slate-800/60 overflow-hidden transition-all duration-300">
              {/* Header row (always visible) */}
              <div 
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => toggleExpand(session.id)}
              >
                <div className="flex items-center gap-6">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${getUrgencyColor(session.urgency)}`}>
                    {getUrgencyIcon(session.urgency)}
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg">{date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</h4>
                    <p className="text-slate-400 text-sm">{date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-8">
                  <div className="hidden md:flex flex-col items-end">
                    <span className="text-slate-300 font-bold">{session.vitals.bpm} BPM</span>
                    <span className={`text-xs font-semibold ${session.delta.includes('+') ? 'text-emergency' : 'text-slate-500'}`}>
                      {session.delta}
                    </span>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full border text-xs font-bold tracking-wide uppercase ${getUrgencyColor(session.urgency)}`}>
                    {session.urgency}
                  </div>
                  <ChevronRight className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
                </div>
              </div>

              {/* Expanded content */}
              {isExpanded && (
                <div className="p-6 border-t border-slate-700/50 bg-navy-900/30 animate-[fadeSlideIn_0.2s_ease]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    <div>
                      <h5 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Recorded Vitals</h5>
                      <div className="flex gap-4 mb-6">
                        <div className="bg-navy-800 p-4 rounded-xl border border-slate-700 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Activity className="w-4 h-4 text-mint" />
                            <span className="text-slate-400 text-sm font-medium">Heart Rate</span>
                          </div>
                          <div className="text-2xl font-bold text-white">{session.vitals.bpm} <span className="text-sm font-normal text-slate-500">BPM</span></div>
                        </div>
                        <div className="bg-navy-800 p-4 rounded-xl border border-slate-700 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <svg className="w-4 h-4 text-mint" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span className="text-slate-400 text-sm font-medium">Breathing</span>
                          </div>
                          <div className="text-2xl font-bold text-white">{session.vitals.br} <span className="text-sm font-normal text-slate-500">resp/m</span></div>
                        </div>
                      </div>

                      <h5 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Reported Symptoms</h5>
                      <div className="bg-navy-800 p-4 rounded-xl border border-slate-700">
                        <p className="text-slate-300 text-sm leading-relaxed italic">"{session.symptoms}"</p>
                      </div>
                    </div>

                    <div>
                      <h5 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">AI Triage Reasoning</h5>
                      <div className="bg-navy-800 p-5 rounded-xl border border-slate-700 h-full flex flex-col">
                        <p className="text-slate-300 text-sm leading-relaxed mb-4 flex-1">
                          {session.explanation}
                        </p>
                        <div className="pt-4 border-t border-slate-700">
                          <h6 className="text-white font-bold text-sm mb-2">Suggested Next Step:</h6>
                          <p className="text-mint text-sm font-semibold">{session.next_step}</p>
                        </div>
                      </div>
                    </div>

                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <button className="px-5 py-2.5 bg-mint/10 hover:bg-mint/20 text-mint font-semibold rounded-lg transition-colors text-sm">
                      Compare to last visit
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HistoryView;
