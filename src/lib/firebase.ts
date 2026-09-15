import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocs, 
  getDoc,
  writeBatch,
  Firestore 
} from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';
import { Property, Client, Appointment, Marketer, UserAccount } from '../types';
import { 
  INITIAL_PROPERTIES, 
  INITIAL_CLIENTS, 
  INITIAL_APPOINTMENTS, 
  INITIAL_MARKETERS, 
  INITIAL_USERS 
} from '../data/initialData';

// Initialize Firebase App
const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId,
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Auth instance
export const auth = getAuth(app);

// Use specific firestore database ID if specified in config
const databaseId = firebaseConfigJson.firestoreDatabaseId && firebaseConfigJson.firestoreDatabaseId !== '(default)'
  ? firebaseConfigJson.firestoreDatabaseId
  : undefined;

export const db: Firestore = databaseId 
  ? getFirestore(app, databaseId) 
  : getFirestore(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo: auth?.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const COLLECTIONS = {
  PROPERTIES: 'properties',
  CLIENTS: 'clients',
  APPOINTMENTS: 'appointments',
  MARKETERS: 'marketers',
  USERS: 'users',
} as const;

/**
 * Helper to strip undefined values so Firestore doesn't throw errors
 */
export function sanitizeForFirestore<T extends Record<string, any>>(data: T): Record<string, any> {
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        clean[key] = sanitizeForFirestore(value);
      } else {
        clean[key] = value;
      }
    }
  }
  return clean;
}

/**
 * Seed initial data if the Firestore collection is empty
 */
export async function seedInitialDataIfEmpty() {
  try {
    // Check if the system has already been initialized previously
    const configDocRef = doc(db, 'system', 'app_config');
    const configSnap = await getDoc(configDocRef);
    if (configSnap.exists() && configSnap.data()?.seeded) {
      // System was already initialized; respect user deletions/changes and do not reseed
      return;
    }

    // 1. Properties
    const propSnap = await getDocs(collection(db, COLLECTIONS.PROPERTIES));
    if (propSnap.empty && INITIAL_PROPERTIES.length > 0) {
      const batch = writeBatch(db);
      INITIAL_PROPERTIES.forEach(item => {
        const ref = doc(db, COLLECTIONS.PROPERTIES, item.id);
        batch.set(ref, sanitizeForFirestore(item));
      });
      await batch.commit();
      console.log('Seeded properties to Firestore');
    }

    // 2. Clients
    const clientSnap = await getDocs(collection(db, COLLECTIONS.CLIENTS));
    if (clientSnap.empty && INITIAL_CLIENTS.length > 0) {
      const batch = writeBatch(db);
      INITIAL_CLIENTS.forEach(item => {
        const ref = doc(db, COLLECTIONS.CLIENTS, item.id);
        batch.set(ref, sanitizeForFirestore(item));
      });
      await batch.commit();
      console.log('Seeded clients to Firestore');
    }

    // 3. Marketers
    const marketerSnap = await getDocs(collection(db, COLLECTIONS.MARKETERS));
    if (marketerSnap.empty && INITIAL_MARKETERS.length > 0) {
      const batch = writeBatch(db);
      INITIAL_MARKETERS.forEach(item => {
        const ref = doc(db, COLLECTIONS.MARKETERS, item.id);
        batch.set(ref, sanitizeForFirestore(item));
      });
      await batch.commit();
      console.log('Seeded marketers to Firestore');
    }

    // 4. Appointments
    const apptSnap = await getDocs(collection(db, COLLECTIONS.APPOINTMENTS));
    if (apptSnap.empty && INITIAL_APPOINTMENTS.length > 0) {
      const batch = writeBatch(db);
      INITIAL_APPOINTMENTS.forEach(item => {
        const ref = doc(db, COLLECTIONS.APPOINTMENTS, item.id);
        batch.set(ref, sanitizeForFirestore(item));
      });
      await batch.commit();
      console.log('Seeded appointments to Firestore');
    }

    // 5. Users
    const userSnap = await getDocs(collection(db, COLLECTIONS.USERS));
    if (userSnap.empty && INITIAL_USERS.length > 0) {
      const batch = writeBatch(db);
      INITIAL_USERS.forEach(item => {
        const ref = doc(db, COLLECTIONS.USERS, item.id);
        batch.set(ref, sanitizeForFirestore(item));
      });
      await batch.commit();
      console.log('Seeded users to Firestore');
    }

    // Mark system as initialized
    await setDoc(configDocRef, { seeded: true, initializedAt: new Date().toISOString() }, { merge: true });
  } catch (error) {
    console.warn('Could not complete Firestore initial seeding (fallback to local state):', error);
  }
}

// Real-time subscribe helpers
export function subscribeToCollection<T>(
  collectionName: string,
  onData: (data: T[]) => void,
  onError?: (error: any) => void
) {
  const colRef = collection(db, collectionName);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as T[];
      onData(items);
    },
    (err) => {
      if (onError) onError(err);
      try {
        handleFirestoreError(err, OperationType.LIST, collectionName);
      } catch (formattedErr) {
        // Formatted context logged and captured
      }
    }
  );
}

// Cloud persistence CRUD operations
export async function savePropertyToCloud(property: Property): Promise<void> {
  try {
    const ref = doc(db, COLLECTIONS.PROPERTIES, property.id);
    await setDoc(ref, sanitizeForFirestore(property), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTIONS.PROPERTIES}/${property.id}`);
  }
}

export async function deletePropertyFromCloud(propertyId: string): Promise<void> {
  try {
    const ref = doc(db, COLLECTIONS.PROPERTIES, propertyId);
    await deleteDoc(ref);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTIONS.PROPERTIES}/${propertyId}`);
  }
}

export async function saveClientToCloud(client: Client): Promise<void> {
  try {
    const ref = doc(db, COLLECTIONS.CLIENTS, client.id);
    await setDoc(ref, sanitizeForFirestore(client), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTIONS.CLIENTS}/${client.id}`);
  }
}

export async function deleteClientFromCloud(clientId: string): Promise<void> {
  try {
    const ref = doc(db, COLLECTIONS.CLIENTS, clientId);
    await deleteDoc(ref);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTIONS.CLIENTS}/${clientId}`);
  }
}

export async function saveAppointmentToCloud(appointment: Appointment): Promise<void> {
  try {
    const ref = doc(db, COLLECTIONS.APPOINTMENTS, appointment.id);
    await setDoc(ref, sanitizeForFirestore(appointment), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTIONS.APPOINTMENTS}/${appointment.id}`);
  }
}

export async function deleteAppointmentFromCloud(appointmentId: string): Promise<void> {
  try {
    const ref = doc(db, COLLECTIONS.APPOINTMENTS, appointmentId);
    await deleteDoc(ref);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTIONS.APPOINTMENTS}/${appointmentId}`);
  }
}

export async function saveMarketerToCloud(marketer: Marketer): Promise<void> {
  try {
    const ref = doc(db, COLLECTIONS.MARKETERS, marketer.id);
    await setDoc(ref, sanitizeForFirestore(marketer), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTIONS.MARKETERS}/${marketer.id}`);
  }
}

export async function deleteMarketerFromCloud(marketerId: string): Promise<void> {
  try {
    const ref = doc(db, COLLECTIONS.MARKETERS, marketerId);
    await deleteDoc(ref);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTIONS.MARKETERS}/${marketerId}`);
  }
}

export async function saveUserToCloud(user: UserAccount): Promise<void> {
  try {
    const ref = doc(db, COLLECTIONS.USERS, user.id);
    await setDoc(ref, sanitizeForFirestore(user), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTIONS.USERS}/${user.id}`);
  }
}

export async function deleteUserFromCloud(userId: string): Promise<void> {
  try {
    const ref = doc(db, COLLECTIONS.USERS, userId);
    await deleteDoc(ref);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTIONS.USERS}/${userId}`);
  }
}
