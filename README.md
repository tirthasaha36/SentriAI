# SentriAI — Contactless AI Health Triage Kiosk

<p align="center">
  <strong>Scan → Speak → Triage</strong><br/>
  A contactless, full-stack health triage prototype powered by computer vision, voice AI, and clinical LLM reasoning.
</p>

---

## 🏗 System Architecture

```text
ai-health-kiosk/
├── client/                  # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx          # Persistent navigation panel
│   │   │   ├── WelcomeScreen.jsx    # Dashboard landing page
│   │   │   ├── VitalsScan.jsx       # rPPG camera + MediaPipe face detection
│   │   │   ├── SymptomIntake.jsx    # Voice/text symptom capture
│   │   │   ├── TriageResult.jsx     # AI triage output with explainability
│   │   │   ├── HistoryView.jsx      # Session timeline + trend graphs
│   │   │   ├── ReportsView.jsx      # Exportable reports (Patient & Clinical view)
│   │   │   ├── InsightsView.jsx     # AI-driven preventive health analytics
│   │   │   ├── SettingsView.jsx     # Profile, privacy, accessibility controls
│   │   │   └── AboutView.jsx        # Technical pipeline + disclaimers
│   │   ├── utils/
│   │   │   ├── signalProcessing.js  # FFT, bandpass filter, HR/BR estimation
│   │   │   └── llm.js               # Client-side LLM utilities
│   │   └── api.js                   # Backend API integration layer
│   └── tailwind.config.js           # Custom dark theme tokens
├── server/                  # Node.js + Express backend
│   ├── routes/
│   │   ├── session.js               # Session lifecycle management
│   │   ├── triage.js                # LLM triage orchestration endpoint
│   │   └── facilities.js            # Nearby facility lookup
│   └── services/
│       ├── llm.js                   # Groq LLaMA-3 70B integration
│       └── sessionStore.js          # In-memory session store
```

### 🧠 Core Technologies
| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18, Vite, Tailwind CSS v3 | Responsive dark-themed dashboard UI |
| **Computer Vision** | MediaPipe FaceLandmarker | Browser-side face detection & ROI extraction |
| **Signal Processing** | Custom FFT (Cooley-Tukey) | Heart rate & breathing rate estimation from rPPG |
| **LLM Triage** | LLaMA 3.3 70B via Groq | ESI-style clinical urgency classification |
| **Backend** | Node.js, Express | Session management & API orchestration |

---

## ✨ Features

### Core Pipeline
1. **Contactless Vitals Extraction (rPPG)**
   - MediaPipe FaceLandmarker identifies the forehead ROI in real-time
   - Extracts green-channel intensity variations to derive the cardiac pulse signal
   - Calculates Heart Rate (BPM), Breathing Rate, and HRV stress via FFT spectral analysis

2. **Voice / Text Symptom Intake**
   - Captures patient-described symptoms via Web Speech API or manual text entry
   - Feeds unstructured natural language into the triage engine

3. **Agentic LLM Triage**
   - Fuses vitals + symptoms into a structured ESI-style assessment
   - Classifies urgency: **Emergency** · **Urgent** · **Routine**
   - Provides plain-language reasoning and concrete next steps
   - Explainability panel ("Why this result?") with key contributing factors

### Advanced Capabilities (New)
1. **Live Multi-Modal Fusion Visualization**
   - After the vitals scan, the AI performs a **preliminary triage** (vitals only) to establish a baseline confidence level.
   - Once symptoms are submitted, the UI animates a **live fusion transition**, showing exactly how the AI's urgency classification and confidence score evolved when combining the multimodal signals (vitals + voice).

2. **Outbreak / Pattern Detection Dashboard**
   - A population-level staff dashboard that aggregates anonymized triage sessions.
   - Continuously extracts symptom keywords (e.g., fever, cough) and detects temporal clusters.
   - Automatically flags localized "Pattern Alerts" when multiple patients report overlapping symptoms within a 24-hour window, providing an early-warning signal for potential outbreaks.

### Dashboard Views
| View | Description |
|------|-------------|
| **Home** | Landing page with hero section, "How It Works" pipeline, and session launcher |
| **History** | Chronological session timeline with HR trend graphs, expandable session details, urgency badges, and "Compare to last visit" deltas |
| **Reports** | Exportable health summaries with **Patient View** (plain language) and **Clinical View** (structured data table with ESI levels). Download PDF & Generate QR Code for clinical intake |
| **Insights** | AI-driven preventive analytics — health score, risk pattern detection, cardiovascular recovery trends, and personalized recommendations |
| **Settings** | Patient profiles & dependents, language preferences, notification controls, emergency auto-alert consent, data export/wipe, accessibility toggles |
| **About** | Technical pipeline explanation (rPPG + LLM), formal medical disclaimer, data privacy statement, and project credits |

---

## 🚀 Getting Started

### 1. Backend Setup
```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory:
```env
PORT=3001
GROQ_API_KEY=gsk_your_api_key_here
```
> Get a free Groq API key at [console.groq.com/keys](https://console.groq.com/keys)

Start the backend:
```bash
node index.js
```

### 2. Frontend Setup
In a new terminal:
```bash
cd client
npm install
npm run dev
```

Open **http://localhost:5173** to launch SentriAI.

---

## 🔒 Privacy & Data

- **Video streams** are processed entirely in-browser via MediaPipe — never recorded or transmitted
- **Symptom transcripts** are sent to Groq's LLM endpoint over TLS and are not permanently logged
- **Session data** is stored in-memory on the server and is cleared on restart
- All health data operations comply with a privacy-first, minimal-retention architecture

---

## ⚠️ Disclaimer

**SentriAI is a decision-support prototype built for demonstration and hackathon purposes. It is NOT a certified medical device and must not be used as a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider in emergency situations.**
