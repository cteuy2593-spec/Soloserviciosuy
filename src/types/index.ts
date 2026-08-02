import type { CategoryId, Departamento } from '../constants/categories';

export type UserRole = 'cliente' | 'prestador' | 'ambos';

export type VerificationStatus = 'sin_verificar' | 'pendiente' | 'verificado' | 'rechazado';

export interface UserProfile {
  uid: string;
  nombre: string;
  email: string;
  telefono?: string;
  fotoUrl?: string;
  rol: UserRole;
  bio?: string;
  categorias: CategoryId[]; // categorías que ofrece, si es prestador
  departamento?: Departamento;
  barrio?: string;
  verificacion: VerificationStatus;
  calificacionPromedio: number;
  cantidadResenas: number;
  creadoEn: number; // timestamp epoch ms
  actualizadoEn: number;
}

export type ListingType = 'oferta' | 'solicitud';

export interface ServiceListing {
  id: string;
  autorUid: string;
  autorNombre: string;
  autorFotoUrl?: string;
  autorCalificacion: number;
  tipo: ListingType; // 'oferta' = un prestador ofrece el servicio, 'solicitud' = un cliente busca alguien
  categoria: CategoryId;
  titulo: string;
  descripcion: string;
  precioDesde?: number; // en UYU
  precioHasta?: number;
  departamento: Departamento;
  barrio?: string;
  activo: boolean;
  creadoEn: number;
  actualizadoEn: number;
}

export type BookingStatus =
  | 'pendiente'
  | 'aceptada'
  | 'rechazada'
  | 'cancelada'
  | 'completada'
  | 'pagada';

export interface Booking {
  id: string;
  listingId: string;
  listingTitulo: string;
  categoria: CategoryId;
  clienteUid: string;
  clienteNombre: string;
  prestadorUid: string;
  prestadorNombre: string;
  estado: BookingStatus;
  fechaSolicitada?: number;
  mensaje?: string;
  precioAcordado?: number;
  pagoId?: string;
  creadoEn: number;
  actualizadoEn: number;
}

export interface ChatThread {
  id: string;
  participantes: string[]; // [uidA, uidB]
  participantesInfo: Record<string, { nombre: string; fotoUrl?: string }>;
  ultimoMensaje?: string;
  ultimoMensajeEn?: number;
  bookingId?: string;
  creadoEn: number;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  autorUid: string;
  texto: string;
  creadoEn: number;
  leidoPor: string[];
}

export interface Review {
  id: string;
  bookingId: string;
  listingId: string;
  autorUid: string; // quien deja la reseña
  autorNombre: string;
  destinatarioUid: string; // a quien califica
  calificacion: number; // 1-5
  comentario?: string;
  creadoEn: number;
}

export interface VerificationRequest {
  id: string;
  uid: string;
  nombreCompleto: string;
  numeroDocumento: string;
  documentoFrenteUrl: string;
  documentoDorsoUrl?: string;
  selfieUrl?: string;
  estado: VerificationStatus;
  motivoRechazo?: string;
  creadoEn: number;
  revisadoEn?: number;
  revisadoPor?: string;
}

export interface PaymentPreference {
  id: string;
  bookingId: string;
  monto: number;
  moneda: 'UYU';
  estado: 'creado' | 'aprobado' | 'rechazado' | 'pendiente';
  mercadopagoPreferenceId?: string;
  mercadopagoPaymentId?: string;
  creadoEn: number;
}
