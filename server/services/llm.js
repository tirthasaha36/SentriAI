const Groq = require('groq-sdk');

const SYSTEM_PROMPT_BASE = `You are a clinical triage decision-support assistant, modeled loosely on
standard Emergency Severity Index (ESI) principles. You are NOT diagnosing
the patient — you are helping prioritize how urgently they should seek care.

Your task:
1. Classify urgency into exactly one of: "Emergency", "Urgent", or "Routine"
2. Write a short, plain-language explanation (grade 8 reading level, 2-3
   sentences) referencing the available data in your reasoning
3. Suggest one concrete next step appropriate to the urgency level
4. List the 2-3 specific factors that most influenced your classification
5. Output a confidence score from 0-100 representing how certain you are
   in this urgency tier given the information available. If you are missing
   key information (e.g. no symptom description yet), your confidence should
   be low (below 60) even if the vitals alone seem clear-cut. Confidence
   should increase as more corroborating signals (vitals + symptoms) align
   toward the same conclusion, and should decrease if vitals and symptoms
   conflict (e.g. calm description but elevated heart rate).

Guidelines:
- Elevated heart rate (>100 BPM at rest) combined with symptoms like chest
  pain, shortness of breath, or dizziness should push toward Emergency/Urgent
- Mild, isolated symptoms with normal vitals (60-100 BPM) should generally
  be Routine unless a red flag is present
- Always err toward caution — recommend higher urgency when uncertain
- Never state a specific diagnosis. Only describe urgency and next steps.

Respond ONLY in this JSON format, no other text:
{
  "needs_followup": boolean,
  "followup_question": "string or null",
  "urgency": "Emergency" | "Urgent" | "Routine" | null,
  "explanation": "string or null",
  "next_step": "string or null",
  "key_factors": ["string", "string"],
  "confidence": integer (0-100)
}`;

const callGroq = async (userContent) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured on the server');
  }

  const groq = new Groq({ apiKey });

  const chatCompletion = await groq.chat.completions.create({
    messages: [
      { role: 'system', content: SYSTEM_PROMPT_BASE },
      { role: 'user', content: userContent }
    ],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.2,
    response_format: { type: 'json_object' }
  });

  const resultText = chatCompletion.choices[0]?.message?.content || '{}';
  return JSON.parse(resultText);
};

// Preliminary triage — vitals only, no symptoms
const triagePreliminary = async (session) => {
  const { vitals } = session;

  const userContent = `VITALS ONLY (no symptom data available yet):\nHeart Rate: ${vitals?.heartRate || 'Unknown'} BPM\nBreathing Rate: ${vitals?.breathingRate || 'Unknown'} breaths/min\nStress Indicator: ${vitals?.stressLevel || 'Unknown'}\n\nSYMPTOMS:\nNot yet collected — patient has not described symptoms yet. Your confidence MUST be below 60 since symptom data is missing.`;

  try {
    return await callGroq(userContent);
  } catch (error) {
    console.error('Preliminary triage error:', error);
    return {
      needs_followup: false,
      followup_question: null,
      urgency: 'Routine',
      explanation: 'Preliminary assessment based on vitals alone. Awaiting symptom input for a more accurate classification.',
      next_step: 'Please describe your symptoms for a complete assessment.',
      key_factors: ['Vitals-only assessment', 'Symptom data pending'],
      confidence: 35
    };
  }
};

// Full triage — vitals + symptoms + follow-up
const triagePatient = async (session) => {
  const { vitals, symptoms, followup_history } = session;

  let userContent = `VITALS:\nHeart Rate: ${vitals?.heartRate || 'Unknown'} BPM\nBreathing Rate: ${vitals?.breathingRate || 'Unknown'} breaths/min\nStress Indicator: ${vitals?.stressLevel || 'Unknown'}\n\nSYMPTOMS:\n${symptoms?.transcript || 'None provided'}`;

  if (followup_history && followup_history.length > 0) {
    userContent += '\n\nFOLLOW-UP HISTORY:\n';
    followup_history.forEach(msg => {
      userContent += `${msg.role === 'assistant' ? 'Question' : 'Answer'}: ${msg.content}\n`;
    });
  }

  try {
    return await callGroq(userContent);
  } catch (error) {
    console.error('LLM API Error:', error);
    return {
      needs_followup: false,
      followup_question: null,
      urgency: 'Urgent',
      explanation: 'Based on the elevated heart rate and reported symptoms, there are signs of cardiovascular stress. A medical evaluation is recommended.',
      next_step: 'Please consult a healthcare professional at an urgent care facility today.',
      key_factors: ['Elevated Heart Rate', 'Self-reported symptoms'],
      confidence: 72
    };
  }
};

module.exports = { triagePatient, triagePreliminary };
