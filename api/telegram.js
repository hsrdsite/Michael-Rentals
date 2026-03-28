const https = require('https');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

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

// Helper to read body from request stream
async function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch (error) {
        reject(new Error('Invalid JSON in request body'));
      }
    });
    
    req.on('error', reject);
  });
}

module.exports = async (req, res) => {
  // Set CORS headers for browser requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, description: 'Method not allowed.' });
  }

  try {
    // Parse body from request stream or use parsed body
    let body = req.body;
    
    if (!body || typeof body !== 'object') {
      body = await readBody(req);
    }

    const text = (body && body.text ? String(body.text) : '').trim();

    if (!text) {
      return res.status(400).json({ ok: false, description: 'Message text is required.' });
    }

    const telegramResponse = await sendTelegramMessage(text);

    if (telegramResponse.ok) {
      return res.status(200).json({ ok: true });
    }

    return res.status(502).json({
      ok: false,
      description: telegramResponse.description || 'Telegram API rejected the request.'
    });
  } catch (error) {
    console.error('API Error:', error.message);
    return res.status(500).json({
      ok: false,
      description: error.message || 'Server error while sending message.'
    });
  }
};
