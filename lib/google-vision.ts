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
  try {
    // Check if Google Cloud is configured
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.warn('Google Cloud Vision not configured, falling back to Tesseract.js');
      return 'Google Cloud Vision not configured. Please configure credentials to use this feature.';
    }
    
    const client = getVisionClient();
    const [result] = await client.textDetection({
      image: { content: imageBuffer },
    });
    
    const detections = result.textAnnotations;
    return detections?.[0]?.description || '';
  } catch (error) {
    console.error('Google Vision API error:', error);
    console.warn('Falling back to Tesseract.js for OCR');
    return 'Google Vision API error. Please check your credentials and try again.';
  }
}