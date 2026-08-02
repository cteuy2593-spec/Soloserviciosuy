import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile as updateAuthProfile,
  type User,
} from 'firebase/auth';
import { doc, getDoc, onSnapshot, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import type { UserProfile, UserRole } from '../types';
import { auth, db } from './firebase';

export function subscribeToAuthState(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function registerUser(params: {
  nombre: string;
  email: string;
  password: string;
  rol: UserRole;
}): Promise<void> {
  const { nombre, email, password, rol } = params;
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateAuthProfile(credential.user, { displayName: nombre });

  const profile: UserProfile = {
    uid: credential.user.uid,
    nombre,
    email,
    rol,
    categorias: [],
    verificacion: 'sin_verificar',
    calificacionPromedio: 0,
    cantidadResenas: 0,
    creadoEn: Date.now(),
    actualizadoEn: Date.now(),
  };

  await setDoc(doc(db, 'users', credential.user.uid), profile);
}

export async function loginUser(email: string, password: string): Promise<void> {
  await signInWithEmailAndPassword(auth, email, password);
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export function subscribeToUserProfile(
  uid: string,
  callback: (profile: UserProfile | null) => void,
) {
  return onSnapshot(doc(db, 'users', uid), (snap) => {
    callback(snap.exists() ? (snap.data() as UserProfile) : null);
  });
}

export async function updateUserProfile(
  uid: string,
  changes: Partial<Omit<UserProfile, 'uid' | 'creadoEn'>>,
): Promise<void> {
  await updateDoc(doc(db, 'users', uid), {
    ...changes,
    actualizadoEn: Date.now(),
  });
}

// Marca de servidor útil para campos donde queremos hora exacta del backend de Firestore.
export const serverTimestampValue = serverTimestamp;
