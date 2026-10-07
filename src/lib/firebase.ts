import { initializeApp, getApps, getApp, setLogLevel } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';

// Parse or load config safely
const firebaseConfig = {
  apiKey: "AIzaSyBikyo1iWmCZfcJO_PoeBPXiXw6GEtzZBU",
  authDomain: "school-management-system-50707.firebaseapp.com",
  projectId: "school-management-system-50707",
  storageBucket: "school-management-system-50707.firebasestorage.app",
  messagingSenderId: "725162707447",
  appId: "1:725162707447:web:e664de15c27755cdecc6f2",
  measurementId: "G-D66H7SRBF6"
};

// Set silent log level to suppress harmless offline/reconnect connection warnings
try {
  setLogLevel('silent');
} catch (e) {
  // ignore
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

import { enableIndexedDbPersistence } from 'firebase/firestore';

// Initialize Firestore with offline caching
let firestoreDb;
try {
  firestoreDb = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true
  });
  enableIndexedDbPersistence(firestoreDb).catch((err) => {
    if (err.code == 'failed-precondition') {
      console.warn('Multiple tabs open, offline persistence can only be enabled in one tab at a time.');
    } else if (err.code == 'unimplemented') {
      console.warn('The current browser does not support all of the features required to enable offline persistence.');
    }
  });
} catch (e) {
  firestoreDb = getFirestore(app);
}

export const db = firestoreDb;

export default app;

