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
    // Use Tesseract.js for OCR (works without API keys)
    const Tesseract = await import('tesseract.js');
    const { data: { text } } = await Tesseract.recognize(imageBuffer, 'eng', {
      logger: m => console.log(m)
    });
    return text;
  } catch (error) {
    console.error('Tesseract OCR error:', error);
    
    // Try Google Vision as fallback if configured
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      try {
        const client = getVisionClient();
        const [result] = await client.textDetection({
          image: { content: imageBuffer },
        });
        const detections = result.textAnnotations;
        return detections?.[0]?.description || '';
      } catch (visionError) {
        console.error('Google Vision API error:', visionError);
      }
    }
    
    throw new Error('Failed to extract text from image');
  }
}