import React from 'react';
import { Activity, Mic, ShieldCheck, ArrowRight, Shield, Lock, Zap, Clock } from 'lucide-react';

const WelcomeScreen = ({ onStart }) => {
  return (
    <div className="flex flex-col w-full h-full animate-[fadeSlideIn_0.5s_ease] mt-4">
      
      {/* Top Banner & Hero Section */}
      <div className="flex flex-col lg:flex-row gap-8 mb-8">
        
        {/* Left: Text Content */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-700 bg-navy-900/50 w-max mb-8">
            <Zap className="w-3.5 h-3.5 text-mint" />
            <span className="text-xs font-semibold text-slate-300 tracking-wide">AI Powered • Private • Secure</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1] mb-6">
            Your Health,<br/>
            <span className="bg-gradient-to-r from-mint to-mint-hover bg-clip-text text-transparent">Our Priority</span>
          </h1>
          
          <p className="text-lg text-slate-400 leading-relaxed max-w-xl">
            Sentri uses AI to analyze your health vitals and provide intelligent triage and recommendations.
          </p>
        </div>
        
        {/* Right: Glowing Heart Graphic */}
        <div className="flex-1 flex items-center justify-center relative min-h-[300px]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(94,234,212,0.15)_0%,transparent_70%)]"></div>
          
          {/* Abstract 3D Heart Stand-in */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-48 h-48 text-mint drop-shadow-glow-mint-lg opacity-90" fill="none" stroke="currentColor" strokeWidth="0.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
               <svg viewBox="0 0 100 30" className="w-32 h-10">
                 <path d="M0,15 L15,15 L20,5 L30,25 L35,15 L55,15 L60,10 L65,20 L70,15 L100,15" fill="none" stroke="#5EEAD4" strokeWidth="2" strokeLinejoin="round" className="drop-shadow-glow-mint" />
               </svg>
            </div>
            
            {/* Glowing Base Platform */}
            <div className="mt-8 relative w-48 h-12">
              <div className="absolute inset-0 rounded-[50%] border-2 border-mint/40 bg-mint/5 shadow-[inset_0_0_20px_rgba(94,234,212,0.2)]"></div>
              <div className="absolute inset-2 rounded-[50%] border border-mint/20 bg-navy-900/80"></div>
            </div>
          </div>
        </div>
      </div>

      {/* How it Works Section */}
      <div className="bg-navy-850 rounded-[2rem] p-8 lg:p-10 border border-slate-800/60 mb-8 relative overflow-hidden">
        <h3 className="text-xl font-bold text-white mb-8">How It Works</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Decorative connecting line */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-px bg-slate-700/50 border-t border-dashed border-slate-600/50 z-0"></div>
          
          <div className="bg-navy-800 rounded-2xl p-6 border border-slate-700/30 relative z-10 flex gap-5 items-start">
            <div className="relative">
              <div className="absolute -top-3 -left-3 w-6 h-6 rounded-full bg-mint text-navy-950 flex items-center justify-center text-[10px] font-bold shadow-glow-mint">01</div>
              <div className="w-16 h-16 rounded-2xl bg-navy-700/50 border border-slate-700 flex items-center justify-center">
                <Activity className="w-8 h-8 text-mint" />
              </div>
            </div>
            <div className="pt-1">
              <h4 className="font-bold text-white text-lg mb-1">Scan</h4>
              <p className="text-sm text-slate-400 leading-relaxed">Extract your vitals using contactless technology.</p>
            </div>
          </div>
          
          <div className="bg-navy-800 rounded-2xl p-6 border border-slate-700/30 relative z-10 flex gap-5 items-start">
            <div className="relative">
              <div className="absolute -top-3 -left-3 w-6 h-6 rounded-full bg-mint text-navy-950 flex items-center justify-center text-[10px] font-bold shadow-glow-mint">02</div>
              <div className="w-16 h-16 rounded-2xl bg-navy-700/50 border border-slate-700 flex items-center justify-center">
                <Mic className="w-8 h-8 text-mint" />
              </div>
            </div>
            <div className="pt-1">
              <h4 className="font-bold text-white text-lg mb-1">Speak</h4>
              <p className="text-sm text-slate-400 leading-relaxed">Describe your symptoms using voice input.</p>
            </div>
          </div>
          
          <div className="bg-navy-800 rounded-2xl p-6 border border-slate-700/30 relative z-10 flex gap-5 items-start">
            <div className="relative">
              <div className="absolute -top-3 -left-3 w-6 h-6 rounded-full bg-mint text-navy-950 flex items-center justify-center text-[10px] font-bold shadow-glow-mint">03</div>
              <div className="w-16 h-16 rounded-2xl bg-navy-700/50 border border-slate-700 flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-mint" />
              </div>
            </div>
            <div className="pt-1">
              <h4 className="font-bold text-white text-lg mb-1">Triage</h4>
              <p className="text-sm text-slate-400 leading-relaxed">AI analyzes and classifies severity to guide your next steps.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action Banner */}
      <div className="bg-gradient-to-r from-navy-850 via-[#1A453A] to-mint rounded-3xl p-8 lg:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 border border-mint/20 shadow-glow-mint-lg mb-8">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-mint/20 border-2 border-mint flex items-center justify-center shadow-[inset_0_0_15px_rgba(94,234,212,0.5)]">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Ready to check your health?</h2>
            <p className="text-mint/90 font-medium">Start a new session and let Sentri assist you.</p>
          </div>
        </div>
        <button 
          onClick={onStart}
          className="bg-white text-navy-950 hover:bg-slate-100 font-bold px-8 py-4 rounded-full transition-all duration-300 flex items-center gap-3 hover:scale-105 active:scale-95 shadow-xl whitespace-nowrap"
        >
          Start Session
          <ArrowRight className="w-5 h-5 text-mint" />
        </button>
      </div>

      {/* Footer Feature Highlights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-navy-850 rounded-2xl p-5 flex items-center gap-4 border border-slate-800/50">
          <div className="w-10 h-10 rounded-xl bg-navy-700/50 flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-mint" />
          </div>
          <div>
            <div className="text-white font-bold text-sm">100% Contactless</div>
            <div className="text-slate-500 text-xs mt-0.5">Safe & hygienic</div>
          </div>
        </div>
        
        <div className="bg-navy-850 rounded-2xl p-5 flex items-center gap-4 border border-slate-800/50">
          <div className="w-10 h-10 rounded-xl bg-navy-700/50 flex items-center justify-center flex-shrink-0">
            <Lock className="w-5 h-5 text-mint" />
          </div>
          <div>
            <div className="text-white font-bold text-sm">Privacy First</div>
            <div className="text-slate-500 text-xs mt-0.5">Data is encrypted</div>
          </div>
        </div>
        
        <div className="bg-navy-850 rounded-2xl p-5 flex items-center gap-4 border border-slate-800/50">
          <div className="w-10 h-10 rounded-xl bg-navy-700/50 flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-urgent" />
          </div>
          <div>
            <div className="text-white font-bold text-sm">AI Powered</div>
            <div className="text-slate-500 text-xs mt-0.5">Advanced insights</div>
          </div>
        </div>
        
        <div className="bg-navy-850 rounded-2xl p-5 flex items-center gap-4 border border-slate-800/50">
          <div className="w-10 h-10 rounded-xl bg-navy-700/50 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-[#F472B6]" />
          </div>
          <div>
            <div className="text-white font-bold text-sm">Quick & Easy</div>
            <div className="text-slate-500 text-xs mt-0.5">Results in minutes</div>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default WelcomeScreen;
