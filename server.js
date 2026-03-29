const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const telegramHandler = require('./api/telegram');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS || 60000);
const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX || 5);

const requestLogByIp = new Map();

app.use(express.json({ limit: '32kb' }));
app.use(express.static(__dirname));

function telegramRateLimiter(req, res, next) {
  const now = Date.now();
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const existing = requestLogByIp.get(ip) || [];
  const recent = existing.filter((timestamp) => timestamp > windowStart);

  if (recent.length >= RATE_LIMIT_MAX) {
    res.status(429).json({
      ok: false,
      description: 'Too many requests. Please wait and try again.'
    });
    return;
  }

  recent.push(now);
  requestLogByIp.set(ip, recent);
  next();
}

setInterval(() => {
  const cutoff = Date.now() - RATE_LIMIT_WINDOW_MS;

  for (const [ip, timestamps] of requestLogByIp.entries()) {
    const recent = timestamps.filter((timestamp) => timestamp > cutoff);

    if (recent.length === 0) {
      requestLogByIp.delete(ip);
    } else {
      requestLogByIp.set(ip, recent);
    }
  }
}, RATE_LIMIT_WINDOW_MS);

app.post('/api/telegram', telegramRateLimiter, (req, res) => telegramHandler(req, res));
app.post('/api/telegram.js', telegramRateLimiter, (req, res) => telegramHandler(req, res));

app.post('*', (req, res) => {
  res.status(404).json({ ok: false, description: 'Endpoint not found. Please use /api/telegram for contact messages.' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Michael Rents server running on http://localhost:${PORT}`);
});
