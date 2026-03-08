# Medical Report Analysis Platform

A real, working medical report analysis platform with AI-powered features.

## Features

✅ **Real File Upload** - Upload PDF and image medical reports
✅ **PDF Text Extraction** - Extract text from PDF reports
✅ **Image OCR** - Extract text from images using Tesseract.js (browser-based)
✅ **OCR Processing** - Extract text from scanned PDFs (requires Google Vision API)
✅ **AI Analysis** - Analyze blood test results automatically
✅ **AI Chatbot** - Ask health questions with Groq AI integration
✅ **Report Storage** - Store and retrieve uploaded reports
✅ **Health Metrics** - Track blood sugar, cholesterol, and blood pressure
✅ **Interactive Charts** - Visualize health data with Recharts
✅ **3D Body Diagnosis** - Interactive 3D model for symptom assessment

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Groq API (Required for AI chatbot and analysis)
GROQ_API_KEY=your_groq_api_key_here

# Optional: Database URL (for production)
DATABASE_URL=postgresql://user:password@localhost:5432/medical_db

# Optional: Google Cloud Vision API (for image OCR)
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json
GOOGLE_CLOUD_PROJECT_ID=your_project_id
```

### 3. Get Groq API Key (Free & Required)

1. Go to https://console.groq.com/
2. Sign up for a free account
3. Create a new API key
4. Add it to `.env.local` as `GROQ_API_KEY`

**Note:** Groq API is FREE and provides fast AI responses for chatbot and report analysis.

### 4. Run Development Server

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## How It Works

### File Upload & OCR
1. Upload medical reports (PDF/images)
2. Files are saved to `public/uploads/`
3. Tesseract.js extracts text from images
4. AI analyzes blood test parameters
5. Results are stored in memory (or database)

### AI Chatbot
- Uses OpenAI GPT-3.5-turbo for intelligent responses
- Falls back to pattern-matching if API key not configured
- Provides health information and explains medical terms

### Data Storage
- Currently uses in-memory storage (resets on server restart)
- For production: Connect to PostgreSQL/MongoDB database
- Update API routes in `app/api/` to use real database

## API Routes

- `POST /api/upload` - Upload files
- `POST /api/upload/process` - OCR and analyze reports
- `POST /api/chat` - AI chatbot responses
- `GET/POST /api/reports` - Manage medical reports
- `GET/POST /api/health-metrics` - Track health data

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19, Tailwind CSS, Radix UI
- **Charts:** Recharts
- **Animations:** Framer Motion
- **OCR:** Tesseract.js
- **AI:** OpenAI API
- **File Upload:** Native Next.js API routes

## Production Deployment

### Database Setup
Replace in-memory storage with a real database:

```typescript
// Install Prisma or your preferred ORM
npm install @prisma/client
npx prisma init

// Update API routes to use database
```

### File Storage
For production, use cloud storage:
- AWS S3
- Cloudinary
- Vercel Blob Storage

### Environment Variables
Set all required environment variables in your hosting platform.

## Limitations & Notes

- OCR accuracy depends on image quality
- AI analysis is for educational purposes only
- Not a substitute for professional medical advice
- Current implementation uses in-memory storage

## Future Enhancements

- [ ] PostgreSQL/MongoDB integration
- [ ] User authentication with NextAuth
- [ ] Cloud file storage (S3/Cloudinary)
- [ ] Advanced AI analysis with GPT-4
- [ ] Export reports as PDF
- [ ] Email notifications
- [ ] Mobile app version

## License

MIT
