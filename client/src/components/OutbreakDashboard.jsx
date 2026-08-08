import React, { useState, useEffect } from 'react';
import { AlertTriangle, Activity, Users, ShieldAlert, RefreshCw, Clock } from 'lucide-react';

const OutbreakDashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [patterns, setPatterns] = useState({ alerts: [], stats: { total_screened: 0, emergency: 0, urgent: 0, routine: 0 }, window_hours: 24 });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [sessRes, patRes] = await Promise.all([
        fetch('http://localhost:3001/api/dashboard/sessions'),
        fetch('http://localhost:3001/api/dashboard/patterns')
      ]);
      const sessData = await sessRes.json();
      const patData = await patRes.json();
      setSessions(sessData);
      setPatterns(patData);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const { stats } = patterns;

  const getUrgencyBadge = (urgency) => {
    const colors = {
      Emergency: 'bg-emergency/20 text-emergency border-emergency/30',
      Urgent: 'bg-urgent/20 text-urgent border-urgent/30',
      Routine: 'bg-routine/20 text-routine border-routine/30'
    };
    return colors[urgency] || colors.Routine;
  };

  return (
    <div className="w-full max-w-6xl mx-auto animate-[fadeSlideIn_0.3s_ease]">
      
      {/* Staff-Only Header */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="px-3 py-1 rounded-full bg-urgent/10 border border-urgent/30 text-urgent text-xs font-bold uppercase tracking-wider">
              Staff Dashboard — Not visible to patients
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white">Outbreak & Pattern Detection</h1>
          <p className="text-slate-400 mt-1">Population-level symptom clustering and early-warning signals.</p>
        </div>
        <button
          onClick={() => { setLoading(true); fetchData(); }}
          className="flex items-center gap-2 px-4 py-2 bg-navy-850 border border-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="text-sm font-medium">Refresh</span>
        </button>
      </div>

      {/* Stats Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-navy-850 p-5 rounded-2xl border border-slate-800/60 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Users className="w-5 h-5 text-mint" />
          </div>
          <div className="text-3xl font-extrabold text-white">{stats.total_screened}</div>
          <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">Total Screened</div>
        </div>
        <div className="bg-navy-850 p-5 rounded-2xl border border-emergency/20 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-emergency" />
          </div>
          <div className="text-3xl font-extrabold text-emergency">{stats.emergency}</div>
          <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">Emergency</div>
        </div>
        <div className="bg-navy-850 p-5 rounded-2xl border border-urgent/20 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <ShieldAlert className="w-5 h-5 text-urgent" />
          </div>
          <div className="text-3xl font-extrabold text-urgent">{stats.urgent}</div>
          <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">Urgent</div>
        </div>
        <div className="bg-navy-850 p-5 rounded-2xl border border-routine/20 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-routine" />
          </div>
          <div className="text-3xl font-extrabold text-routine">{stats.routine}</div>
          <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">Routine</div>
        </div>
      </div>

      {/* Pattern Alerts */}
      {patterns.alerts.length > 0 && (
        <div className="mb-8 space-y-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-urgent" />
            Active Pattern Alerts
          </h3>
          
          {patterns.alerts.map((alert, i) => (
            <div 
              key={i}
              className={`p-6 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                alert.severity === 'alert'
                  ? 'bg-emergency/10 border-emergency/30'
                  : 'bg-urgent/10 border-urgent/30'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  alert.severity === 'alert' ? 'bg-emergency/20 text-emergency' : 'bg-urgent/20 text-urgent'
                }`}>
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                      alert.severity === 'alert'
                        ? 'bg-emergency/20 text-emergency border border-emergency/30'
                        : 'bg-urgent/20 text-urgent border border-urgent/30'
                    }`}>
                      {alert.severity === 'alert' ? '⚠ ALERT' : '👁 WATCH'}
                    </span>
                  </div>
                  <p className="text-white font-bold text-lg mt-1">
                    {alert.count} patients reported <span className="text-mint">{alert.keyword_cluster.join(' + ')}</span> within {alert.window}
                  </p>
                  <p className="text-slate-300 text-sm mt-1">
                    {alert.severity === 'alert'
                      ? 'Possible localized outbreak — consider notifying local health authority.'
                      : 'Emerging pattern detected — continue monitoring for escalation.'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {patterns.alerts.length === 0 && !loading && (
        <div className="mb-8 bg-routine/10 border border-routine/30 rounded-2xl p-6 text-center">
          <Activity className="w-8 h-8 text-routine mx-auto mb-2" />
          <p className="text-routine font-bold">No outbreak patterns detected</p>
          <p className="text-slate-400 text-sm mt-1">All symptom clusters are below threshold levels.</p>
        </div>
      )}

      {/* Recent Sessions Table */}
      <div className="bg-navy-850 rounded-2xl border border-slate-800/60 overflow-hidden">
        <div className="p-6 border-b border-slate-700/50">
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <Clock className="w-5 h-5 text-mint" />
            Recent Patient Sessions (Anonymized)
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-700/50 bg-navy-900/50">
                <th className="py-3 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Time</th>
                <th className="py-3 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Session</th>
                <th className="py-3 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest">HR</th>
                <th className="py-3 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Symptom Keywords</th>
                <th className="py-3 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Triage</th>
                <th className="py-3 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s, i) => (
                <tr key={i} className="border-b border-slate-800/50 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-6 text-sm text-slate-300 font-mono">
                    {new Date(s.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3 px-6 text-sm text-slate-500 font-mono">{s.session_id}</td>
                  <td className="py-3 px-6 text-sm text-white font-bold">
                    {s.vitals_summary?.heartRate || '—'} <span className="text-slate-500 font-normal text-xs">bpm</span>
                  </td>
                  <td className="py-3 px-6">
                    <div className="flex flex-wrap gap-1.5">
                      {(s.symptom_keywords || []).map((kw, j) => (
                        <span key={j} className="px-2 py-0.5 bg-navy-700 text-mint text-xs font-semibold rounded-full border border-slate-700">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${getUrgencyBadge(s.urgency)}`}>
                      {s.urgency}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-sm text-white font-bold">
                    {s.confidence || '—'}%
                  </td>
                </tr>
              ))}
              {sessions.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500">No sessions recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OutbreakDashboard;
