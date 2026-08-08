const express = require('express');
const router = express.Router();
const sessionStore = require('../services/sessionStore');

// GET /api/dashboard/sessions — list recent sessions (anonymized)
router.get('/sessions', (req, res) => {
  const allSessions = sessionStore.getAllSessions();
  
  // Return anonymized session data, sorted by most recent first
  const anonymized = allSessions
    .filter(s => s.triage_result)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map(s => ({
      session_id: s.id,
      timestamp: s.created_at,
      vitals_summary: {
        heartRate: s.vitals?.heartRate || null,
        breathingRate: s.vitals?.breathingRate || null
      },
      symptom_keywords: s.symptom_keywords || [],
      urgency: s.triage_result?.urgency || null,
      confidence: s.triage_result?.confidence || null
    }));

  res.json(anonymized);
});

// GET /api/dashboard/patterns — detect outbreak patterns
router.get('/patterns', (req, res) => {
  const allSessions = sessionStore.getAllSessions();
  const windowHours = parseInt(req.query.hours) || 24;
  const cutoff = new Date(Date.now() - windowHours * 3600000);

  // Filter to recent completed sessions
  const recent = allSessions.filter(s =>
    s.triage_result && new Date(s.created_at) >= cutoff
  );

  // Count keyword occurrences
  const keywordCounts = {};
  recent.forEach(s => {
    (s.symptom_keywords || []).forEach(kw => {
      if (!keywordCounts[kw]) keywordCounts[kw] = { count: 0, sessions: [] };
      keywordCounts[kw].count++;
      keywordCounts[kw].sessions.push(s.id);
    });
  });

  // Detect keyword pairs that co-occur in 3+ sessions
  const pairCounts = {};
  recent.forEach(s => {
    const kws = s.symptom_keywords || [];
    for (let i = 0; i < kws.length; i++) {
      for (let j = i + 1; j < kws.length; j++) {
        const pair = [kws[i], kws[j]].sort().join(' + ');
        if (!pairCounts[pair]) pairCounts[pair] = { count: 0, sessions: [] };
        pairCounts[pair].count++;
        pairCounts[pair].sessions.push(s.id);
      }
    }
  });

  // Build alerts
  const alerts = [];

  // Check individual keywords
  Object.entries(keywordCounts).forEach(([keyword, data]) => {
    if (data.count >= 3) {
      alerts.push({
        keyword_cluster: [keyword],
        count: data.count,
        window: `${windowHours}h`,
        severity: data.count >= 5 ? 'alert' : 'watch'
      });
    }
  });

  // Check pairs
  Object.entries(pairCounts).forEach(([pair, data]) => {
    if (data.count >= 3) {
      alerts.push({
        keyword_cluster: pair.split(' + '),
        count: data.count,
        window: `${windowHours}h`,
        severity: data.count >= 5 ? 'alert' : 'watch'
      });
    }
  });

  // Sort by severity then count
  alerts.sort((a, b) => {
    if (a.severity === 'alert' && b.severity !== 'alert') return -1;
    if (b.severity === 'alert' && a.severity !== 'alert') return 1;
    return b.count - a.count;
  });

  // Summary stats
  const stats = {
    total_screened: recent.length,
    emergency: recent.filter(s => s.triage_result?.urgency === 'Emergency').length,
    urgent: recent.filter(s => s.triage_result?.urgency === 'Urgent').length,
    routine: recent.filter(s => s.triage_result?.urgency === 'Routine').length
  };

  res.json({ alerts, stats, window_hours: windowHours });
});

module.exports = router;
