import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import MedicineSafety from './components/MedicineSafety';
import Decoder from './components/Decoder';
import LabTrends from './components/LabTrends';
import Scribe from './components/Scribe';
import AboutView from './components/AboutView';
import './index.css';

const VIEWS = {
  dashboard: Dashboard,
  medicines: MedicineSafety,
  decode: Decoder,
  labs: LabTrends,
  scribe: Scribe,
  about: AboutView,
};

function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const View = VIEWS[currentTab] || Dashboard;

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 font-sans flex overflow-hidden">
      <Sidebar currentTab={currentTab} setTab={setCurrentTab} />
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        <main className="flex-1 p-8 lg:p-12 w-full max-w-7xl mx-auto">
          <View setTab={setCurrentTab} />
        </main>
      </div>
    </div>
  );
}

export default App;
