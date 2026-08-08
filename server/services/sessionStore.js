const crypto = require('crypto');

// In-memory store (for hackathon demo)
const sessions = new Map();

// Symptom keyword vocabulary for outbreak detection
const SYMPTOM_KEYWORDS = [
  'fever', 'cough', 'headache', 'rash', 'vomiting',
  'diarrhea', 'sore throat', 'fatigue', 'dizziness',
  'chest pain', 'shortness of breath', 'nausea',
  'body ache', 'chills', 'runny nose'
];

const extractKeywords = (transcript) => {
  if (!transcript) return [];
  const lower = transcript.toLowerCase();
  return SYMPTOM_KEYWORDS.filter(kw => lower.includes(kw));
};

const createSession = () => {
  const id = Math.random().toString(36).substring(2, 8).toUpperCase();
  sessions.set(id, {
    id,
    created_at: new Date().toISOString(),
    vitals: null,
    symptoms: null,
    symptom_keywords: [],
    preliminary_result: null,
    triage_result: null,
    followup_history: []
  });
  return id;
};

const getSession = (id) => sessions.get(id);

const getAllSessions = () => Array.from(sessions.values());

const updateVitals = (id, vitals) => {
  const session = sessions.get(id);
  if (session) {
    session.vitals = vitals;
    sessions.set(id, session);
  }
};

const updateSymptoms = (id, symptoms) => {
  const session = sessions.get(id);
  if (session) {
    session.symptoms = symptoms;
    session.symptom_keywords = extractKeywords(symptoms?.transcript);
    sessions.set(id, session);
  }
};

const addFollowUpAnswer = (id, answer) => {
  const session = sessions.get(id);
  if (session) {
    session.followup_history.push({ role: 'user', content: answer });
    sessions.set(id, session);
  }
};

const updatePreliminaryResult = (id, result) => {
  const session = sessions.get(id);
  if (session) {
    session.preliminary_result = result;
    sessions.set(id, session);
  }
};

const updateTriageResult = (id, result) => {
  const session = sessions.get(id);
  if (session) {
    session.triage_result = result;
    if (result.needs_followup && result.followup_question) {
      session.followup_history.push({ role: 'assistant', content: result.followup_question });
    }
    sessions.set(id, session);
  }
};

// Demo seed: pre-populate sessions for outbreak dashboard demo
const seedDemoSessions = () => {
  const demoData = [
    {
      id: 'DEMO01',
      created_at: new Date(Date.now() - 3 * 3600000).toISOString(),
      vitals: { heartRate: 99, breathingRate: 20, stressLevel: 'Elevated' },
      symptoms: { transcript: 'I have a fever and a persistent cough since yesterday.' },
      symptom_keywords: ['fever', 'cough'],
      preliminary_result: null,
      triage_result: { urgency: 'Urgent', explanation: 'Fever combined with persistent cough warrants timely evaluation.', next_step: 'Visit urgent care within 4 hours.', key_factors: ['Fever', 'Persistent cough'], confidence: 78 },
      followup_history: []
    },
    {
      id: 'DEMO02',
      created_at: new Date(Date.now() - 2.5 * 3600000).toISOString(),
      vitals: { heartRate: 88, breathingRate: 18, stressLevel: 'Normal' },
      symptoms: { transcript: 'Having fever, cough, and some body aches since this morning.' },
      symptom_keywords: ['fever', 'cough', 'body ache'],
      preliminary_result: null,
      triage_result: { urgency: 'Urgent', explanation: 'Combination of fever, cough, and body aches suggests possible infection.', next_step: 'Schedule same-day appointment with primary care.', key_factors: ['Fever', 'Cough', 'Body aches'], confidence: 82 },
      followup_history: []
    },
    {
      id: 'DEMO03',
      created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
      vitals: { heartRate: 102, breathingRate: 22, stressLevel: 'High' },
      symptoms: { transcript: 'High fever and bad cough. Feeling very fatigued and have chills.' },
      symptom_keywords: ['fever', 'cough', 'fatigue', 'chills'],
      preliminary_result: null,
      triage_result: { urgency: 'Emergency', explanation: 'High fever with elevated heart rate and respiratory symptoms require immediate evaluation.', next_step: 'Go to the nearest emergency room immediately.', key_factors: ['High fever', 'Elevated HR > 100', 'Respiratory symptoms'], confidence: 91 },
      followup_history: []
    },
    {
      id: 'DEMO04',
      created_at: new Date(Date.now() - 1 * 3600000).toISOString(),
      vitals: { heartRate: 76, breathingRate: 16, stressLevel: 'Normal' },
      symptoms: { transcript: 'Mild headache and some dizziness when I stand up.' },
      symptom_keywords: ['headache', 'dizziness'],
      preliminary_result: null,
      triage_result: { urgency: 'Routine', explanation: 'Normal vitals with mild positional dizziness and headache. No red flags.', next_step: 'Rest and hydrate. Consult doctor if symptoms persist beyond 48 hours.', key_factors: ['Normal vitals', 'Mild symptoms'], confidence: 85 },
      followup_history: []
    },
    {
      id: 'DEMO05',
      created_at: new Date(Date.now() - 0.5 * 3600000).toISOString(),
      vitals: { heartRate: 95, breathingRate: 19, stressLevel: 'Elevated' },
      symptoms: { transcript: 'I have had a fever and dry cough for two days. Also feeling nauseous.' },
      symptom_keywords: ['fever', 'cough', 'nausea'],
      preliminary_result: null,
      triage_result: { urgency: 'Urgent', explanation: 'Persistent fever and cough over multiple days with nausea warrants prompt medical evaluation.', next_step: 'Visit urgent care today for evaluation and possible testing.', key_factors: ['Multi-day fever', 'Dry cough', 'Nausea'], confidence: 80 },
      followup_history: []
    }
  ];

  demoData.forEach(s => sessions.set(s.id, s));
  console.log(`Seeded ${demoData.length} demo sessions for outbreak dashboard.`);
};

module.exports = {
  createSession,
  getSession,
  getAllSessions,
  updateVitals,
  updateSymptoms,
  addFollowUpAnswer,
  updatePreliminaryResult,
  updateTriageResult,
  seedDemoSessions
};
