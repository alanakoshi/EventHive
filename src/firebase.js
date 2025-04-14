// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore, serverTimestamp } from "firebase/firestore";  // Add serverTimestamp here

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBa4MFmozuNo_s_nRDiXvAlWuv4HwfxAWo",
  authDomain: "eventhive-57776.firebaseapp.com",
  projectId: "eventhive-57776",
  storageBucket: "eventhive-57776.firebasestorage.app",
  messagingSenderId: "790693737900",
  appId: "1:790693737900:web:c469ef96458518bc3c7609",
  measurementId: "G-496BXJEBC6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const db = getFirestore(app);
export const serverTimestampFn = serverTimestamp;

// Export the app instance if needed
export default app;