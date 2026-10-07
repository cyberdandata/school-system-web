import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { GoogleGenAI, Type } from '@google/genai';

admin.initializeApp();
const db = admin.firestore();

// Helper to initialize Gemini API
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new functions.https.HttpsError('failed-precondition', 'GEMINI_API_KEY is not set in environment.');
  }
  return new GoogleGenAI({ apiKey });
}

export const generateComment = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in to use AI.');
  }

  const { studentName, subjectMarks, average, overallGrade, role, classLevel, tone } = data;
  const ai = getGenAI();

  const subjectsStr = Object.entries(subjectMarks || {})
    .map(([sub, mark]) => `${sub}: ${mark}/100`)
    .join(', ');

  const roleLabel = role === 'head' ? 'Head Teacher' : 'Class Teacher';
  let toneDirective = 'Be encouraging but honest.';
  if (tone === 'supportive') {
    toneDirective = 'Focus heavily on the student\'s positive strengths, writing in a warm, highly encouraging, and motivational tone.';
  } else if (tone === 'remedial') {
    toneDirective = 'Focus on constructive, action-oriented growth, offering practical advice for the student to address weak subject areas.';
  } else if (tone === 'balanced') {
    toneDirective = 'Provide a highly balanced and objective report card assessment, weighing strengths equally against growth areas.';
  }

  const systemInstruction = `You are a professional ${roleLabel} in a Ugandan school following UNEB grading standards.
Your role is to write a highly professional, constructive, and realistic assessment comment (2 sentences max) for a student's report card.
${toneDirective} Do NOT use flowery language or cliché AI phrases. Do not use markdown. Speak directly about the student.`;

  const prompt = `Student Name: ${studentName}
Class Level: ${classLevel || 'Primary'}
Academic Performance:
- Subject Marks: ${subjectsStr || 'None recorded yet'}
- Term Average: ${average}%
- Overall Assessment Grade: ${overallGrade}

Please generate a professional, highly specific, and personalized report card assessment comment (max 2 sentences) for this student from the perspective of the ${roleLabel}.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });
    return { comment: response.text?.trim() || 'Shows consistent progress. Encouraged to maintain focus next term.' };
  } catch (err: any) {
    console.error('AI Generation Error:', err);
    throw new functions.https.HttpsError('internal', err.message || 'Failed to generate AI comment.');
  }
});

export const generateP7Pathway = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in to use AI.');
  }

  const { studentName, subjectMarks, aggregate, division } = data;
  const ai = getGenAI();

  const subjectsStr = Object.entries(subjectMarks || {})
    .map(([sub, mark]) => `${sub}: ${mark}/100`)
    .join(', ');

  const systemInstruction = `You are an expert academic advisor specializing in Ugandan UNEB Primary Leaving Examination (PLE) prep.
You will write a concise, encouraging, and highly actionable predictive advice tip (max 2 sentences, 40 words) advising a P7 candidate on how to secure or improve their PLE division based on their current aggregates and subject grades.
Speak directly to the student. Do not use markdown or emojis.`;

  const prompt = `Student Name: ${studentName}
Current P7 Term Performance:
- Best 4 Core Marks: ${subjectsStr}
- Calculated PLE Aggregate Score: ${aggregate} points
- Calculated Division: ${division}

Provide a short 1-2 sentence target coaching advice for this P7 student to secure or improve their UNEB grade division.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });
    return { advice: response.text?.trim() || 'Focus on revision of weak areas in compulsory subjects to secure your division.' };
  } catch (err: any) {
    console.error('AI Pathway Error:', err);
    throw new functions.https.HttpsError('internal', err.message || 'Failed to generate AI advice.');
  }
});

// Note: For full real-time database modifications, the client app can send current state and mutations back. 
// Alternatively, we let the client handle tools by returning function calls to the client.
export const generateChatReply = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in to use AI.');
  }

  const { messages, appData, currentDateTime } = data;
  const ai = getGenAI();

  const systemInstruction = `You are "OTEC Edu-AI Assistant", an elite educational consultant and school operations AI companion.
You have direct, real-time access to the entire live school database and the authority to perform CRUD operations on learners, financial transactions, and student academic marks through the provided tool functions.

Current Date/Time Context: ${currentDateTime || new Date().toLocaleString()}

GUIDELINES:
1. Always base your answers on the school data provided in the JSON payload context.
2. If asked to add/record/create/enroll, update/edit/modify, or delete/deregister any student, financial transaction, or academic grade, output a clear JSON function call object instead of executing it here, so the frontend can execute it directly on Firestore. Wait, in this backend, we will execute the function locally and return the mutated appData to the client.
3. Keep answers friendly, highly professional, structured, and extremely helpful. You can use markdown bullet points for layout.`;

  const schoolContext = `School Database Context JSON:
- Total registered students count: ${appData?.learners?.length || 0}
- Exam sets recorded: ${appData?.examSets?.length || 0}
- Registered Learners Register: ${JSON.stringify(appData?.learners || [])}
- Raw Academic Scores Table: ${JSON.stringify(appData?.scores || [])}
- Raw Ledger Transactions Table: ${JSON.stringify(appData?.finances || [])}`;

  const contents: any[] = [
    {
      role: 'user',
      parts: [{ text: `Here is the current school database for your reference:\n\n${schoolContext}\n\nPlease help answer subsequent queries using this.` }]
    },
    {
      role: 'model',
      parts: [{ text: 'Understood. I have loaded the school database and am ready to answer your queries.' }]
    }
  ];

  if (Array.isArray(messages)) {
    messages.forEach((msg: any) => {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      });
    });
  }

  // To reduce complexity in migration, we use the same schema as server.ts but return function calls to the frontend, 
  // or just run it here. We'll run it here for parity.
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.4,
        tools: [{ googleSearch: {} }]
      }
    });

    return { 
      reply: response.text?.trim() || 'I am here to assist with school records and database lookups.',
      updatedData: null // In a full implementation, we'd add tools and execute them here.
    };
  } catch (err: any) {
    console.error('Chatbot Error:', err);
    throw new functions.https.HttpsError('internal', err.message || 'Failed to process chat response.');
  }
});

export const generateAppraisalFeedback = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in to use AI.');
  }

  const { staffName, role, department, score, maxScore } = data;
  const ai = getGenAI();

  const systemInstruction = `You are an expert HR Performance Assessor in an educational institution.
You are writing a concise, professional performance appraisal report for a staff member based on their numerical score and their specific department/role.
Your response MUST be a JSON object with two fields:
1. "comments": A 2-3 sentence performance summary focusing on the specific areas/words relevant to their department (e.g., if they are in "Mathematics", mention analytical skills and student engagement; if "Cleaning", mention hygiene standards and diligence).
2. "recommendations": A 1-2 sentence recommended action or course for improvement based on their score.`;

  const prompt = `Staff Name: ${staffName}
Role: ${role}
Department/Specialization: ${department || 'General'}
Performance Score: ${score} out of ${maxScore || 100}

Please generate the appraisal JSON object.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
        responseMimeType: "application/json",
      }
    });
    
    let result = response.text?.trim() || '{}';
    if (result.startsWith('\`\`\`json')) {
      result = result.replace(/^\`\`\`json\n/, '').replace(/\n\`\`\`$/, '');
    }
    
    return JSON.parse(result);
  } catch (err: any) {
    console.error('AI Appraisal Error:', err);
    throw new functions.https.HttpsError('internal', err.message || 'Failed to generate AI appraisal.');
  }
});
