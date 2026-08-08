const express = require('express');
const multer = require('multer');
const { toFile } = require('groq-sdk');
const { chatJSON, transcribe } = require('../services/llm');

const router = express.Router();

// Audio is held in memory and discarded as soon as it is transcribed —
// consultation recordings should never sit on disk.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

const NOTE_PROMPT = `You are a clinical scribe. You convert a transcript of a doctor-patient consultation into a structured note, and you produce a plain-language summary for the patient.

CRITICAL RULES:
1. Record ONLY what was actually said. Never add a finding, vital sign, diagnosis, dose or duration that is not in the transcript. This is the single most important rule — a fabricated detail in a medical note is a serious harm.
2. If something important is ambiguous or inaudible, put it in "uncertainties" rather than guessing. A note with honest gaps is far more useful than a smooth invention.
3. Transcripts are imperfect. Drug names and numbers are the most commonly mis-heard tokens — if one looks garbled, flag it in "uncertainties" instead of silently correcting it.
4. The clinician-facing sections use normal clinical register and abbreviations. The "patient_summary" must be plain language at roughly an 8th-grade reading level, addressed to the patient as "you".
5. Attribute nothing to the clinician that the clinician did not say.

Return ONLY JSON:
{
  "chief_complaint": "one line, in the patient's own words where possible",
  "subjective": "history as reported by the patient",
  "objective": "examination findings and measurements explicitly stated; empty string if none were stated",
  "assessment": "the clinician's stated impression; empty string if none was stated",
  "plan": "the stated plan: investigations, treatment, referrals",
  "medications_mentioned": [
    { "name": "string", "dose": "string or empty", "instructions": "string or empty" }
  ],
  "follow_up": ["stated follow-up arrangements"],
  "patient_summary": "3-5 sentences for the patient explaining what was discussed and what happens next",
  "uncertainties": ["anything unclear, inaudible, or possibly mis-transcribed"]
}`;

// POST /api/scribe/transcribe  (multipart form-data, field "audio")
router.post('/transcribe', upload.single('audio'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No audio file was uploaded.' });

    const file = await toFile(req.file.buffer, req.file.originalname || 'consult.webm');
    const text = await transcribe(file, { language: req.body?.language });

    res.json({ transcript: text, duration_bytes: req.file.size });
  } catch (err) {
    next(err);
  }
});

// POST /api/scribe/note  { transcript }
router.post('/note', async (req, res, next) => {
  try {
    const transcript = String(req.body?.transcript || '').trim();
    if (transcript.length < 20) {
      return res.status(400).json({ error: 'Transcript is too short to summarise.' });
    }
    if (transcript.length > 40000) {
      return res.status(400).json({ error: 'Transcript is too long (max 40,000 characters).' });
    }

    const note = await chatJSON(NOTE_PROMPT, `CONSULTATION TRANSCRIPT:\n${transcript}`, {
      temperature: 0.1,
    });

    res.json(note);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
