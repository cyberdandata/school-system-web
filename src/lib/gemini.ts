import { GoogleGenAI } from '@google/genai';

// Initialize the Google Gen AI SDK or fallback to secure backend proxy
export const getGeminiClient = (userApiKey?: string) => {
  const apiKey = userApiKey || (import.meta as any).env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    // Proxy through the secure backend if no local API key is provided
    return {
      models: {
        generateContent: async (params: any) => {
          // Adjust this URL if the backend is hosted elsewhere in production
          const backendUrl = (import.meta as any).env.VITE_BACKEND_URL || 'http://localhost:3001';
          const response = await fetch(`${backendUrl}/api/ai/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params)
          });
          
          if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || 'Backend AI request failed. Ensure server is running on port 3001.');
          }
          
          const data = await response.json();
          return { text: data.text };
        }
      }
    } as any;
  }
  
  // Use direct client-side SDK if key is provided
  return new GoogleGenAI({ apiKey });
};
