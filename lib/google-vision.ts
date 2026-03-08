import { ImageAnnotatorClient } from '@google-cloud/vision';

let visionClient: ImageAnnotatorClient | null = null;

export function getVisionClient() {
  if (!visionClient) {
    // Check if credentials are available
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && !process.env.GOOGLE_CLOUD_PROJECT_ID) {
      throw new Error('Google Cloud credentials not configured. Please set GOOGLE_APPLICATION_CREDENTIALS and GOOGLE_CLOUD_PROJECT_ID environment variables.');
    }
    
    visionClient = new ImageAnnotatorClient({
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    });
  }
  return visionClient;
}

export async function extractTextFromImage(imageBuffer: Buffer): Promise<string> {
  // For now, return a helpful message since Tesseract.js has issues in Next.js server
  // In production, you should use Google Cloud Vision API with billing enabled
  throw new Error('Image OCR requires Google Cloud Vision API to be configured with billing enabled. Please upload PDF files with text, or enable Google Cloud Vision API in your project settings.');
}