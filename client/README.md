# AI Health Kiosk (SentriAI) 🩺🤖

A contactless health triage web application that combines webcam-based vital signs detection with AI-powered voice symptom analysis to provide instant triage guidance. 

Built as a single-page kiosk-style UI, this tool is designed to be completely contactless and user-friendly, operating directly in the browser with no additional hardware or wearables required.

## ✨ Features

1. **Contactless Vitals Scanning (rPPG)**
   - Uses your webcam and MediaPipe Face Landmarker to detect your face and isolate the forehead region.
   - Extracts the heart rate (and estimates breathing rate) by analyzing the micro-variations of green light absorption in your facial capillaries (remote photoplethysmography).
   - Real-time animated waveform visualization of the blood pulse signal.

2. **Voice Symptom Intake**
   - Built-in speech-to-text using the browser's Web Speech API.
   - Users can simply tap a microphone and describe how they are feeling naturally.
   - Live transcript generation with a text fallback for unsupported browsers.

3. **AI-Powered Clinical Triage**
   - Integrates with Groq's high-speed LLM API (`llama-3.1-70b-versatile`).
   - Uses an Emergency Severity Index (ESI)-inspired prompt to combine the measured vitals with the transcribed symptoms.
   - Outputs a color-coded urgency level (🔴 Emergency, 🟡 Urgent, 🟢 Routine), a plain-language explanation, and recommended next steps.

## 🛠️ Tech Stack

- **Frontend Framework:** React + Vite
- **Computer Vision:** MediaPipe Tasks Vision (`@mediapipe/tasks-vision`)
- **Signal Processing:** Custom FFT (Fast Fourier Transform), Bandpass Filtering, and Detrending algorithms written in plain JavaScript.
- **Styling:** Custom CSS with a premium, dark, glassmorphic design system.
- **AI / LLM:** Groq API (OpenAI-compatible endpoints).

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- A webcam
- A [Groq API Key](https://console.groq.com/) for the AI triage step.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/SwarnadiptaDas/SentriAI.git
   cd SentriAI
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:5173` in your browser.

5. Click the gear icon (⚙️) in the top right corner of the welcome screen to paste your Groq API key before testing the triage features.

## ⚠️ Disclaimer
**This is a decision-support prototype, not a certified medical device.** The vitals detection relies heavily on good, even lighting and sitting still. It should never be used for real medical diagnoses. Always consult a certified healthcare professional for medical advice.