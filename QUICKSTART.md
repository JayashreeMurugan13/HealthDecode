# Quick Start Guide

## Get Your App Running in 3 Steps

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Run the App
```bash
npm run dev
```

### Step 3: Open Browser
Go to http://localhost:3000

## That's It! 🎉

The app will work immediately with:
- ✅ File uploads
- ✅ OCR text extraction
- ✅ Blood test analysis
- ✅ Report storage
- ✅ Health charts

## Optional: Enable Full AI Chatbot

For advanced AI responses, add OpenAI API key:

1. Get free API key: https://platform.openai.com/api-keys
2. Create `.env.local` file:
```
OPENAI_API_KEY=sk-your-key-here
```
3. Restart server

**Without API key:** Chatbot uses pattern-matching (still works!)
**With API key:** Chatbot uses GPT-3.5 (smarter responses)

## Test the Features

### Upload a Medical Report
1. Go to Dashboard → Upload
2. Drag & drop a blood test report (PDF or image)
3. Watch it process and analyze automatically

### Chat with AI
1. Go to Dashboard → Chatbot
2. Ask: "What does high cholesterol mean?"
3. Get instant health information

### View Reports
1. Go to Dashboard → Reports
2. See all uploaded reports
3. Filter by status

## Troubleshooting

**Port already in use?**
```bash
npm run dev -- -p 3001
```

**Dependencies not installing?**
```bash
rm -rf node_modules package-lock.json
npm install
```

**OCR not working?**
- Make sure image quality is good
- Try PDF format instead
- Check console for errors

## Need Help?

Check the main README.md for detailed documentation.
