import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from './firebase';

// Debe coincidir con la región configurada en functions/src/index.ts (setGlobalOptions).
const functions = getFunctions(app, 'us-central1');

interface CreatePreferenceResponse {
  preferenceId: string;
  initPoint: string; // URL de checkout de MercadoPago para abrir en el navegador/WebView
}

/**
 * Llama a la Cloud Function `createPaymentPreference`, que crea la preferencia de pago
 * en MercadoPago del lado del servidor (nunca se usa el access token en el cliente).
 */
export async function createPaymentPreference(bookingId: string): Promise<CreatePreferenceResponse> {
  const callable = httpsCallable<{ bookingId: string }, CreatePreferenceResponse>(
    functions,
    'createPaymentPreference',
  );
  const result = await callable({ bookingId });
  return result.data;
}
