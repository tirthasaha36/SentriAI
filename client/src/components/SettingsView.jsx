import React, { useState } from 'react';
import { User, Users, Globe, Bell, Shield, Eye, Trash2, Download } from 'lucide-react';

const SettingsView = () => {
  const [profile, setProfile] = useState({
    name: 'John Doe',
    age: 38,
    conditions: 'Mild Hypertension',
    allergies: 'Penicillin'
  });

  const [activeDependent, setActiveDependent] = useState('self');
  const [notifications, setNotifications] = useState(true);
  const [emergencyAlerts, setEmergencyAlerts] = useState(true);
  const [voiceNav, setVoiceNav] = useState(false);

  return (
    <div className="w-full max-w-4xl mx-auto animate-[fadeSlideIn_0.3s_ease]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Settings & Profile</h1>
        <p className="text-slate-400">Manage user profiles, preferences, and data privacy options.</p>
      </div>

      <div className="space-y-8">
        
        {/* Profile & Dependents */}
        <div className="bg-navy-850 p-6 rounded-2xl border border-slate-800/60">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-5 h-5 text-mint" />
            <h2 className="text-xl font-bold text-white">Patient Profiles</h2>
          </div>

          <div className="flex gap-4 mb-6">
            <button 
              onClick={() => setActiveDependent('self')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 border transition-all ${activeDependent === 'self' ? 'bg-mint/10 border-mint text-mint' : 'border-slate-700 text-slate-400'}`}
            >
              <User className="w-4 h-4" />
              John Doe (Self)
            </button>
            <button 
              onClick={() => setActiveDependent('child')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 border transition-all ${activeDependent === 'child' ? 'bg-mint/10 border-mint text-mint' : 'border-slate-700 text-slate-400'}`}
            >
              <Users className="w-4 h-4" />
              Emma Doe (Child)
            </button>
            <button className="px-4 py-2 rounded-xl text-sm font-semibold border border-dashed border-slate-700 text-slate-500 hover:text-slate-300 transition-all">
              + Add Dependent
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
              <input 
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full bg-navy-900 border border-slate-700 text-white rounded-lg p-3 outline-none focus:border-mint"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Age</label>
              <input 
                type="number"
                value={profile.age}
                onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                className="w-full bg-navy-900 border border-slate-700 text-white rounded-lg p-3 outline-none focus:border-mint"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Known Conditions</label>
              <input 
                type="text"
                value={profile.conditions}
                onChange={(e) => setProfile({ ...profile, conditions: e.target.value })}
                className="w-full bg-navy-900 border border-slate-700 text-white rounded-lg p-3 outline-none focus:border-mint"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Known Allergies</label>
              <input 
                type="text"
                value={profile.allergies}
                onChange={(e) => setProfile({ ...profile, allergies: e.target.value })}
                className="w-full bg-navy-900 border border-slate-700 text-white rounded-lg p-3 outline-none focus:border-mint"
              />
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-navy-850 p-6 rounded-2xl border border-slate-800/60">
          <div className="flex items-center gap-3 mb-6">
            <Globe className="w-5 h-5 text-mint" />
            <h2 className="text-xl font-bold text-white">System Preferences</h2>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-white font-semibold text-sm">Primary Language</h4>
                <p className="text-slate-400 text-xs mt-0.5">Used for voice input and LLM triage explanations.</p>
              </div>
              <select className="bg-navy-900 border border-slate-700 text-white rounded-lg p-2 text-sm outline-none">
                <option>English (US)</option>
                <option>Spanish (ES)</option>
                <option>French (FR)</option>
                <option>Hindi (IN)</option>
              </select>
            </div>

            <div className="flex justify-between items-center border-t border-slate-800 pt-4">
              <div>
                <h4 className="text-white font-semibold text-sm">Follow-up Nudges</h4>
                <p className="text-slate-400 text-xs mt-0.5">Receive reminders to check vitals if previous scan was urgent.</p>
              </div>
              <input 
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                className="w-5 h-5 accent-mint cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Data & Privacy */}
        <div className="bg-navy-850 p-6 rounded-2xl border border-slate-800/60">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-5 h-5 text-mint" />
            <h2 className="text-xl font-bold text-white">Data & Privacy</h2>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-white font-semibold text-sm">Emergency Auto-Alert Consent</h4>
                <p className="text-slate-400 text-xs mt-0.5">Automatically notify designated emergency contact if triage level is Emergency.</p>
              </div>
              <input 
                type="checkbox"
                checked={emergencyAlerts}
                onChange={(e) => setEmergencyAlerts(e.target.checked)}
                className="w-5 h-5 accent-mint cursor-pointer"
              />
            </div>

            <div className="flex gap-4 border-t border-slate-800 pt-4">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-navy-900 border border-slate-700 text-slate-300 text-sm font-semibold hover:text-white">
                <Download className="w-4 h-4 text-mint" />
                Export My Data (JSON)
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emergency/10 border border-emergency/30 text-emergency text-sm font-semibold hover:bg-emergency/20">
                <Trash2 className="w-4 h-4" />
                Clear Local Session Data
              </button>
            </div>
          </div>
        </div>

        {/* Accessibility */}
        <div className="bg-navy-850 p-6 rounded-2xl border border-slate-800/60">
          <div className="flex items-center gap-3 mb-6">
            <Eye className="w-5 h-5 text-mint" />
            <h2 className="text-xl font-bold text-white">Accessibility</h2>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-white font-semibold text-sm">Voice-Only Navigation Toggle</h4>
              <p className="text-slate-400 text-xs mt-0.5">Enable hands-free kiosk operation via speech commands.</p>
            </div>
            <input 
              type="checkbox"
              checked={voiceNav}
              onChange={(e) => setVoiceNav(e.target.checked)}
              className="w-5 h-5 accent-mint cursor-pointer"
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default SettingsView;
