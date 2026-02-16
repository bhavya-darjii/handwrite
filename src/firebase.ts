// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; 
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage"; // <--- 1. Import Storage

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

export const auth = getAuth(app); 
export const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // <--- 2. Export Storage