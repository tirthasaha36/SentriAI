import React, { useState } from 'react';
import BodyMap from './BodyMap';

const SymptomIntake = ({ onSubmit, preliminaryResult }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState('');
  const [manualText, setManualText] = useState('');
  const [isManualMode, setIsManualMode] = useState(false);
  const [selectedRegions, setSelectedRegions] = useState([]);

  const toggleRegion = (id) => {
    setSelectedRegions(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
  };

  const getUrgencyBadge = (urgency) => {
    const colors = {
      Emergency: 'bg-emergency/20 text-emergency border-emergency/30',
      Urgent: 'bg-urgent/20 text-urgent border-urgent/30',
      Routine: 'bg-routine/20 text-routine border-routine/30'
    };
    return colors[urgency] || colors.Routine;
  };

  const startListening = () => {
    setError('');
    
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition not supported in this browser. Please use text input.');
      setIsManualMode(true);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
      setInterimTranscript('');
    };

    recognition.onresult = (event) => {
      let currentTranscript = '';
      let currentInterim = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          currentTranscript += event.results[i][0].transcript + ' ';
        } else {
          currentInterim += event.results[i][0].transcript;
        }
      }

      setTranscript(prev => prev + currentTranscript);
      setInterimTranscript(currentInterim);
    };

    recognition.onerror = (event) => {
      console.error('Speech error', event);
      if (event.error !== 'no-speech') {
        setError(`Microphone error: ${event.error}`);
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
    };

    try {
      recognition.start();
    } catch (e) {
      console.error(e);
      setError('Could not start microphone. Try again.');
    }
  };

  const getFinalText = (baseText) => {
    let text = baseText.trim();
    if (selectedRegions.length > 0) {
      text += `\n\n[Patient manually indicated pain/discomfort in these regions on the body map: ${selectedRegions.join(', ').replace(/_/g, ' ')}]`;
    }
    return text;
  };

  const handleManualSubmit = () => {
    if (manualText.trim().length > 5 || selectedRegions.length > 0) {
      onSubmit(getFinalText(manualText));
    } else {
      setError('Please provide more detail about your symptoms or select a region.');
    }
  };

  const handleVoiceSubmit = () => {
    const finalTranscript = transcript + interimTranscript;
    if (finalTranscript.trim().length > 5 || selectedRegions.length > 0) {
      onSubmit(getFinalText(finalTranscript));
    } else {
      setError('We didn\'t catch that. Please speak a bit more or select a region on the body map.');
    }
  };

  return (
    <div className="glass-card flex flex-col items-center p-8 md:p-12 max-w-4xl w-full text-center animate-[fadeSlideIn_0.5s_ease]">
      
      {preliminaryResult && (
        <div className="w-full bg-navy-850 border border-slate-700/50 rounded-xl p-4 mb-6 flex items-center justify-between text-left animate-[fadeSlideIn_0.5s_ease]">
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Preliminary Read (Vitals Only)</div>
            <div className="text-slate-300 text-sm">
              <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getUrgencyBadge(preliminaryResult.urgency)} mr-2`}>
                {preliminaryResult.urgency}
              </span>
              — {preliminaryResult.confidence}% confident
            </div>
          </div>
          <div className="text-xs text-slate-500 italic max-w-[200px] text-right">
            Voice not yet analyzed
          </div>
        </div>
      )}

      <h2 className="text-3xl font-display font-bold text-white mb-2">How are you feeling?</h2>
      <p className="text-slate-400 mb-8 text-lg">Describe your symptoms naturally and select areas of discomfort.</p>

      {error && <p className="text-emergency bg-emergency/10 border border-emergency/20 px-4 py-2 rounded-lg mb-6 w-full">{error}</p>}

      <div className="w-full grid grid-cols-1 md:grid-cols-5 gap-8">
        
        {/* Left Column: Voice / Text Input */}
        <div className="md:col-span-3 flex flex-col items-center w-full">
          {!isManualMode ? (
            <div className="flex flex-col items-center w-full">
              <div className="relative mb-10">
                <button 
                  onClick={isListening ? () => window.speechRecognition?.stop() : startListening}
                  className={`w-24 h-24 rounded-full flex items-center justify-center z-10 relative transition-all duration-300 shadow-xl border-2 ${isListening ? 'bg-emergency border-emergency/50' : 'bg-mint border-mint/50 hover:bg-mint-hover'}`}
                >
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={isListening ? '#ffffff' : '#0A1926'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    <line x1="12" y1="19" x2="12" y2="23"/>
                    <line x1="8" y1="23" x2="16" y2="23"/>
                  </svg>
                </button>
                
                {isListening && (
                  <>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border-2 border-emergency/40 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] z-0"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border-2 border-emergency/40 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite_1s] z-0"></div>
                  </>
                )}
              </div>

              <div className="w-full bg-navy-900/60 border border-slate-700/50 rounded-xl overflow-hidden min-h-[160px] flex flex-col shadow-inner">
                <div className="bg-navy-800/80 px-4 py-2 border-b border-slate-700/50 text-xs font-semibold uppercase tracking-wider text-slate-400 text-left">
                  Live Transcript
                </div>
                <div className="p-5 text-left text-lg leading-relaxed text-slate-200 flex-1">
                  {transcript === '' && interimTranscript === '' && !isListening && (
                    <span className="text-slate-500 italic">Tap the microphone to start speaking...</span>
                  )}
                  {transcript}
                  <span className="text-slate-400 italic">{interimTranscript}</span>
                </div>
              </div>

              <div className="flex gap-4 w-full mt-8">
                <button className="btn-secondary flex-1" onClick={() => setIsManualMode(true)}>
                  Type Instead
                </button>
                <button 
                  className="btn-primary flex-1" 
                  onClick={handleVoiceSubmit}
                  disabled={!isListening && transcript.length === 0 && interimTranscript.length === 0 && selectedRegions.length === 0}
                >
                  Analyze Symptoms
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col w-full h-full">
              <textarea 
                className="w-full h-full flex-1 bg-navy-900/60 border border-slate-700/50 rounded-xl p-5 text-lg text-slate-200 min-h-[200px] outline-none focus:border-mint/50 focus:ring-1 focus:ring-mint/50 transition-all shadow-inner"
                placeholder="E.g. I have a tight pain in my chest that started an hour ago..."
                value={manualText}
                onChange={e => setManualText(e.target.value)}
              />
              <div className="flex gap-4 w-full mt-6">
                <button className="btn-secondary flex-1" onClick={() => setIsManualMode(false)}>
                  Back to Voice
                </button>
                <button 
                  className="btn-primary flex-1" 
                  onClick={handleManualSubmit}
                  disabled={manualText.trim().length < 5 && selectedRegions.length === 0}
                >
                  Analyze Symptoms
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Body Map */}
        <div className="md:col-span-2 bg-navy-900/40 border border-slate-700/50 rounded-xl p-6 flex items-center justify-center">
          <BodyMap selectedRegions={selectedRegions} onRegionToggle={toggleRegion} />
        </div>
      </div>
    </div>
  );
};

export default SymptomIntake;
