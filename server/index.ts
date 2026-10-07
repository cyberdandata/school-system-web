import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { db, auth } from './firebaseAdmin';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// Basic CORS middleware just in case (though Vite proxy handles it locally)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
    return res.status(200).json({});
  }
  next();
});

// ==========================================
// API ROUTES
// ==========================================

// 1. Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    message: 'OTEC Edu-AI Backend is running smoothly.',
    firebaseConnected: !!db
  });
});

// 2. System Stats
app.get('/api/system/stats', async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database connection unavailable' });
    }
    
    // Fetch some basic stats from Firestore (assuming collections exist or handle gracefully)
    const [studentsSnapshot, teachersSnapshot] = await Promise.all([
      db.collection('students').count().get().catch(() => ({ data: () => ({ count: 0 }) })),
      db.collection('teachers').count().get().catch(() => ({ data: () => ({ count: 0 }) }))
    ]);

    res.json({
      activeStudents: studentsSnapshot.data().count || 0,
      activeTeachers: teachersSnapshot.data().count || 0,
      systemStatus: 'Optimal',
      backendActive: true
    });
  } catch (error) {
    console.error('Stats Error:', error);
    res.status(500).json({ error: 'Failed to fetch system stats' });
  }
});

// 3. AI Analysis Endpoint (Secure Server-Side Gemini)
app.post('/api/ai/analyze', async (req, res) => {
  try {
    const { model, contents, config } = req.body;
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Pass the payload directly to the Gemini SDK
    const response = await ai.models.generateContent({
      model: model || 'gemini-2.5-flash',
      contents: contents,
      config: config
    });
    
    res.json({
      success: true,
      text: response.text
    });
  } catch (error: any) {
    console.error('AI Proxy Error:', error);
    res.status(500).json({ error: 'Failed to process AI request', details: error.message });
  }
});


import { fileURLToPath } from 'url';

// ==========================================
// SERVE FRONTEND (For Production / Railway)
// ==========================================
// In production, serve the built Vite frontend from the 'dist' directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// Fallback for React Router (Single Page Application)
// Any route not caught by the API will serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// ==========================================
// START SERVER
// ==========================================
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 OTEC Edu-AI Backend Server running on port ${PORT}`);
  console.log(`======================================================\n`);
});
