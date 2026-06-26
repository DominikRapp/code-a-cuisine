import { FirebaseApp, initializeApp } from 'firebase/app';
import { Database, getDatabase } from 'firebase/database';
import { environment } from '../../../environments/environment';

let firebaseApp: FirebaseApp | null = null;
let firebaseDatabase: Database | null = null;

/**
 * Returns the initialized Firebase app instance.
 */
export function getFirebaseApp(): FirebaseApp {
    if (!firebaseApp) {
        firebaseApp = initializeApp(environment.firebase);
    }

    return firebaseApp;
}

/**
 * Returns the initialized Firebase Realtime Database instance.
 */
export function getFirebaseDatabase(): Database {
    if (!firebaseDatabase) {
        firebaseDatabase = getDatabase(getFirebaseApp());
    }

    return firebaseDatabase;
}