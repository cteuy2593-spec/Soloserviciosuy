import AsyncStorage from '@react-native-async-storage/async-storage';
import { type FirebaseApp, getApps, initializeApp } from 'firebase/app';
import { type Auth, initializeAuth } from 'firebase/auth';
// getReactNativePersistence solo existe en el build de React Native del SDK (resuelto por
// Metro vía el campo "react-native" de package.json), no en los tipos del build web/Node
// que usa tsc por defecto - de ahí el ts-expect-error en vez de un import normal.
// @ts-expect-error - ver comentario arriba
import { getReactNativePersistence } from 'firebase/auth';
import { type Firestore, getFirestore } from 'firebase/firestore';
import { type FirebaseStorage, getStorage } from 'firebase/storage';

// Todas las claves se toman de variables de entorno EXPO_PUBLIC_*.
// Ver .env.example para la lista completa y cómo obtenerlas desde la consola de Firebase.
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

function assertConfigured() {
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.warn(
      '[Firebase] Faltan variables de entorno EXPO_PUBLIC_FIREBASE_*. ' +
        'Copiá .env.example a .env y completá con las credenciales de tu proyecto Firebase.',
    );
  }
}

assertConfigured();

const app: FirebaseApp = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);

// initializeAuth solo puede llamarse una vez; en entornos con fast refresh
// getApps().length evita reinicializarlo en cada recarga del bundle.
let auth: Auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  // Ya estaba inicializado (hot reload) - importamos getAuth de forma perezosa para evitar
  // un import circular al tope del archivo.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  auth = require('firebase/auth').getAuth(app);
}

const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);

export { app, auth, db, storage };
