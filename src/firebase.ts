import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCZcbIjFn2i6gJC5zRYisPyse79dCBoF7Q',
  authDomain: 'gen-lang-client-0516407286.firebaseapp.com',
  projectId: 'gen-lang-client-0516407286',
  storageBucket: 'gen-lang-client-0516407286.firebasestorage.app',
  messagingSenderId: '182106751793',
  appId: '1:182106751793:web:bebd4387b8d34ae6da2610',
  measurementId: 'G-57L62J2J7L',
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const PRIMARY_ADMIN_EMAIL = 'sidehustle289@gmail.com';

export function isAuthorizedAdminEmail(
  email?: string | null,
  configuredOwnerEmail?: string
): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  if (normalized === PRIMARY_ADMIN_EMAIL.toLowerCase()) return true;
  if (
    configuredOwnerEmail &&
    configuredOwnerEmail.trim() !== '' &&
    configuredOwnerEmail.trim().toLowerCase() !== 'owner@fazzynails.com' &&
    normalized === configuredOwnerEmail.trim().toLowerCase()
  ) {
    return true;
  }
  return false;
}

async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

if (typeof window !== 'undefined') {
  testFirestoreConnection();
  isSupported()
    .then((supported) => {
      if (supported) {
        getAnalytics(app);
      }
    })
    .catch(() => {
      // Analytics not supported in this environment
    });
}
