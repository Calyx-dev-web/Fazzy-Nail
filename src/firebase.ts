import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';

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

if (typeof window !== 'undefined') {
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
