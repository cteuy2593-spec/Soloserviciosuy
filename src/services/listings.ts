import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit as fsLimit,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import type { CategoryId, Departamento } from '../constants/categories';
import type { ListingType, ServiceListing } from '../types';
import { db } from './firebase';

const listingsCol = collection(db, 'listings');

export interface ListingFilters {
  categoria?: CategoryId;
  departamento?: Departamento;
  tipo?: ListingType;
}

export async function createListing(
  data: Omit<ServiceListing, 'id' | 'activo' | 'creadoEn' | 'actualizadoEn'>,
): Promise<string> {
  const now = Date.now();
  const docRef = await addDoc(listingsCol, {
    ...data,
    activo: true,
    creadoEn: now,
    actualizadoEn: now,
  });
  return docRef.id;
}

export async function getListing(id: string): Promise<ServiceListing | null> {
  const snap = await getDoc(doc(db, 'listings', id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as ServiceListing) : null;
}

export function subscribeToListing(id: string, callback: (listing: ServiceListing | null) => void) {
  return onSnapshot(doc(db, 'listings', id), (snap) => {
    callback(snap.exists() ? ({ id: snap.id, ...snap.data() } as ServiceListing) : null);
  });
}

export async function queryListings(filters: ListingFilters, max = 30): Promise<ServiceListing[]> {
  const clauses = [where('activo', '==', true)];
  if (filters.categoria) clauses.push(where('categoria', '==', filters.categoria));
  if (filters.departamento) clauses.push(where('departamento', '==', filters.departamento));
  if (filters.tipo) clauses.push(where('tipo', '==', filters.tipo));

  const q = query(listingsCol, ...clauses, orderBy('creadoEn', 'desc'), fsLimit(max));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ServiceListing);
}

export async function listMyListings(uid: string): Promise<ServiceListing[]> {
  const q = query(listingsCol, where('autorUid', '==', uid), orderBy('creadoEn', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ServiceListing);
}

export async function setListingActive(id: string, activo: boolean): Promise<void> {
  await updateDoc(doc(db, 'listings', id), { activo, actualizadoEn: Date.now() });
}
