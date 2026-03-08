# Image OCR Setup Guide

## Current Status

✅ **PDF Text Extraction** - Fully working  
❌ **Image OCR** - Requires Google Cloud Vision API setup

## Why Images Don't Work Yet

The application currently only supports **PDF files with readable text**. Image OCR requires Google Cloud Vision API which needs:

1. Google Cloud account with billing enabled
2. Vision API enabled on your project
3. Service account credentials

## Option 1: Use PDF Files (Recommended)

**Convert your images to PDF:**
- Use online tools like [ilovepdf.com](https://www.ilovepdf.com/jpg_to_pdf)
- Use Microsoft Word/Print to PDF
- Use Adobe Acrobat

**Supported PDF types:**
- ✅ PDFs with text layer (digital PDFs)
- ✅ Scanned PDFs (if Google Vision is configured)

## Option 2: Enable Google Cloud Vision API

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable billing for the project

### Step 2: Enable Vision API

1. Go to [Vision API](https://console.cloud.google.com/apis/library/vision.googleapis.com)
2. Click "Enable"

### Step 3: Create Service Account

1. Go to [Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts)
2. Click "Create Service Account"
3. Give it a name (e.g., "medical-ocr")
4. Grant role: "Cloud Vision API User"
5. Click "Create Key" → JSON
6. Download the JSON file

### Step 4: Configure Environment

1. Save the JSON file to your project root as `google-credentials.json`
2. Update `.env` file:

```env
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json
GOOGLE_CLOUD_PROJECT_ID=your-project-id
```

3. Restart the server:
```bash
npm run dev
```

### Step 5: Test Image Upload

1. Go to `/dashboard/upload`
2. Upload an image file (JPG, PNG)
3. System will use Google Vision API for OCR

## Pricing

**Google Cloud Vision API:**
- First 1,000 requests/month: **FREE**
- After that: $1.50 per 1,000 requests
- [Full pricing details](https://cloud.google.com/vision/pricing)

## Alternative: Tesseract.js (Not Working)

Tesseract.js has compatibility issues with Next.js server-side rendering. It requires browser environment which doesn't work well with API routes.

## Recommendation

**For now, use PDF files only.** They work perfectly and don't require any additional setup or costs.

If you need image support, enable Google Cloud Vision API following the steps above.
