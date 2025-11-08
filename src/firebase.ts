// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Added import for Auth
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBIsyI3aJzbCb3xWSO9_qYVr3tNOtkBGIU",
  authDomain: "handwrite-aa0b2.firebaseapp.com",
  projectId: "handwrite-aa0b2",
  storageBucket: "handwrite-aa0b2.firebasestorage.app",
  messagingSenderId: "652930823125",
  appId: "1:652930823125:web:9b47c0a09ed50cc529435c",
  measurementId: "G-PX8T5EMV2K"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); // Added Auth initialization and export
export const analytics = getAnalytics(app);
export const db = getFirestore(app);