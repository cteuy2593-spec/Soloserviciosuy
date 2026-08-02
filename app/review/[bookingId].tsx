import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../src/components/Button';
import { RatingStars } from '../../src/components/RatingStars';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { TextField } from '../../src/components/TextField';
import { subscribeToBooking } from '../../src/services/bookings';
import { createReview } from '../../src/services/reviews';
import { useAuthStore } from '../../src/store/authStore';
import { colors, spacing } from '../../src/theme/colors';
import type { Booking } from '../../src/types';

export default function LeaveReviewScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const profile = useAuthStore((s) => s.profile);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [calificacion, setCalificacion] = useState(5);
  const [comentario, setComentario] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    return subscribeToBooking(bookingId, setBooking);
  }, [bookingId]);

  if (!booking || !profile) {
    return (
      <ScreenContainer>
        <ActivityIndicator style={styles.loading} color={colors.primary} />
      </ScreenContainer>
    );
  }

  const destinatarioUid = profile.uid === booking.clienteUid ? booking.prestadorUid : booking.clienteUid;
  const destinatarioNombre = profile.uid === booking.clienteUid ? booking.prestadorNombre : booking.clienteNombre;

  async function handleSubmit() {
    setSaving(true);
    try {
      await createReview({
        bookingId: booking!.id,
        listingId: booking!.listingId,
        autorUid: profile!.uid,
        autorNombre: profile!.nombre,
        destinatarioUid,
        calificacion,
        comentario: comentario.trim() || undefined,
      });
      Alert.alert('¡Gracias por tu reseña!');
      router.back();
    } catch {
      Alert.alert('No pudimos guardar tu reseña', 'Intentá nuevamente.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScreenContainer scroll>
      <Stack.Screen options={{ headerShown: true, title: 'Dejar reseña' }} />

      <Text style={styles.title}>¿Cómo fue tu experiencia con {destinatarioNombre}?</Text>

      <View style={styles.starsRow}>
        <RatingStars value={calificacion} onChange={setCalificacion} size={36} />
      </View>

      <TextField
        label="Comentario (opcional)"
        placeholder="Contale a otros usuarios cómo te fue..."
        multiline
        numberOfLines={4}
        value={comentario}
        onChangeText={setComentario}
      />

      <Button label="Enviar reseña" onPress={handleSubmit} loading={saving} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    marginTop: spacing.xl,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  starsRow: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
});
