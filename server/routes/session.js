const express = require('express');
const router = express.Router();
const sessionStore = require('../services/sessionStore');

// POST /api/session/start
router.post('/start', (req, res) => {
  const sessionId = sessionStore.createSession();
  res.json({ session_id: sessionId });
});

// POST /api/session/:id/vitals
router.post('/:id/vitals', (req, res) => {
  const { id } = req.params;
  const vitals = req.body;
  
  if (!sessionStore.getSession(id)) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  sessionStore.updateVitals(id, vitals);
  res.json({ success: true });
});

// POST /api/session/:id/symptoms
router.post('/:id/symptoms', (req, res) => {
  const { id } = req.params;
  const { transcript, language } = req.body;
  
  if (!sessionStore.getSession(id)) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  sessionStore.updateSymptoms(id, { transcript, language });
  res.json({ success: true });
});

// GET /api/session/:id/summary
router.get('/:id/summary', (req, res) => {
  const { id } = req.params;
  const session = sessionStore.getSession(id);
  
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  res.json(session);
});

module.exports = router;
