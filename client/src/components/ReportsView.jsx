import React, { useState } from 'react';
import { Download, QrCode, FileText, FileSpreadsheet, Share2, Activity } from 'lucide-react';

const ReportsView = () => {
  const [viewMode, setViewMode] = useState('patient'); // 'patient' or 'doctor'
  const [timeRange, setTimeRange] = useState('month');

  return (
    <div className="w-full max-w-5xl mx-auto animate-[fadeSlideIn_0.3s_ease]">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Health Reports</h1>
          <p className="text-slate-400">Export and share your triage data with healthcare professionals.</p>
        </div>
        
        <div className="flex bg-navy-850 p-1 rounded-lg border border-slate-700">
          <button 
            onClick={() => setViewMode('patient')}
            className={`px-6 py-2 rounded-md font-semibold text-sm transition-all duration-300 ${viewMode === 'patient' ? 'bg-navy-700 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Patient Summary
          </button>
          <button 
            onClick={() => setViewMode('doctor')}
            className={`px-6 py-2 rounded-md font-semibold text-sm transition-all duration-300 ${viewMode === 'doctor' ? 'bg-mint text-navy-950 shadow-glow-mint' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Clinical View
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Report Controls */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-navy-850 rounded-2xl p-6 border border-slate-800/60">
            <h3 className="text-white font-bold text-lg mb-4">Generate Report</h3>
            
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Time Range</label>
                <select 
                  className="w-full bg-navy-900 border border-slate-700 text-white rounded-lg p-3 outline-none focus:border-mint transition-colors appearance-none"
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                >
                  <option value="week">Past 7 Days</option>
                  <option value="month">Past 30 Days</option>
                  <option value="all">All Time</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Include Data</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" defaultChecked className="accent-mint w-4 h-4" />
                    <span className="text-sm text-slate-300">Vitals (rPPG Data)</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" defaultChecked className="accent-mint w-4 h-4" />
                    <span className="text-sm text-slate-300">Symptom Transcripts</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" defaultChecked className="accent-mint w-4 h-4" />
                    <span className="text-sm text-slate-300">AI Triage Reasoning</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button className="w-full bg-mint text-navy-950 hover:bg-mint-hover font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all hover:shadow-glow-mint">
                <Download className="w-5 h-5" />
                Download PDF
              </button>
              <button className="w-full bg-navy-800 text-white hover:bg-navy-700 border border-slate-700 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all">
                <QrCode className="w-5 h-5 text-mint" />
                Generate Intake QR
              </button>
            </div>
          </div>
          
          <div className="bg-mint/10 border border-mint/20 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <Share2 className="w-16 h-16 text-mint" />
            </div>
            <h3 className="text-mint font-bold text-lg mb-2 relative z-10">Secure Sharing</h3>
            <p className="text-slate-300 text-sm leading-relaxed relative z-10">
              Generated QR codes are encrypted. The receiving clinician must authenticate to decrypt the triage report.
            </p>
          </div>
        </div>

        {/* Right Column - Report Preview */}
        <div className="lg:col-span-2">
          <div className="bg-navy-850 rounded-2xl p-8 min-h-[600px] shadow-xl border border-slate-800/60 text-slate-100 relative">
            
            {/* Report Header */}
            <div className="flex justify-between items-start border-b border-slate-700/60 pb-6 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-navy-950 border border-mint/30 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-mint" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">Sentri<span className="text-mint font-bold">AI</span></h2>
                  <p className="text-xs font-bold text-mint uppercase tracking-widest">Health Summary Report</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-white">Patient: John Doe</p>
                <p className="text-sm text-slate-400">DOB: 05/12/1985</p>
                <p className="text-xs text-slate-500 mt-1">Generated: {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            {viewMode === 'patient' ? (
              // Patient Plain Language View
              <div className="animate-[fadeSlideIn_0.3s_ease]">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-mint" />
                  Monthly Overview
                </h3>
                
                <div className="bg-navy-900 p-6 rounded-xl border border-slate-700/60 mb-6">
                  <p className="text-slate-300 leading-relaxed text-lg">
                    Over the past 30 days, John has completed <strong className="text-white">3 health scans</strong>. 
                    The average resting heart rate was <strong className="text-white">85 BPM</strong>. 
                    There was <strong className="text-emergency font-bold">1 elevated alert (Emergency)</strong> recorded on Nov 20th due to chest tightness combined with tachycardia (105 BPM). 
                    Subsequent scans returned to baseline routine status.
                  </p>
                </div>

                <h4 className="font-bold text-white mb-3">AI Triage Highlights</h4>
                <ul className="space-y-4">
                  <li className="flex gap-4">
                    <div className="w-1.5 bg-emergency rounded-full flex-shrink-0"></div>
                    <div>
                      <p className="font-bold text-white">Nov 20, 2023 - Elevated Risk</p>
                      <p className="text-slate-300 text-sm mt-1">AI flagged potential cardiovascular stress based on self-reported dizziness and measured 105 BPM. Patient advised to visit ER.</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <div className="w-1.5 bg-routine rounded-full flex-shrink-0"></div>
                    <div>
                      <p className="font-bold text-white">Nov 15, 2023 - Routine</p>
                      <p className="text-slate-300 text-sm mt-1">Vitals stable (74 BPM). No concerning symptoms reported.</p>
                    </div>
                  </li>
                </ul>
              </div>
            ) : (
              // Doctor Structured Data View
              <div className="animate-[fadeSlideIn_0.3s_ease]">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-mint" />
                  Clinical Structured Data
                </h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="py-3 px-4 font-bold text-sm text-slate-400">Timestamp</th>
                        <th className="py-3 px-4 font-bold text-sm text-slate-400">HR (bpm)</th>
                        <th className="py-3 px-4 font-bold text-sm text-slate-400">RR (rpm)</th>
                        <th className="py-3 px-4 font-bold text-sm text-slate-400">CC (Chief Complaint)</th>
                        <th className="py-3 px-4 font-bold text-sm text-slate-400">ESI Est.</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm text-slate-300">
                      <tr className="border-b border-slate-800 bg-emergency/10">
                        <td className="py-3 px-4 font-medium text-white">11/20/23 14:30</td>
                        <td className="py-3 px-4 text-emergency font-bold">105</td>
                        <td className="py-3 px-4">22</td>
                        <td className="py-3 px-4 italic text-slate-300">"Dizzy, chest tight"</td>
                        <td className="py-3 px-4"><span className="bg-emergency/20 text-emergency border border-emergency/30 font-bold px-2 py-1 rounded text-xs">Level 2</span></td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="py-3 px-4 font-medium text-white">11/15/23 09:15</td>
                        <td className="py-3 px-4">74</td>
                        <td className="py-3 px-4">14</td>
                        <td className="py-3 px-4 italic text-slate-300">"Routine checkup"</td>
                        <td className="py-3 px-4"><span className="bg-routine/20 text-routine border border-routine/30 font-bold px-2 py-1 rounded text-xs">Level 5</span></td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="py-3 px-4 font-medium text-white">10/30/23 16:45</td>
                        <td className="py-3 px-4">76</td>
                        <td className="py-3 px-4">15</td>
                        <td className="py-3 px-4 italic text-slate-300">"Mild headache"</td>
                        <td className="py-3 px-4"><span className="bg-routine/20 text-routine border border-routine/30 font-bold px-2 py-1 rounded text-xs">Level 4</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="mt-8 bg-navy-900 p-4 rounded-lg border border-slate-700/60">
                  <h4 className="font-bold text-xs uppercase tracking-widest text-mint mb-2">Automated Assessment (LLaMA-3 70B)</h4>
                  <p className="text-sm font-mono text-slate-300">
                    &gt; Flagged 11/20 encounter for ESI 2 due to combination of tachycardia (HR &gt; 100) and high-risk symptom presentation (chest tightness + dizziness).
                  </p>
                </div>
              </div>
            )}
            
            {/* Watermark */}
            <div className="absolute bottom-8 left-0 w-full text-center pointer-events-none opacity-40">
              <p className="text-xs text-slate-500 font-mono tracking-wider">GENERATED BY SENTRIAI • NOT A MEDICAL DIAGNOSIS</p>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default ReportsView;
