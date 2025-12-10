import * as admin from 'firebase-admin';
import { config } from '../config';

let firebaseApp: admin.app.App | null = null;

export function initializeFirebase(): admin.app.App {
  if (firebaseApp) {
    return firebaseApp;
  }

  try {
    // Check if we have a service account file path
    if (config.firebase.serviceAccountPath) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const serviceAccount = require(config.firebase.serviceAccountPath);
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: config.firebase.storageBucket,
      });
    } else if (
      config.firebase.projectId &&
      config.firebase.clientEmail &&
      config.firebase.privateKey
    ) {
      // Use environment variables
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: config.firebase.projectId,
          clientEmail: config.firebase.clientEmail,
          privateKey: config.firebase.privateKey,
        }),
        storageBucket: config.firebase.storageBucket,
      });
    } else {
      // Initialize without credentials (will use default if available)
      console.warn('Firebase credentials not fully configured. Storage features may not work.');
      firebaseApp = admin.initializeApp({
        storageBucket: config.firebase.storageBucket,
      });
    }

    console.log('✅ Firebase initialized successfully');
    return firebaseApp;
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    throw error;
  }
}

export function getFirebaseApp(): admin.app.App {
  if (!firebaseApp) {
    return initializeFirebase();
  }
  return firebaseApp;
}

export function getFirebaseStorage(): admin.storage.Storage {
  return getFirebaseApp().storage();
}

export function getFirebaseBucket() {
  return getFirebaseStorage().bucket();
}

export default {
  initializeFirebase,
  getFirebaseApp,
  getFirebaseStorage,
  getFirebaseBucket,
};
