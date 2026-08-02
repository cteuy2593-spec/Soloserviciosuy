import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../src/components/Button';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { CATEGORY_MAP } from '../../src/constants/categories';
import { subscribeToBooking, updateBookingStatus } from '../../src/services/bookings';
import { hasReviewedBooking } from '../../src/services/reviews';
import { createPaymentPreference } from '../../src/services/payments';
import { useAuthStore } from '../../src/store/authStore';
import { colors, radius, spacing } from '../../src/theme/colors';
import type { Booking } from '../../src/types';

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const uid = useAuthStore((s) => s.firebaseUid);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [busy, setBusy] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);

  useEffect(() => {
    return subscribeToBooking(id, setBooking);
  }, [id]);

  useEffect(() => {
    if (!booking || !uid) return;
    hasReviewedBooking(booking.id, uid).then(setAlreadyReviewed);
  }, [booking?.id, booking?.estado, uid]);

  if (!booking) {
    return (
      <ScreenContainer>
        <ActivityIndicator style={styles.loading} color={colors.primary} />
      </ScreenContainer>
    );
  }

  const isPrestador = uid === booking.prestadorUid;
  const isCliente = uid === booking.clienteUid;
  const category = CATEGORY_MAP[booking.categoria];

  async function handleUpdate(estado: Booking['estado']) {
    setBusy(true);
    try {
      await updateBookingStatus(booking!.id, estado);
    } finally {
      setBusy(false);
    }
  }

  async function handlePay() {
    setBusy(true);
    try {
      const { initPoint } = await createPaymentPreference(booking!.id);
      await Linking.openURL(initPoint);
    } catch {
      Alert.alert(
        'Pagos aún no configurados',
        'Esta función requiere que el proyecto tenga configurada la Cloud Function de MercadoPago (ver README).',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScreenContainer scroll>
      <Stack.Screen options={{ headerShown: true, title: 'Detalle de reserva' }} />

      <Text style={styles.title}>
        {category.icon} {booking.listingTitulo}
      </Text>
      <Text style={styles.status}>Estado: {STATUS_LABEL[booking.estado]}</Text>

      <View style={styles.infoBlock}>
        <Text style={styles.infoLabel}>Cliente</Text>
        <Text style={styles.infoValue}>{booking.clienteNombre}</Text>
        <Text style={styles.infoLabel}>Prestador</Text>
        <Text style={styles.infoValue}>{booking.prestadorNombre}</Text>
        {booking.precioAcordado ? (
          <>
            <Text style={styles.infoLabel}>Precio acordado</Text>
            <Text style={styles.infoValue}>$U {booking.precioAcordado}</Text>
          </>
        ) : null}
      </View>

      {isPrestador && booking.estado === 'pendiente' && (
        <View style={styles.actions}>
          <Button label="Rechazar" variant="outline" onPress={() => handleUpdate('rechazada')} loading={busy} style={styles.actionButton} />
          <Button label="Aceptar" onPress={() => handleUpdate('aceptada')} loading={busy} style={styles.actionButton} />
        </View>
      )}

      {isCliente && booking.estado === 'pendiente' && (
        <Button label="Cancelar solicitud" variant="danger" onPress={() => handleUpdate('cancelada')} loading={busy} style={styles.singleAction} />
      )}

      {booking.estado === 'aceptada' && (
        <Button
          label="Marcar como completado"
          onPress={() => handleUpdate('completada')}
          loading={busy}
          style={styles.singleAction}
        />
      )}

      {isCliente && (booking.estado === 'completada') && booking.precioAcordado ? (
        <Button label="Pagar con MercadoPago" onPress={handlePay} loading={busy} style={styles.singleAction} />
      ) : null}

      {(booking.estado === 'completada' || booking.estado === 'pagada') && !alreadyReviewed && (
        <Button
          label="Dejar reseña"
          variant="outline"
          onPress={() => router.push(`/review/${booking.id}`)}
          style={styles.singleAction}
        />
      )}
    </ScreenContainer>
  );
}

const STATUS_LABEL: Record<Booking['estado'], string> = {
  pendiente: 'Pendiente de respuesta',
  aceptada: 'Aceptada',
  rechazada: 'Rechazada',
  cancelada: 'Cancelada',
  completada: 'Completada',
  pagada: 'Pagada',
};

const styles = StyleSheet.create({
  loading: {
    marginTop: spacing.xl,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  status: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  infoBlock: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  singleAction: {
    marginBottom: spacing.md,
  },
});
