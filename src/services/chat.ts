import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import type { ChatMessage, ChatThread } from '../types';
import { db } from './firebase';

const threadsCol = collection(db, 'chatThreads');

function threadIdFor(uidA: string, uidB: string): string {
  return [uidA, uidB].sort().join('_');
}

export async function getOrCreateThread(
  uidA: string,
  infoA: { nombre: string; fotoUrl?: string },
  uidB: string,
  infoB: { nombre: string; fotoUrl?: string },
  bookingId?: string,
): Promise<string> {
  const id = threadIdFor(uidA, uidB);
  const threadRef = doc(db, 'chatThreads', id);
  const existing = await getDocs(query(threadsCol, where('__name__', '==', id)));
  if (existing.empty) {
    const thread: Omit<ChatThread, 'id'> = {
      participantes: [uidA, uidB],
      participantesInfo: { [uidA]: infoA, [uidB]: infoB },
      bookingId,
      creadoEn: Date.now(),
    };
    await setDoc(threadRef, thread);
  }
  return id;
}

export function subscribeToMyThreads(uid: string, callback: (threads: ChatThread[]) => void) {
  const q = query(threadsCol, where('participantes', 'array-contains', uid), orderBy('ultimoMensajeEn', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ChatThread));
  });
}

export function subscribeToMessages(threadId: string, callback: (messages: ChatMessage[]) => void) {
  const messagesCol = collection(db, 'chatThreads', threadId, 'messages');
  const q = query(messagesCol, orderBy('creadoEn', 'asc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ChatMessage));
  });
}

export async function sendMessage(threadId: string, autorUid: string, texto: string): Promise<void> {
  const messagesCol = collection(db, 'chatThreads', threadId, 'messages');
  const now = Date.now();
  await addDoc(messagesCol, {
    threadId,
    autorUid,
    texto,
    creadoEn: now,
    leidoPor: [autorUid],
  } satisfies Omit<ChatMessage, 'id'>);

  await setDoc(
    doc(db, 'chatThreads', threadId),
    { ultimoMensaje: texto, ultimoMensajeEn: now },
    { merge: true },
  );
}

export const serverTimestampValue = serverTimestamp;
