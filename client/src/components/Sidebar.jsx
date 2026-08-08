import React from 'react';
import { Home, Clock, FileBarChart, Lightbulb, Settings, Info, Activity } from 'lucide-react';

const Sidebar = ({ currentTab, setTab }) => {
  const getTabClass = (tabId) => {
    return currentTab === tabId
      ? "flex items-center gap-4 px-4 py-3 bg-mint/10 text-white rounded-xl cursor-pointer transition-colors"
      : "flex items-center gap-4 px-4 py-3 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-xl cursor-pointer transition-colors";
  };

  const getIconClass = (tabId) => {
    return currentTab === tabId ? "w-5 h-5 text-mint" : "w-5 h-5";
  };

  return (
    <aside className="w-64 bg-navy-850 h-screen flex flex-col border-r border-slate-800/50 flex-shrink-0 z-20">
      
      {/* Logo Area */}
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full border border-mint flex items-center justify-center bg-mint/5 relative">
          <Activity className="w-5 h-5 text-mint" />
          <div className="absolute inset-0 rounded-full shadow-glow-mint mix-blend-screen opacity-50"></div>
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white leading-none">Sentri</h1>
          <p className="text-mint text-[10px] uppercase font-bold tracking-widest mt-1">AI Health Kiosk</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-2 flex flex-col gap-2">
        <button onClick={() => setTab('home')} className={getTabClass('home')}>
          <Home className={getIconClass('home')} />
          <span className="font-semibold text-sm">Home</span>
        </button>
        <button onClick={() => setTab('history')} className={getTabClass('history')}>
          <Clock className={getIconClass('history')} />
          <span className="font-semibold text-sm">History</span>
        </button>
        <button onClick={() => setTab('reports')} className={getTabClass('reports')}>
          <FileBarChart className={getIconClass('reports')} />
          <span className="font-semibold text-sm">Reports</span>
        </button>
        <button onClick={() => setTab('insights')} className={getTabClass('insights')}>
          <Lightbulb className={getIconClass('insights')} />
          <span className="font-semibold text-sm">Insights</span>
        </button>
        <button onClick={() => setTab('settings')} className={getTabClass('settings')}>
          <Settings className={getIconClass('settings')} />
          <span className="font-semibold text-sm">Settings</span>
        </button>
        <button onClick={() => setTab('about')} className={getTabClass('about')}>
          <Info className={getIconClass('about')} />
          <span className="font-semibold text-sm">About</span>
        </button>
      </nav>

      <div className="px-4 mb-4">
        <div className="h-px bg-slate-800/60 w-full mb-4"></div>
        <button onClick={() => setTab('dashboard')} className={getTabClass('dashboard')}>
          <Activity className={getIconClass('dashboard')} />
          <span className="font-semibold text-sm">Staff Dashboard</span>
        </button>
      </div>

      {/* Health Assistant Card */}
      <div className="px-6 mb-6">
        <div className="bg-navy-800 border border-slate-700/50 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-white font-bold text-sm">Your Health Assistant</h3>
            <div className="w-5 h-5 rounded-full border-2 border-mint/30 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-mint"></div>
            </div>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed mb-6">
            I'm here to help you understand your health better and guide you towards a healthier you.
          </p>
          {/* Decorative small waveform */}
          <svg viewBox="0 0 100 20" className="w-full h-8 opacity-50">
            <path d="M0,10 L20,10 L25,0 L35,20 L40,10 L60,10 L65,5 L70,15 L75,10 L100,10" fill="none" stroke="#5EEAD4" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* System Status */}
      <div className="p-6 border-t border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-routine shadow-[0_0_8px_#34D399]"></div>
          <div>
            <div className="text-white font-semibold text-sm leading-tight">System Online</div>
            <div className="text-slate-500 text-[10px]">All systems operational</div>
          </div>
        </div>
      </div>
      
    </aside>
  );
};

export default Sidebar;
