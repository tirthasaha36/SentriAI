const Groq = require('groq-sdk');

const TEXT_MODEL = process.env.GROQ_TEXT_MODEL || 'llama-3.3-70b-versatile';
const AUDIO_MODEL = process.env.GROQ_AUDIO_MODEL || 'whisper-large-v3';

let client = null;
const getClient = () => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    const err = new Error('GROQ_API_KEY is not configured on the server. Add it to server/.env.');
    err.status = 503;
    throw err;
  }
  if (!client) client = new Groq({ apiKey });
  return client;
};

/**
 * Ask the model for a JSON object. Throws on failure rather than returning a
 * fabricated fallback — a silent fake answer is worse than a visible error in
 * anything health-related.
 */
const chatJSON = async (systemPrompt, userContent, { temperature = 0.2 } = {}) => {
  const completion = await getClient().chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ],
    model: TEXT_MODEL,
    temperature,
    response_format: { type: 'json_object' },
  });

  const raw = completion.choices[0]?.message?.content || '{}';
  try {
    return JSON.parse(raw);
  } catch {
    const err = new Error('Model returned malformed JSON');
    err.status = 502;
    throw err;
  }
};

const transcribe = async (fileStream, { language } = {}) => {
  const result = await getClient().audio.transcriptions.create({
    file: fileStream,
    model: AUDIO_MODEL,
    response_format: 'json',
    ...(language ? { language } : {}),
  });
  return result.text || '';
};

module.exports = { chatJSON, transcribe, TEXT_MODEL, AUDIO_MODEL };
