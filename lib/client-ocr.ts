// Client-side OCR using Tesseract.js
import Tesseract from 'tesseract.js';

export async function extractTextFromImageClient(file: File): Promise<string> {
  try {
    console.log('Starting client-side OCR...');
    
    const worker = await Tesseract.createWorker('eng', 1, {
      logger: (m) => console.log('OCR Progress:', m),
    });
    
    const { data: { text } } = await worker.recognize(file);
    await worker.terminate();
    
    console.log('OCR completed, text length:', text.length);
    return text;
  } catch (error) {
    console.error('Client OCR error:', error);
    throw new Error('Failed to extract text from image');
  }
}
