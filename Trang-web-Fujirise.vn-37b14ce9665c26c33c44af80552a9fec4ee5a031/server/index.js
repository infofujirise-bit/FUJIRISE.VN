const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

const TELEGRAM_TOKEN = process.env.VITE_TELEGRAM_BOT_TOKEN || '';
const CHAT_ID = process.env.VITE_TELEGRAM_CHAT_ID || '';

app.post('/api/telegram', async (req, res) => {
  if (!TELEGRAM_TOKEN || !CHAT_ID) {
    return res.status(500).json({ ok: false, error: 'Telegram not configured on server.' });
  }

  const text = req.body.text || req.body.message || 'No message provided';

  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
    const result = await axios.post(url, {
      chat_id: CHAT_ID,
      text,
      parse_mode: 'HTML',
    });
    res.json({ ok: true, result: result.data });
  } catch (err) {
    console.error('Telegram proxy error:', err?.response?.data || err.message || err);
    res.status(500).json({ ok: false, error: err?.response?.data || err.message || String(err) });
  }
});

app.listen(port, () => {
  console.log(`Telegram proxy server running on http://localhost:${port}`);
});
