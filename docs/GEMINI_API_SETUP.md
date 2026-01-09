# Quick Start: Getting Your Gemini API Key

This guide will help you get a **FREE** Gemini API key in under 5 minutes.

---

## ⚡ Option 1: Google AI Studio (Recommended for MVP)

### Step 1: Visit Google AI Studio
Go to: **[https://aistudio.google.com/](https://aistudio.google.com/)**

### Step 2: Sign In
- Click **"Sign in"** with your Google account
- Any Gmail account works (personal or work)

### Step 3: Get API Key
1. Click **"Get API key"** in the top-right corner
2. Click **"Create API key"**
3. Select or create a Google Cloud project
4. Your API key will be displayed (starts with `AIza...`)
5. **Copy it immediately!**

### Step 4: Add to Your Project
```bash
cd backend
nano .env  # or open with your editor
```

Add this line:
```env
AI_PROVIDER="gemini"
GEMINI_API_KEY="AIza_your_actual_key_here"
GEMINI_MODEL="gemini-2.0-flash-exp"
```

### Step 5: Test It!
```bash
cd backend
npm install
npm run start:dev
```

Check the logs - you should see:
```
✅ Google Gemini AI initialized
```

---

## 📊 Free Tier Limits

| Metric | Free Tier | Enough For? |
|--------|-----------|-------------|
| Requests/day | 1,500 | ✅ Yes - 100+ users |
| Tokens/month | 1 million | ✅ Yes - MVP testing |
| Rate limit | 15 RPM | ✅ Yes - sufficient |
| Cost | **$0** | ✅ FREE |

**Upgrade Later**: If you exceed limits, billing starts at ~$0.50 per 1M tokens (very affordable).

---

## 🔐 Security Reminders

✅ **DO**:
- Store API key in backend `.env` only
- Add `.env` to `.gitignore`
- Use environment variables
- Rotate keys periodically

❌ **DON'T**:
- Commit API keys to GitHub
- Hardcode keys in mobile app
- Share keys publicly
- Use same key across projects

---

## 🆚 Gemini vs OpenAI Comparison

| Feature | Google Gemini 2.0 Flash | OpenAI GPT-4o-mini |
|---------|------------------------|-------------------|
| Speed | ⚡ Very Fast | ⚡ Fast |
| Cost (1M tokens) | $0.50 | $0.60 |
| Multimodal | ✅ Native (text, image, audio) | ✅ Native |
| Free Tier | ✅ 1.5M tokens/month | ⚠️ 150K tokens only |
| Context Window | 1M tokens | 128K tokens |
| **Best For** | MVP, cost-conscious | Production, established |

**Verdict**: Gemini is better for MVP due to generous free tier.

---

## 🧪 Testing Your API Key

### Backend Test (Recommended)
```bash
cd backend
npm run start:dev

# In another terminal
curl -X POST http://localhost:3000/journal/goals/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "mainGoal": "Test goal generation",
    "deadline": "2026-06-01"
  }'
```

Expected response:
```json
{
  "main_goal": "Test goal generation",
  "weekly_goals": [...],
  "daily_tasks_week1": [...]
}
```

### Direct API Test (Optional)
```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=YOUR_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "contents": [{
      "parts": [{"text": "Hello, Gemini!"}]
    }]
  }'
```

---

## ❓ Troubleshooting

### Error: "API key not valid"
- ✅ Check you copied the entire key (starts with `AIza`)
- ✅ Verify no extra spaces in `.env` file
- ✅ Restart backend: `npm run start:dev`

### Error: "Resource has been exhausted"
- ⚠️ You hit the rate limit (15 requests/minute)
- 💡 Wait 1 minute and retry
- 💡 For production, implement rate limiting in your app

### Error: "API not enabled"
- ✅ Go to [Google Cloud Console](https://console.cloud.google.com/)
- ✅ Enable "Generative Language API"
- ✅ Wait 2-3 minutes for propagation

### "Gemini not initialized" in logs
- ✅ Check `AI_PROVIDER="gemini"` in `.env`
- ✅ Verify `GEMINI_API_KEY` is set
- ✅ Run `npm install` to ensure SDK is installed

---

## 🚀 Next Steps

Once your API key is working:

1. ✅ Test goal generation endpoint
2. ✅ Test daily summary structuring
3. ✅ Test food image analysis (when ready)
4. 📖 Read [AI Integration Guide](./AI_INTEGRATION.md) for advanced usage
5. 🎯 Start building Phase 2 features!

---

## 📚 Resources

- [Gemini API Documentation](https://ai.google.dev/docs)
- [Gemini API Quickstart](https://ai.google.dev/tutorials/get_started_web)
- [Pricing Calculator](https://ai.google.dev/pricing)
- [Google AI Discord](https://discord.gg/google-ai)

---

**Estimated Setup Time**: 5 minutes  
**Cost**: $0 (free tier sufficient for MVP)  
**Difficulty**: ⭐ Easy

You're ready to power your Aether app with AI! 🎉
