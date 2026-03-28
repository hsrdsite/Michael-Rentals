const express = require('express');
const path = require('path');
const https = require('https');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
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

function sendTelegramMessage(text) {
  return new Promise((resolve, reject) => {
    if (!BOT_TOKEN || !CHAT_ID) {
      reject(new Error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID in environment.'));
      return;
    }

    const payload = JSON.stringify({
      chat_id: CHAT_ID,
      text
    });

    const options = {
      hostname: 'api.telegram.org',
      path: `/bot${BOT_TOKEN}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = https.request(options, (res) => {
      let responseBody = '';

      res.on('data', (chunk) => {
        responseBody += chunk;
      });

      res.on('end', () => {
        try {
          const data = JSON.parse(responseBody || '{}');
          resolve(data);
        } catch (error) {
          reject(new Error('Invalid Telegram API response.'));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(payload);
    req.end();
  });
}

app.post('/api/telegram', telegramRateLimiter, async (req, res) => {
  try {
    const text = (req.body && req.body.text ? String(req.body.text) : '').trim();

    if (!text) {
      res.status(400).json({ ok: false, description: 'Message text is required.' });
      return;
    }

    const telegramResponse = await sendTelegramMessage(text);

    if (telegramResponse.ok) {
      res.json({ ok: true });
      return;
    }

    res.status(502).json({
      ok: false,
      description: telegramResponse.description || 'Telegram API rejected the request.'
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      description: error.message || 'Server error while sending message.'
    });
  }
});

app.post('*', (req, res) => {
  res.status(404).json({ ok: false, description: 'Endpoint not found. Please use /api/telegram for contact messages.' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Home On Demand server running on http://localhost:${PORT}`);
});
