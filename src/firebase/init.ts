import { initializeApp, applicationDefault, getApps } from 'firebase-admin/app';
import dotenv from 'dotenv';

//
import { handleError } from '../utils';
//
dotenv.config();

export default function init() {
  try {
    const initializedApps = getApps();
    const isInitialized = initializedApps.length > 0;

    // console.log({ initializedApps, isInitialized });

    if (!isInitialized) {
      const projectId = process.env.APP_FIREBASE_PROJECT_ID;
      console.log('initializing firebase app...', projectId);

      initializeApp({
        credential: applicationDefault(),
        projectId,
      });
    }
  } catch (err: unknown) {
    handleError(err, 'Error initializing firebase');
  }
}
