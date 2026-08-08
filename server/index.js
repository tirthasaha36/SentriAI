const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/session', require('./routes/session'));
app.use('/api/session', require('./routes/triage'));
app.use('/api/facilities', require('./routes/facilities'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Sentri API is running' });
});

// Seed demo sessions for outbreak dashboard
const sessionStore = require('./services/sessionStore');
sessionStore.seedDemoSessions();

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
