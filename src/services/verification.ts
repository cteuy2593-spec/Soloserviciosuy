import { addDoc, collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import type { VerificationRequest } from '../types';
import { db } from './firebase';
import { uploadImageAsync } from './storageUpload';

const verificationsCol = collection(db, 'verificationRequests');

export interface SubmitVerificationParams {
  uid: string;
  nombreCompleto: string;
  numeroDocumento: string;
  documentoFrenteLocalUri: string;
  documentoDorsoLocalUri?: string;
  selfieLocalUri?: string;
}

/**
 * Sube las imágenes del documento a Storage y crea la solicitud de verificación.
 * La revisión es manual: un administrador la aprueba/rechaza desde la consola de Firebase
 * o un panel admin (ver README, sección "Verificación de identidad").
 */
export async function submitVerification(params: SubmitVerificationParams): Promise<string> {
  const { uid, nombreCompleto, numeroDocumento } = params;
  const timestamp = Date.now();

  const documentoFrenteUrl = await uploadImageAsync(
    params.documentoFrenteLocalUri,
    `verifications/${uid}/frente_${timestamp}.jpg`,
  );
  const documentoDorsoUrl = params.documentoDorsoLocalUri
    ? await uploadImageAsync(params.documentoDorsoLocalUri, `verifications/${uid}/dorso_${timestamp}.jpg`)
    : undefined;
  const selfieUrl = params.selfieLocalUri
    ? await uploadImageAsync(params.selfieLocalUri, `verifications/${uid}/selfie_${timestamp}.jpg`)
    : undefined;

  const request: Omit<VerificationRequest, 'id'> = {
    uid,
    nombreCompleto,
    numeroDocumento,
    documentoFrenteUrl,
    documentoDorsoUrl,
    selfieUrl,
    estado: 'pendiente',
    creadoEn: timestamp,
  };

  const docRef = await addDoc(verificationsCol, request);
  return docRef.id;
}

export function subscribeToMyVerification(
  uid: string,
  callback: (request: VerificationRequest | null) => void,
) {
  const q = query(verificationsCol, where('uid', '==', uid), orderBy('creadoEn', 'desc'));
  return onSnapshot(q, (snap) => {
    if (snap.empty) return callback(null);
    const d = snap.docs[0]!;
    callback({ id: d.id, ...d.data() } as VerificationRequest);
  });
}
