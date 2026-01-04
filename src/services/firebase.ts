import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCcBrCGvSR75GC8cZlm9TrkatHhYxTnbAo",
  authDomain: "techolanka-1ec06.firebaseapp.com",
  projectId: "techolanka-1ec06",
  storageBucket: "techolanka-1ec06.firebasestorage.app",
  messagingSenderId: "284518690764",
  appId: "1:284518690764:web:aa051a41c86a6e2949f769",
  measurementId: "G-7QQJZWJRJL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

// Connect to emulators in development (optional - configure as needed)
// if (import.meta.env.DEV) {
//   connectAuthEmulator(auth, "http://localhost:9099");
//   connectFirestoreEmulator(db, 'localhost', 8080);
//   connectFunctionsEmulator(functions, "localhost", 5001);
// }

export default app;
