# Vercel Deployment Setup

## Structure
Your project is now configured for Vercel:
- **Static files**: Root directory (`index.html`, `js/`, `css/`, `images/`, etc.)
- **Serverless API**: `/api/telegram.js` → endpoint at `/api/telegram`

## Environment Variables Setup on Vercel

1. **Go to Vercel dashboard** → Select your project → Settings → Environment Variables
2. **Add these variables**:
   - `TELEGRAM_BOT_TOKEN` = your bot token from BotFather
   - `TELEGRAM_CHAT_ID` = your chat ID (e.g., 854113551)

3. **Click "Save"** and redeploy your project

## Deployment Steps

1. **Push to GitHub** (if using git):
   ```bash
   git add .
   git commit -m "Convert to Vercel serverless functions"
   git push origin main
   ```

2. **Vercel auto-deploys** when you push to main branch (if connected to GitHub)

3. **Or manually deploy** using Vercel CLI:
   ```bash
   npm install -g vercel
   vercel
   ```

## Local Testing (Before Push)

To test locally before pushing to production:
```bash
npm install
npm start
```
- Server runs on `http://localhost:3000`
- Uses local `.env` file for credentials
- Includes rate limiting (5 requests per 60 seconds per IP)

## Production (`Vercel`)

- No rate limiting per IP (serverless functions are stateless)
- Telegram credentials secure (in Vercel Environment Variables, not in code)
- Both Contact Form and Rental Application work through `/api/telegram` endpoint
- Static files served from Vercel CDN (fast)

## Troubleshooting

**Forms show "unexpected token" error:**
- ✅ Env variables set in Vercel dashboard?
- ✅ Deployment redeployed after env var changes?
- ✅ Check Vercel logs: Dashboard → Function Logs

**Bot not receiving messages:**
- Verify `TELEGRAM_BOT_TOKEN` is correct
- Verify `TELEGRAM_CHAT_ID` is correct
- Check Vercel Function Logs for errors
