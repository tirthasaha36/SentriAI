const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001/api';

const postJSON = async (path, body) => {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {})
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText}${detail ? ` — ${detail}` : ''}`);
  }
  return res.json();
};

const getJSON = async (path) => {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
};

export const health = () => getJSON('/health');

// --- Feature 1: medication safety ---
export const resolveDrugs = (names) => postJSON('/medicines/resolve', { names });
export const checkInteractions = (drugs) => postJSON('/medicines/interactions', { drugs });

// --- Feature 2: prescription / discharge decoder ---
export const decodeDocument = (text, language) =>
  postJSON('/decode', { text, language });

// --- Feature 3: lab trends ---
export const parseLabReport = (text, reportDate) =>
  postJSON('/labs/parse', { text, report_date: reportDate });
export const analyseLabTrends = (reports) => postJSON('/labs/trends', { reports });

// --- Feature 4: ambient scribe ---
export const transcribeAudio = async (blob) => {
  const form = new FormData();
  form.append('audio', blob, 'consult.webm');
  const res = await fetch(`${API_BASE}/scribe/transcribe`, { method: 'POST', body: form });
  if (!res.ok) throw new Error(`Transcription failed: ${res.status}`);
  return res.json();
};
export const generateNote = (transcript) => postJSON('/scribe/note', { transcript });
