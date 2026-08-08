import React from 'react';
import { ShieldAlert, Cpu, Lock, Award, HeartHandshake } from 'lucide-react';

const AboutView = () => {
  return (
    <div className="w-full max-w-4xl mx-auto animate-[fadeSlideIn_0.3s_ease]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">About SentriAI</h1>
        <p className="text-slate-400">Technical depth, medical safety disclaimers, and project background.</p>
      </div>

      <div className="space-y-8">
        
        {/* Core Mission */}
        <div className="bg-navy-850 p-8 rounded-2xl border border-slate-800/60 flex items-start gap-6">
          <div className="w-12 h-12 rounded-2xl bg-mint/10 border border-mint/30 flex items-center justify-center flex-shrink-0">
            <HeartHandshake className="w-6 h-6 text-mint" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mb-2">What SentriAI Does</h2>
            <p className="text-slate-300 leading-relaxed text-sm">
              SentriAI is an intelligent, contactless health triage kiosk designed to reduce emergency room congestion and provide immediate guidance to patients. By combining computer vision vitals detection, speech-to-text symptom intake, and clinical LLM reasoning, Sentri rapidly prioritizes patient urgency using Emergency Severity Index (ESI) principles.
            </p>
          </div>
        </div>

        {/* Technical Pipeline */}
        <div className="bg-navy-850 p-8 rounded-2xl border border-slate-800/60">
          <div className="flex items-center gap-3 mb-6">
            <Cpu className="w-6 h-6 text-mint" />
            <h2 className="text-xl font-bold text-white">How It Works Technically</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-navy-900 p-5 rounded-xl border border-slate-800">
              <span className="text-mint font-mono font-bold text-xs uppercase tracking-widest block mb-2">01. rPPG Computer Vision</span>
              <h4 className="text-white font-bold mb-2">Remote Photoplethysmography</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Uses MediaPipe FaceLandmarker to identify forehead ROI. Analyzes microscopic color intensity variations in the green spectral channel to derive the heart rate signal without physical contact.
              </p>
            </div>

            <div className="bg-navy-900 p-5 rounded-xl border border-slate-800">
              <span className="text-mint font-mono font-bold text-xs uppercase tracking-widest block mb-2">02. Voice Symptom Processing</span>
              <h4 className="text-white font-bold mb-2">Natural Speech Intake</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Captures unstructured patient speech using Web Speech API, transcribing self-reported complaints into structured medical context ready for LLM consumption.
              </p>
            </div>

            <div className="bg-navy-900 p-5 rounded-xl border border-slate-800">
              <span className="text-mint font-mono font-bold text-xs uppercase tracking-widest block mb-2">03. Clinical LLM Triage</span>
              <h4 className="text-white font-bold mb-2">Groq LLaMA-3 70B Engine</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Processes combined vitals and transcript data against ESI guidelines, outputting a structured urgency score (Emergency / Urgent / Routine) along with plain-language rationale.
              </p>
            </div>
          </div>
        </div>

        {/* Formal Disclaimer & Privacy Statement */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-navy-850 p-6 rounded-2xl border border-emergency/20">
            <div className="flex items-center gap-3 mb-3 text-emergency">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="font-bold text-lg">Medical Disclaimer</h3>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              SentriAI is a decision-support prototype built for demonstration and research purposes only. It is <strong>NOT a certified medical device</strong> and should never be used as a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of a qualified physician in emergency situations.
            </p>
          </div>

          <div className="bg-navy-850 p-6 rounded-2xl border border-slate-800/60">
            <div className="flex items-center gap-3 mb-3 text-mint">
              <Lock className="w-5 h-5" />
              <h3 className="font-bold text-lg">Data Privacy Statement</h3>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              We take health data privacy seriously. Video streams for rPPG are processed locally in your browser memory and are <strong>never recorded or transmitted</strong> to external servers. Symptom transcripts are sent directly to the Groq LLM endpoint over TLS and are not permanently logged.
            </p>
          </div>
        </div>

        {/* Credits */}
        <div className="bg-navy-850 p-6 rounded-2xl border border-slate-800/60 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Award className="w-5 h-5 text-mint" />
            <div>
              <h4 className="text-white font-bold text-sm">Built for Hackathon Demo</h4>
              <p className="text-slate-400 text-xs">Developed with React, Express, MediaPipe, and Groq LLaMA-3.</p>
            </div>
          </div>
          <span className="text-xs text-slate-500 font-mono">v1.0.0-production</span>
        </div>

      </div>
    </div>
  );
};

export default AboutView;
