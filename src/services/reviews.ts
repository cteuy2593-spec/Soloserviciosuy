import { addDoc, collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import type { Review } from '../types';
import { db } from './firebase';

const reviewsCol = collection(db, 'reviews');

export async function createReview(data: Omit<Review, 'id' | 'creadoEn'>): Promise<string> {
  const docRef = await addDoc(reviewsCol, { ...data, creadoEn: Date.now() });
  // El promedio de calificación del usuario destinatario se recalcula en una Cloud Function
  // (ver functions/src/index.ts -> onReviewCreated), así evitamos condiciones de carrera
  // si dos reseñas llegan al mismo tiempo.
  return docRef.id;
}

export async function listReviewsForUser(uid: string): Promise<Review[]> {
  const q = query(reviewsCol, where('destinatarioUid', '==', uid), orderBy('creadoEn', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Review);
}

export async function hasReviewedBooking(bookingId: string, autorUid: string): Promise<boolean> {
  const q = query(reviewsCol, where('bookingId', '==', bookingId), where('autorUid', '==', autorUid));
  const snap = await getDocs(q);
  return !snap.empty;
}
