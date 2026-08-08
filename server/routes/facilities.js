const express = require('express');
const router = express.Router();
const facilities = require('../data/facilities.json');

// GET /api/facilities?tier=Emergency
router.get('/', (req, res) => {
  const { tier } = req.query;
  
  if (!tier) {
    return res.json(facilities);
  }

  // Filter facilities that accept the given triage tier
  const filtered = facilities.filter(f => 
    f.accepted_tiers.some(t => t.toLowerCase() === tier.toLowerCase())
  );
  
  // Sort by distance
  filtered.sort((a, b) => a.distance_miles - b.distance_miles);
  
  res.json(filtered.slice(0, 3)); // Return top 3 nearest
});

module.exports = router;
