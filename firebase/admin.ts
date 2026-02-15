import {initializeApp, getApps, cert} from 'firebase-admin/app';
import {getAuth} from "firebase-admin/auth";
import {getFirestore} from "firebase-admin/firestore";

const initFirebaseAdmin = () => {
    const apps = getApps();

    if(!apps.length) {
        const projectId = process.env.FIREBASE_PROJECT_ID?.replace(/^"+|"+$/g, "").trim();
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.replace(/^"+|"+$/g, "").trim();
        const privateKey = process.env.FIREBASE_PRIVATE_KEY
            ?.replace(/^"+|"+$/g, "")
            .replace(/\\n/g, "\n");

        if (!projectId || !clientEmail || !privateKey) {
            throw new Error(
                "Missing Firebase Admin env vars. Check FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY."
            );
        }

        initializeApp({
            credential: cert({
                projectId,
                clientEmail,
                privateKey,
            })
        })
    }

    return {
        auth: getAuth(),
        db: getFirestore(),
    }
}

export const { auth, db } = initFirebaseAdmin();

// firebase/admin.ts
// import { initializeApp, getApps, cert } from "firebase-admin/app";
// import { getAuth } from "firebase-admin/auth";
// import { getFirestore } from "firebase-admin/firestore";

// if (!getApps().length) {
//   initializeApp({
//     credential: cert({
//       projectId: process.env.FIREBASE_PROJECT_ID,
//       clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
//       privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
//     }),
//   });
// }

// export const auth = getAuth();
// export const db = getFirestore();
