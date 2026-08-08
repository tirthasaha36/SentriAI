const API_BASE = 'http://localhost:3001/api';

export const startSession = async () => {
  const res = await fetch(`${API_BASE}/session/start`, { method: 'POST' });
  return res.json();
};

export const saveVitals = async (sessionId, vitals) => {
  const res = await fetch(`${API_BASE}/session/${sessionId}/vitals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(vitals)
  });
  return res.json();
};

export const saveSymptoms = async (sessionId, symptoms) => {
  const res = await fetch(`${API_BASE}/session/${sessionId}/symptoms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(symptoms)
  });
  return res.json();
};

export const runTriage = async (sessionId, followupAnswer = null) => {
  const body = followupAnswer ? { followup_answer: followupAnswer } : {};
  const res = await fetch(`${API_BASE}/session/${sessionId}/triage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return res.json();
};

export const getSessionSummary = async (sessionId) => {
  const res = await fetch(`${API_BASE}/session/${sessionId}/summary`);
  return res.json();
};

export const getFacilities = async (tier) => {
  const url = tier ? `${API_BASE}/facilities?tier=${tier}` : `${API_BASE}/facilities`;
  const res = await fetch(url);
  return res.json();
};

export const runPreliminaryTriage = async (sessionId) => {
  const res = await fetch(`${API_BASE}/session/${sessionId}/triage/preliminary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  });
  return res.json();
};

export const getDashboardSessions = async () => {
  const res = await fetch(`${API_BASE}/dashboard/sessions`);
  return res.json();
};

export const getDashboardPatterns = async () => {
  const res = await fetch(`${API_BASE}/dashboard/patterns`);
  return res.json();
};
