const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { TEXT_MODEL, AUDIO_MODEL } = require('./services/llm');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.use('/api/medicines', require('./routes/medicines'));
app.use('/api/decode', require('./routes/decode'));
app.use('/api/labs', require('./routes/labs'));
app.use('/api/scribe', require('./routes/scribe'));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Sentri API',
    text_model: TEXT_MODEL,
    audio_model: AUDIO_MODEL,
    groq_key_configured: Boolean(process.env.GROQ_API_KEY),
  });
});

// Central error handler — surface real failures instead of faking a result.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(`[${req.method} ${req.path}]`, err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Sentri API running on http://localhost:${PORT}`);
    if (!process.env.GROQ_API_KEY) {
      console.warn('WARNING: GROQ_API_KEY is not set — AI endpoints will return 503.');
    }
  });
}

module.exports = app;
