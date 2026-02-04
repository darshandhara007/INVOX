import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyA7QqvxyRA6axURnLfVJflVHM6RS1MT_G4",
    authDomain: "invox-69d08.firebaseapp.com",
    projectId: "invox-69d08",
    storageBucket: "invox-69d08.firebasestorage.app",
    messagingSenderId: "350666036698",
    appId: "1:350666036698:web:0ca9cc3ac27c0325ffdce3",
    measurementId: "G-DSEC9KEV2F"
};

const app = !getApps.length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);


// import { initializeApp, getApp, getApps } from "firebase/app";
// import { getAuth } from "firebase/auth";
// import { getFirestore } from "firebase/firestore";

// const firebaseConfig = {
//   apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
//   authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
//   storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
// };

// const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// export const auth = getAuth(app);
// export const db = getFirestore(app);
