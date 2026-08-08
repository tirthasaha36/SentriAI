import React, { useState } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import VitalsScan from './components/VitalsScan';
import SymptomIntake from './components/SymptomIntake';
import TriageResult from './components/TriageResult';
import WaveformStrip from './components/WaveformStrip';
import HistoryView from './components/HistoryView';
import ReportsView from './components/ReportsView';
import InsightsView from './components/InsightsView';
import SettingsView from './components/SettingsView';
import AboutView from './components/AboutView';
import OutbreakDashboard from './components/OutbreakDashboard';
import { startSession, saveVitals, saveSymptoms, runTriage, runPreliminaryTriage } from './api';
import './index.css';

import Sidebar from './components/Sidebar';
import { Globe } from 'lucide-react';

function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [screen, setScreen] = useState('welcome');
  const [sessionId, setSessionId] = useState(null);
  const [vitals, setVitals] = useState(null);
  const [symptoms, setSymptoms] = useState('');
  const [preliminaryResult, setPreliminaryResult] = useState(null);
  const [triageResult, setTriageResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStart = async () => {
    try {
      const res = await startSession();
      setSessionId(res.session_id);
      setScreen('vitals');
    } catch (err) {
      console.error('Failed to start session:', err);
      setSessionId('OFFLINE_MODE');
      setScreen('vitals');
    }
  };

  const handleVitalsComplete = async (scannedVitals) => {
    setVitals(scannedVitals);
    setScreen('symptoms');
    
    if (sessionId && sessionId !== 'OFFLINE_MODE') {
      await saveVitals(sessionId, scannedVitals);
      // Kick off preliminary triage in background
      runPreliminaryTriage(sessionId)
        .then(res => setPreliminaryResult(res))
        .catch(err => console.error('Preliminary triage error:', err));
    }
  };

  const handleSymptomsSubmit = async (transcript) => {
    setSymptoms(transcript);
    setIsProcessing(true);
    setScreen('triage');
    
    if (sessionId && sessionId !== 'OFFLINE_MODE') {
      await saveSymptoms(sessionId, { transcript, language: 'en-US' });
      const result = await runTriage(sessionId);
      setTriageResult(result);
    } else {
      setTriageResult({
        urgency: 'Routine',
        explanation: 'Offline mode active. Symptoms recorded locally.',
        next_step: 'Please consult a doctor when online.',
        key_factors: ['Offline'],
        confidence: 0
      });
    }
    setIsProcessing(false);
  };

  const handleReset = () => {
    setScreen('welcome');
    setSessionId(null);
    setVitals(null);
    setSymptoms('');
    setPreliminaryResult(null);
    setTriageResult(null);
  };

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 font-sans flex overflow-hidden">
      <Sidebar currentTab={currentTab} setTab={setCurrentTab} />
      
      <div className="flex-1 flex flex-col relative h-screen overflow-y-auto">
        {/* Top Header - Language Selector */}
        <header className="absolute top-0 right-0 p-8 z-50">
          <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-700 bg-navy-900/50 hover:bg-navy-800 transition-colors text-sm font-semibold text-slate-200">
            <Globe className="w-4 h-4 text-slate-400" />
            English
            <svg className="w-4 h-4 text-slate-400 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </button>
        </header>

        {currentTab === 'home' && <WaveformStrip active={screen === 'vitals' && sessionId !== null} alert={triageResult?.urgency === 'Emergency'} />}
        
        <main className="flex-1 flex flex-col p-8 lg:p-12 relative z-10 w-full max-w-7xl mx-auto">
          {currentTab === 'home' && (
            <>
              {screen === 'welcome' && (
                <WelcomeScreen onStart={handleStart} />
              )}
              
              {screen !== 'welcome' && (
                <div className="flex-1 flex items-center justify-center relative w-full h-full">
                  {screen === 'vitals' && <VitalsScan onComplete={handleVitalsComplete} />}
                  {screen === 'symptoms' && (
                    <SymptomIntake 
                      onSubmit={handleSymptomsSubmit} 
                      preliminaryResult={preliminaryResult}
                    />
                  )}
                  {screen === 'triage' && (
                    <TriageResult 
                      result={triageResult} 
                      preliminaryResult={preliminaryResult}
                      isProcessing={isProcessing} 
                      onReset={handleReset} 
                      sessionId={sessionId} 
                    />
                  )}
                </div>
              )}
            </>
          )}

          {currentTab === 'history' && <HistoryView />}
          {currentTab === 'reports' && <ReportsView />}
          {currentTab === 'insights' && <InsightsView />}
          {currentTab === 'settings' && <SettingsView />}
          {currentTab === 'about' && <AboutView />}
          {currentTab === 'dashboard' && <OutbreakDashboard />}
        </main>
      </div>
    </div>
  );
}

export default App;
