import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { getFacilities } from '../api';

const TriageResult = ({ result, preliminaryResult, isProcessing, onReset, sessionId }) => {
  const [facilities, setFacilities] = useState([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [animateFusion, setAnimateFusion] = useState(false);

  useEffect(() => {
    if (result && !result.needs_followup && result.urgency) {
      getFacilities(result.urgency).then(data => setFacilities(data)).catch(err => console.error(err));
      // Trigger fusion animation slightly after mount
      const timer = setTimeout(() => setAnimateFusion(true), 800);
      return () => clearTimeout(timer);
    }
  }, [result]);

  useEffect(() => {
    if (result && !isProcessing) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const textToSpeak = result.needs_followup 
          ? result.followup_question 
          : `The triage engine recommends: ${result.next_step}`;
          
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        // Slightly delay the speech to allow the UI animation to happen first if final result
        const delay = result.needs_followup ? 100 : 800;
        const timer = setTimeout(() => {
          window.speechSynthesis.speak(utterance);
        }, delay);
        
        return () => {
          clearTimeout(timer);
          window.speechSynthesis.cancel();
        };
      }
    }
  }, [result, isProcessing]);

  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center gap-6 animate-[fadeSlideIn_0.5s_ease]">
        <div className="w-16 h-16 rounded-full border-4 border-slate-700 border-t-mint animate-spin"></div>
        <h2 className="text-2xl font-bold text-white">Analyzing Data</h2>
        <p className="text-slate-400 max-w-sm">Combining vitals and symptom history to determine clinical severity...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="glass-card p-8 border-l-4 border-l-emergency text-center animate-[fadeSlideIn_0.5s_ease]">
        <h2 className="text-xl font-bold text-emergency mb-2">Error</h2>
        <p className="text-slate-300 mb-6">Failed to generate triage result.</p>
        <button className="btn-secondary" onClick={onReset}>Start Over</button>
      </div>
    );
  }

  if (result.needs_followup) {
    return (
      <div className="glass-card flex flex-col items-center p-8 max-w-2xl w-full text-center animate-[fadeSlideIn_0.5s_ease]">
        <div className="bg-urgent/10 text-urgent px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6">Clarification Needed</div>
        <h2 className="text-2xl font-bold text-white mb-6">The AI needs more info:</h2>
        <div className="bg-navy-900 border border-slate-700/50 p-6 rounded-xl w-full mb-8 text-left">
          <p className="text-lg text-slate-200">"{result.followup_question}"</p>
        </div>
        <p className="text-slate-400 text-sm mb-6">Please tap 'Answer' to provide more details so we can complete your triage.</p>
        <button className="btn-primary w-full" onClick={onReset}>
          Answer (Voice)
        </button>
      </div>
    );
  }

  const getUrgencyClasses = (urgency) => {
    switch(urgency) {
      case 'Emergency': return 'bg-emergency/20 border-emergency/40 text-emergency';
      case 'Urgent': return 'bg-urgent/20 border-urgent/40 text-urgent';
      case 'Routine': return 'bg-routine/20 border-routine/40 text-routine';
      default: return 'bg-slate-800 border-slate-700 text-slate-400';
    }
  };

  const urgencyColors = {
    'Emergency': 'border-l-emergency bg-emergency/10',
    'Urgent': 'border-l-urgent bg-urgent/10',
    'Routine': 'border-l-routine bg-routine/10'
  };

  const badgeColors = {
    'Emergency': 'bg-emergency text-white',
    'Urgent': 'bg-urgent text-white',
    'Routine': 'bg-routine text-white'
  };

  return (
    <div className="flex flex-col items-center w-full max-w-3xl gap-6 animate-[fadeSlideIn_0.5s_ease]">
      
      {/* Sensor Fusion Visualization */}
      {preliminaryResult && result.confidence && (
        <div className="w-full glass-card p-6">
          <h3 className="font-semibold text-slate-200 mb-4 flex items-center justify-between">
            <span>Multi-Modal Fusion Analysis</span>
            <span className="text-xs px-2 py-1 bg-navy-800 text-slate-400 rounded-full border border-slate-700">Live Inference</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
            {/* Vitals Only Pill */}
            <div className={`p-4 rounded-xl border transition-all duration-700 ${animateFusion ? 'opacity-50 scale-95 grayscale-[50%]' : 'opacity-100 scale-100'} bg-navy-900 border-slate-700/50 flex flex-col justify-center`}>
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">1. Vitals Only</div>
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getUrgencyClasses(preliminaryResult.urgency)}`}>
                  {preliminaryResult.urgency}
                </span>
                <div className="text-right">
                  <div className="text-lg font-bold text-white">{preliminaryResult.confidence}%</div>
                  <div className="text-[10px] text-slate-500 uppercase">Confidence</div>
                </div>
              </div>
            </div>

            {/* Vitals + Voice Pill */}
            <div className={`p-4 rounded-xl border transition-all duration-1000 ${animateFusion ? 'bg-navy-850 shadow-[0_0_30px_rgba(6,182,212,0.15)] scale-100 opacity-100 border-mint/30' : 'bg-navy-900 border-slate-800 scale-95 opacity-50 grayscale'} flex flex-col justify-center`}>
              <div className="text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2">
                <span className={animateFusion ? 'text-mint' : 'text-slate-500'}>2. Vitals + Symptoms</span>
                {animateFusion && <span className="w-2 h-2 rounded-full bg-mint animate-pulse"></span>}
              </div>
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors duration-1000 ${animateFusion ? getUrgencyClasses(result.urgency) : 'border-slate-700 text-slate-500'}`}>
                  {animateFusion ? result.urgency : 'Calculating...'}
                </span>
                <div className="text-right transition-all duration-1000">
                  <div className={`text-lg font-bold ${animateFusion ? 'text-white' : 'text-slate-500'}`}>
                    {animateFusion ? result.confidence : '---'}%
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase">Confidence</div>
                </div>
              </div>
            </div>
            
            {/* Connecting Arrow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-navy-950 border border-slate-800 z-10 text-slate-500">
              →
            </div>
          </div>
          
          <p className="text-sm text-slate-400 mt-4 text-center">
            {animateFusion 
              ? `Vitals alone suggested: ${preliminaryResult.urgency} (${preliminaryResult.confidence}%). Adding your symptoms updated this to: ${result.urgency} (${result.confidence}%).`
              : 'Fusing multimodal signals...'}
          </p>
        </div>
      )}

      <div className={`w-full glass-card border-l-4 transition-colors duration-1000 ${animateFusion || !preliminaryResult ? urgencyColors[result.urgency] : 'border-l-slate-700 bg-navy-900'} overflow-hidden`}>
        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${badgeColors[result.urgency]}`}>
              {result.urgency}
            </span>
            <span className="text-slate-400 text-sm">Recommended Action</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">{result.next_step || 'Consult a healthcare provider for further guidance.'}</h2>
          <p className="text-lg text-slate-300 leading-relaxed">{result.explanation || 'No detailed explanation provided by the triage engine.'}</p>
        </div>
      </div>

      {result.key_factors && result.key_factors.length > 0 && (
        <div className="w-full glass-card p-6">
          <button 
            className="w-full flex justify-between items-center text-left"
            onClick={() => setShowExplanation(!showExplanation)}
          >
            <span className="font-semibold text-slate-200">Why this result? (Explainability)</span>
            <svg className={`w-5 h-5 text-slate-400 transition-transform ${showExplanation ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          
          {showExplanation && (
            <div className="mt-4 pt-4 border-t border-slate-700/50">
              <p className="text-sm text-slate-400 mb-3">The AI weighted these factors most heavily:</p>
              <ul className="list-disc pl-5 text-slate-300 space-y-1">
                {result.key_factors.map((factor, idx) => (
                  <li key={idx}>{factor}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {facilities.length > 0 && (
        <div className="w-full glass-card p-6">
          <h3 className="font-semibold text-slate-200 mb-4">Suggested Nearest Facilities:</h3>
          <div className="flex flex-col gap-3">
            {facilities.map(f => (
              <div key={f.id} className="bg-navy-900 border border-slate-700/50 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-mint">{f.name}</h4>
                  <p className="text-sm text-slate-400">{f.type} • {f.hours}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-slate-200">{f.distance_miles}</span>
                  <span className="text-xs text-slate-500 ml-1">mi</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Patient Handoff QR Code */}
      <div className="w-full glass-card p-6 bg-gradient-to-br from-navy-900 to-navy-850 border border-mint/20">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="bg-white p-2 rounded-xl shadow-lg">
            <QRCodeSVG 
              value={`https://sentri.health/patient/session/${sessionId || 'DEMO'}`}
              size={100}
              bgColor={"#ffffff"}
              fgColor={"#0A1926"}
              level={"Q"}
            />
          </div>
          <div className="text-center md:text-left flex-1">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center justify-center md:justify-start gap-2">
              Patient Handoff
              <span className="px-2 py-0.5 rounded bg-mint/20 text-mint text-[10px] uppercase tracking-widest border border-mint/30">Ready</span>
            </h3>
            <p className="text-slate-400 text-sm mb-0">
              Scan this QR code with your phone to take your secure triage summary to the front desk or ER waiting room.
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-4 w-full mt-4">
        <button className="btn-secondary flex-1" onClick={onReset}>
          New Session
        </button>
        <button className="btn-primary flex-1" onClick={() => window.print()}>
          Download Summary
        </button>
      </div>

    </div>
  );
};

export default TriageResult;
