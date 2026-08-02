import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import type { Booking, BookingStatus } from '../types';
import { db } from './firebase';

const bookingsCol = collection(db, 'bookings');

export async function createBooking(
  data: Omit<Booking, 'id' | 'estado' | 'creadoEn' | 'actualizadoEn'>,
): Promise<string> {
  const now = Date.now();
  const docRef = await addDoc(bookingsCol, {
    ...data,
    estado: 'pendiente' as BookingStatus,
    creadoEn: now,
    actualizadoEn: now,
  });
  return docRef.id;
}

export async function updateBookingStatus(id: string, estado: BookingStatus): Promise<void> {
  await updateDoc(doc(db, 'bookings', id), { estado, actualizadoEn: Date.now() });
}

export function subscribeToBooking(id: string, callback: (booking: Booking | null) => void) {
  return onSnapshot(doc(db, 'bookings', id), (snap) => {
    callback(snap.exists() ? ({ id: snap.id, ...snap.data() } as Booking) : null);
  });
}

export function subscribeToMyBookingsAsClient(uid: string, callback: (bookings: Booking[]) => void) {
  const q = query(bookingsCol, where('clienteUid', '==', uid), orderBy('creadoEn', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Booking));
  });
}

export function subscribeToMyBookingsAsPrestador(
  uid: string,
  callback: (bookings: Booking[]) => void,
) {
  const q = query(bookingsCol, where('prestadorUid', '==', uid), orderBy('creadoEn', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Booking));
  });
}
