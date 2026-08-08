const express = require('express');
const { chatJSON } = require('../services/llm');

const router = express.Router();

const LANGUAGES = {
  en: 'English',
  hi: 'Hindi (हिन्दी)',
  bn: 'Bengali (বাংলা)',
  mr: 'Marathi (मराठी)',
  ta: 'Tamil (தமிழ்)',
  te: 'Telugu (తెలుగు)',
  es: 'Spanish (Español)',
};

const buildPrompt = (languageName) => `You explain medical paperwork to patients who have no medical training. You are given the raw text of a prescription or a hospital discharge summary, often messy from OCR.

Write EVERYTHING in ${languageName}. Keep medication names in their original Latin script (drug names must stay recognisable on the box), but explain them in ${languageName}.

RULES:
1. Explain only what is actually in the document. If something is unclear or missing, say so — never invent a dose, a duration, or a diagnosis.
2. Aim for a reading level around 8th grade. Short sentences. No jargon unless you immediately explain it.
3. Never contradict the document or suggest changing the treatment. Your job is comprehension, not second-guessing the doctor.
4. "warning_signs" must be things that mean "go back to a doctor now" — the single most useful part of a discharge summary and the part patients most often miss.
5. If the text is too garbled to interpret, set "readable" to false and explain what is missing.

Return ONLY JSON:
{
  "readable": true,
  "document_type": "prescription | discharge summary | lab requisition | unclear",
  "summary": "2-3 sentences: what this document says in plain language",
  "medications": [
    {
      "name": "drug name as written",
      "purpose": "what it is for, plain language",
      "how_to_take": "dose and timing exactly as the document states",
      "cautions": "practical warnings, or empty string"
    }
  ],
  "schedule": [
    { "time": "Morning | Afternoon | Evening | Night | As needed", "items": ["what to take then"] }
  ],
  "follow_up": ["appointments, tests or reviews the document asks for"],
  "warning_signs": ["symptoms that mean seek medical help immediately"],
  "questions_to_ask": ["good questions for the next appointment"],
  "unclear_items": ["anything in the document you could not read or interpret"]
}`;

router.post('/', async (req, res, next) => {
  try {
    const text = String(req.body?.text || '').trim();
    const language = String(req.body?.language || 'en');

    if (text.length < 15) {
      return res.status(400).json({ error: 'Provide the document text (at least 15 characters).' });
    }
    if (text.length > 20000) {
      return res.status(400).json({ error: 'Document is too long (max 20,000 characters).' });
    }

    const languageName = LANGUAGES[language] || LANGUAGES.en;
    const result = await chatJSON(buildPrompt(languageName), `DOCUMENT TEXT:\n${text}`, {
      temperature: 0.1,
    });

    res.json({ ...result, language, language_name: languageName });
  } catch (err) {
    next(err);
  }
});

router.get('/languages', (req, res) => {
  res.json(Object.entries(LANGUAGES).map(([code, name]) => ({ code, name })));
});

module.exports = router;
