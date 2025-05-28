import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';

if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
    throw new Error('Missing Firebase configuration. Please check your environment variables.');
}

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
export const clientApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(clientApp);
export const clientDb = getFirestore(clientApp);

// Initialize Analytics with error handling
let analyticsInstance: Analytics | null = null;

export const initializeAnalytics = async (): Promise<Analytics | null> => {
    if (typeof window === 'undefined') return null;

    try {
        const isAnalyticsSupported = await isSupported();
        if (!isAnalyticsSupported) {
            console.warn('Firebase Analytics is not supported in this environment');
            return null;
        }

        if (!analyticsInstance) {
            analyticsInstance = getAnalytics(clientApp);
        }
        return analyticsInstance;
    } catch (error) {
        console.error('Error initializing Firebase Analytics:', error);
        return null;
    }
};

// Export a promise that resolves to the analytics instance
export const analytics = initializeAnalytics(); 