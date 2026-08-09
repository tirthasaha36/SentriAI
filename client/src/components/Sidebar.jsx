import React from 'react';
import { LayoutDashboard, Pill, FileText, LineChart, Mic, Info, ShieldPlus } from 'lucide-react';

export const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'medicines', label: 'Medicine Safety', icon: Pill },
  { id: 'decode', label: 'Decode Document', icon: FileText },
  { id: 'labs', label: 'Lab Trends', icon: LineChart },
  { id: 'scribe', label: 'Consult Scribe', icon: Mic },
];

const Sidebar = ({ currentTab, setTab }) => {
  const tabClass = (id) =>
    currentTab === id
      ? 'flex items-center gap-4 px-4 py-3 bg-mint/10 text-white rounded-xl cursor-pointer transition-colors'
      : 'flex items-center gap-4 px-4 py-3 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-xl cursor-pointer transition-colors';

  const iconClass = (id) => (currentTab === id ? 'w-5 h-5 text-mint' : 'w-5 h-5');

  return (
    <aside className="w-64 bg-navy-850 h-screen flex flex-col border-r border-slate-800/50 flex-shrink-0 z-20">
      <div 
        onClick={() => setTab('dashboard')} 
        className="p-8 flex items-center gap-3 cursor-pointer group"
      >
        <div className="w-10 h-10 rounded-xl overflow-hidden border border-mint/20 flex items-center justify-center bg-mint/5 relative group-hover:border-mint/60 transition-colors">
          <img src="/logo.png" alt="Sentri Logo" className="w-full h-full object-cover" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white leading-none group-hover:text-mint transition-colors">Sentri</h1>
          <p className="text-mint text-[10px] uppercase font-bold tracking-widest mt-1">Health Records, Decoded</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-2 flex flex-col gap-2">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)} className={tabClass(id)}>
            <Icon className={iconClass(id)} />
            <span className="font-semibold text-sm">{label}</span>
          </button>
        ))}
      </nav>

      <div className="px-4 mb-4">
        <div className="h-px bg-slate-800/60 w-full mb-4"></div>
        <button onClick={() => setTab('about')} className={tabClass('about')}>
          <Info className={iconClass('about')} />
          <span className="font-semibold text-sm">About &amp; Limits</span>
        </button>
      </div>

      <div className="p-6 border-t border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-routine shadow-[0_0_8px_#34D399]"></div>
          <div>
            <div className="text-white font-semibold text-sm leading-tight">Not a diagnosis</div>
            <div className="text-slate-500 text-[10px]">Decision support only</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
