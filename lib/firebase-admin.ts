import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

const adminConfig = {
    credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
};

// Initialize Firebase Admin
export const adminApp = !getApps().length ? initializeApp(adminConfig) : getApp();

// Initialize Firestore
export const db = getFirestore(adminApp);

// Initialize Storage
export const storage = getStorage(adminApp); 