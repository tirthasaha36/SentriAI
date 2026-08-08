const express = require('express');
const { chatJSON } = require('../services/llm');
const { analyseTrends } = require('../services/labMath');

const router = express.Router();

const PARSE_PROMPT = `You extract structured data from laboratory report text. You are a parser, not an interpreter.

RULES:
1. Extract ONLY values actually present in the text. Never estimate, complete or infer a missing value.
2. Copy units exactly as printed (mg/dL, mmol/L, g/dL, %, etc).
3. Reference ranges are usually printed beside the result, like "70 - 110" or "< 200" or "up to 5.7".
   - "70 - 110" -> ref_low 70, ref_high 110
   - "< 200" -> ref_low null, ref_high 200
   - "> 40" -> ref_low 40, ref_high null
   If no range is printed, use null for both.
4. Use the full printed test name (e.g. "Fasting Blood Glucose", "HbA1c", "LDL Cholesterol").
5. value, ref_low and ref_high must be plain numbers, not strings. Skip any test whose result is not numeric (e.g. "Negative", "Nil").
6. If the text contains a collection or report date, return it as report_date in YYYY-MM-DD form, else null.

Return ONLY JSON:
{
  "report_date": "YYYY-MM-DD or null",
  "lab_name": "string or null",
  "markers": [
    { "name": "string", "value": 0, "unit": "string", "ref_low": 0, "ref_high": 0 }
  ]
}`;

const NARRATIVE_PROMPT = `You explain laboratory trends to a patient with no medical training.

You are given ALREADY-COMPUTED trend statistics. The arithmetic is done and is not yours to redo or dispute — do not recalculate, contradict or second-guess any number given to you.

RULES:
1. Explain what the numbers mean in plain language, around an 8th-grade reading level.
2. A value inside its reference range that is moving steadily toward a bound is worth mentioning — that early warning is the whole point of looking at trends instead of one report.
3. Never diagnose. Never suggest starting, stopping or changing treatment. Point to a conversation with a doctor.
4. Do not alarm unnecessarily. A single out-of-range value is common and often means nothing on its own; say so where relevant.

Return ONLY JSON:
{
  "headline": "one sentence covering the most important thing across all markers",
  "notes": [
    { "marker": "name as given", "meaning": "what this marker measures, one short sentence", "reading": "what this person's trend shows, plain language" }
  ],
  "discuss_with_doctor": ["specific things worth raising at the next appointment"]
}`;

// POST /api/labs/parse  { text, report_date }
router.post('/parse', async (req, res, next) => {
  try {
    const text = String(req.body?.text || '').trim();
    if (text.length < 10) return res.status(400).json({ error: 'Provide the lab report text.' });
    if (text.length > 20000) return res.status(400).json({ error: 'Report is too long (max 20,000 characters).' });

    const parsed = await chatJSON(PARSE_PROMPT, `LAB REPORT TEXT:\n${text}`, { temperature: 0 });

    const markers = (parsed.markers || []).filter(
      (m) => m && typeof m.value === 'number' && String(m.name || '').trim()
    );

    res.json({
      report_date: req.body?.report_date || parsed.report_date || null,
      lab_name: parsed.lab_name || null,
      markers,
      skipped: (parsed.markers || []).length - markers.length,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/labs/trends  { reports: [{ date, markers: [...] }] }
router.post('/trends', async (req, res, next) => {
  try {
    const reports = Array.isArray(req.body?.reports) ? req.body.reports : [];
    if (!reports.length) return res.status(400).json({ error: 'Provide a "reports" array.' });

    // Arithmetic first, and it stands on its own.
    const trends = analyseTrends(reports);
    if (!trends.length) {
      return res.json({ trends: [], narrative: null, note: 'No numeric markers found across these reports.' });
    }

    // The narrative is decoration on top of numbers that are already final.
    let narrative = null;
    try {
      const summary = trends
        .map((t) => {
          const range = t.ref_low !== null || t.ref_high !== null ? `ref ${t.ref_low ?? '—'}–${t.ref_high ?? '—'}` : 'no reference range';
          const drift = t.drift ? `, trending ${t.drift.toward} in about ${t.drift.days_to_cross} days if unchanged` : '';
          return `- ${t.name}: latest ${t.latest_value} ${t.unit} (${range}), status ${t.status}, ${t.direction} (${t.percent_change}% over ${t.span_days} days, ${t.readings.length} readings)${drift}`;
        })
        .join('\n');
      narrative = await chatJSON(NARRATIVE_PROMPT, `COMPUTED TRENDS:\n${summary}`);
    } catch (err) {
      // Numbers are the product here; losing the prose is survivable.
      console.error('Narrative generation failed:', err.message);
    }

    res.json({ trends, narrative });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
