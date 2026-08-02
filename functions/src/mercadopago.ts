const MP_API_BASE = 'https://api.mercadopago.com';

interface CreatePreferenceParams {
  accessToken: string;
  bookingId: string;
  titulo: string;
  monto: number;
  webhookUrl: string;
}

interface MercadoPagoPreferenceResponse {
  id: string;
  init_point: string;
}

export async function createMercadoPagoPreference(
  params: CreatePreferenceParams,
): Promise<MercadoPagoPreferenceResponse> {
  const response = await fetch(`${MP_API_BASE}/checkout/preferences`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${params.accessToken}`,
    },
    body: JSON.stringify({
      items: [
        {
          title: params.titulo,
          quantity: 1,
          currency_id: 'UYU',
          unit_price: params.monto,
        },
      ],
      external_reference: params.bookingId,
      notification_url: params.webhookUrl,
      back_urls: {
        success: 'soloserviciosuy://booking/' + params.bookingId,
        failure: 'soloserviciosuy://booking/' + params.bookingId,
        pending: 'soloserviciosuy://booking/' + params.bookingId,
      },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`MercadoPago rechazó la creación de preferencia (${response.status}): ${body}`);
  }

  return (await response.json()) as MercadoPagoPreferenceResponse;
}

export interface MercadoPagoPayment {
  id: number;
  status: string;
  external_reference: string;
}

export async function getMercadoPagoPayment(
  accessToken: string,
  paymentId: string,
): Promise<MercadoPagoPayment> {
  const response = await fetch(`${MP_API_BASE}/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`No pudimos consultar el pago en MercadoPago (${response.status}): ${body}`);
  }
  return (await response.json()) as MercadoPagoPayment;
}
