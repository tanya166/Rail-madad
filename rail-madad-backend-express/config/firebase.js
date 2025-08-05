import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

try {
    const serviceAccountKey = JSON.parse(process.env.SERVICE_ACCOUNT_KEY);

    if (serviceAccountKey.private_key.includes('\\n')) {
        serviceAccountKey.private_key = serviceAccountKey.private_key.replace(/\\n/g, '\n');
    }

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccountKey),
        storageBucket: process.env.GCS_BUCKET_NAME
    });

    console.log('Firebase Admin SDK initialized successfully');
} catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
    process.exit(1);
}

const db = admin.firestore();

export { db };         
export default admin;
