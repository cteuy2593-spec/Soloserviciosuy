import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { setGlobalOptions } from 'firebase-functions/v2';
import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { createMercadoPagoPreference, getMercadoPagoPayment } from './mercadopago';

initializeApp();
setGlobalOptions({ region: 'southamerica-east1', maxInstances: 10 });

const db = getFirestore();

const MERCADOPAGO_ACCESS_TOKEN = defineSecret('MERCADOPAGO_ACCESS_TOKEN');

/**
 * Crea una preferencia de pago de MercadoPago para una reserva ya completada.
 * El access token nunca se expone al cliente: la llamada se hace desde el servidor.
 */
export const createPaymentPreference = onCall(
  { secrets: [MERCADOPAGO_ACCESS_TOKEN] },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Necesitás iniciar sesión.');
    }

    const bookingId = request.data?.bookingId as string | undefined;
    if (!bookingId) {
      throw new HttpsError('invalid-argument', 'Falta el bookingId.');
    }

    const bookingRef = db.collection('bookings').doc(bookingId);
    const bookingSnap = await bookingRef.get();
    if (!bookingSnap.exists) {
      throw new HttpsError('not-found', 'La reserva no existe.');
    }
    const booking = bookingSnap.data()!;

    if (booking.clienteUid !== request.auth.uid) {
      throw new HttpsError('permission-denied', 'Solo el cliente puede pagar esta reserva.');
    }
    if (!booking.precioAcordado) {
      throw new HttpsError('failed-precondition', 'La reserva no tiene un precio acordado.');
    }

    const projectId = process.env.GCLOUD_PROJECT;
    const webhookUrl = `https://southamerica-east1-${projectId}.cloudfunctions.net/mercadopagoWebhook`;

    const preference = await createMercadoPagoPreference({
      accessToken: MERCADOPAGO_ACCESS_TOKEN.value(),
      bookingId,
      titulo: booking.listingTitulo,
      monto: booking.precioAcordado,
      webhookUrl,
    });

    await db.collection('paymentPreferences').doc(preference.id).set({
      id: preference.id,
      bookingId,
      monto: booking.precioAcordado,
      moneda: 'UYU',
      estado: 'creado',
      mercadopagoPreferenceId: preference.id,
      creadoEn: Date.now(),
    });

    await bookingRef.update({ pagoId: preference.id });

    return { preferenceId: preference.id, initPoint: preference.init_point };
  },
);

/**
 * Webhook de MercadoPago: notifica cambios de estado de un pago.
 * Ver https://www.mercadopago.com.uy/developers/es/docs/checkout-pro/additional-content/notifications/webhooks
 */
export const mercadopagoWebhook = onRequest(
  { secrets: [MERCADOPAGO_ACCESS_TOKEN] },
  async (req, res) => {
    try {
      const paymentId = (req.query['data.id'] as string) ?? req.body?.data?.id;
      const type = (req.query.type as string) ?? req.body?.type;

      if (type !== 'payment' || !paymentId) {
        res.status(200).send('ignored');
        return;
      }

      const payment = await getMercadoPagoPayment(MERCADOPAGO_ACCESS_TOKEN.value(), paymentId);
      const bookingId = payment.external_reference;
      if (!bookingId) {
        res.status(200).send('sin external_reference');
        return;
      }

      if (payment.status === 'approved') {
        await db.collection('bookings').doc(bookingId).update({
          estado: 'pagada',
          actualizadoEn: Date.now(),
        });
      }

      const preferenceQuery = await db
        .collection('paymentPreferences')
        .where('bookingId', '==', bookingId)
        .limit(1)
        .get();
      if (!preferenceQuery.empty) {
        await preferenceQuery.docs[0]!.ref.update({
          estado: payment.status === 'approved' ? 'aprobado' : payment.status,
          mercadopagoPaymentId: String(payment.id),
        });
      }

      res.status(200).send('ok');
    } catch (error) {
      console.error('Error procesando webhook de MercadoPago', error);
      res.status(500).send('error');
    }
  },
);

/**
 * Recalcula el promedio de calificación de un usuario cada vez que recibe una reseña nueva,
 * evitando condiciones de carrera si llegan varias reseñas al mismo tiempo.
 */
export const onReviewCreated = onDocumentCreated('reviews/{reviewId}', async (event) => {
  const review = event.data?.data();
  if (!review) return;

  const reviewsSnap = await db
    .collection('reviews')
    .where('destinatarioUid', '==', review.destinatarioUid)
    .get();

  const calificaciones = reviewsSnap.docs.map((d) => d.data().calificacion as number);
  const promedio = calificaciones.reduce((sum, value) => sum + value, 0) / calificaciones.length;

  await db.collection('users').doc(review.destinatarioUid).update({
    calificacionPromedio: Math.round(promedio * 10) / 10,
    cantidadResenas: calificaciones.length,
  });
});

/**
 * Cuando un moderador aprueba/rechaza una solicitud de verificación (editando el documento
 * en verificationRequests desde la consola de Firebase o un panel admin), propaga el estado
 * al perfil público del usuario.
 */
export const onVerificationRequestUpdated = onDocumentUpdated(
  'verificationRequests/{requestId}',
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!before || !after || before.estado === after.estado) return;

    if (after.estado === 'verificado' || after.estado === 'rechazado') {
      await db.collection('users').doc(after.uid).update({
        verificacion: after.estado,
      });
      await event.data!.after.ref.update({ revisadoEn: Date.now() });
    }
  },
);
