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
    // Check if Google Cloud Vision is configured
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS && process.env.GOOGLE_CLOUD_PROJECT_ID) {
      try {
        const client = getVisionClient();
        const [result] = await client.textDetection({
          image: { content: imageBuffer },
        });
        const detections = result.textAnnotations;
        const text = detections?.[0]?.description || '';
        if (text && text.length > 20) {
          return text;
        }
      } catch (visionError) {
        console.error('Google Vision API error:', visionError);
      }
    }
    
    // Fallback to Tesseract.js
    const Tesseract = await import('tesseract.js');
    const worker = await Tesseract.createWorker('eng');
    const { data: { text } } = await worker.recognize(imageBuffer);
    await worker.terminate();
    return text;
  } catch (error) {
    console.error('OCR error:', error);
    throw new Error('Failed to extract text from image');
  }
}