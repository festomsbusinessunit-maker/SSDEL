
export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string; // base64 data URI for display
  wordCount?: number;
}

// Fix: Added GeminiResponse interface to resolve import error in ResponseDisplay.tsx.
// This type definition is based on its usage within the ResponseDisplay component.
export interface GeminiResponse {
  text: string;
  sources: Array<{
    uri: string;
    title: string;
  }>;
}