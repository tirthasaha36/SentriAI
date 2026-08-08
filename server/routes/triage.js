const express = require('express');
const router = express.Router();
const sessionStore = require('../services/sessionStore');
const { triagePatient, triagePreliminary } = require('../services/llm');

// POST /api/session/:id/triage/preliminary — vitals-only pre-assessment
router.post('/:id/triage/preliminary', async (req, res) => {
  const { id } = req.params;
  const session = sessionStore.getSession(id);
  
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  try {
    const result = await triagePreliminary(session);
    sessionStore.updatePreliminaryResult(id, result);
    res.json(result);
  } catch (error) {
    console.error('Preliminary triage error:', error);
    res.status(500).json({ error: 'Failed to generate preliminary triage' });
  }
});

// POST /api/session/:id/triage — full triage (vitals + symptoms)
router.post('/:id/triage', async (req, res) => {
  const { id } = req.params;
  const session = sessionStore.getSession(id);
  
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  if (req.body.followup_answer) {
    sessionStore.addFollowUpAnswer(id, req.body.followup_answer);
  }

  try {
    const result = await triagePatient(session);
    sessionStore.updateTriageResult(id, result);
    res.json(result);
  } catch (error) {
    console.error('Triage error:', error);
    res.status(500).json({ error: 'Failed to generate triage result' });
  }
});

module.exports = router;
