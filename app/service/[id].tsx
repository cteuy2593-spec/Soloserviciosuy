import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Avatar } from '../../src/components/Avatar';
import { Button } from '../../src/components/Button';
import { RatingStars } from '../../src/components/RatingStars';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { CATEGORY_MAP } from '../../src/constants/categories';
import { createBooking } from '../../src/services/bookings';
import { getOrCreateThread } from '../../src/services/chat';
import { getListing } from '../../src/services/listings';
import { useAuthStore } from '../../src/store/authStore';
import { colors, radius, spacing } from '../../src/theme/colors';
import type { ServiceListing } from '../../src/types';

export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const profile = useAuthStore((s) => s.profile);
  const [listing, setListing] = useState<ServiceListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getListing(id).then((data) => {
      setListing(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <ScreenContainer>
        <ActivityIndicator style={styles.loading} color={colors.primary} />
      </ScreenContainer>
    );
  }

  if (!listing) {
    return (
      <ScreenContainer>
        <Text>No encontramos esta publicación.</Text>
      </ScreenContainer>
    );
  }

  const category = CATEGORY_MAP[listing.categoria];
  const isOwnListing = profile?.uid === listing.autorUid;

  // Si la publicación es una "oferta", el autor es el prestador y quien mira es el cliente.
  // Si es una "solicitud", el autor es el cliente y quien mira ofrece ser el prestador.
  const clienteUid = listing.tipo === 'oferta' ? undefined : listing.autorUid;
  const prestadorUid = listing.tipo === 'oferta' ? listing.autorUid : undefined;

  async function handleContact() {
    if (!profile || isOwnListing) return;
    setBusy(true);
    try {
      const threadId = await getOrCreateThread(
        profile.uid,
        { nombre: profile.nombre, fotoUrl: profile.fotoUrl },
        listing!.autorUid,
        { nombre: listing!.autorNombre, fotoUrl: listing!.autorFotoUrl },
      );
      router.push(`/chat/${threadId}`);
    } finally {
      setBusy(false);
    }
  }

  async function handleRequest() {
    if (!profile || isOwnListing) return;
    setBusy(true);
    try {
      await createBooking({
        listingId: listing!.id,
        listingTitulo: listing!.titulo,
        categoria: listing!.categoria,
        clienteUid: clienteUid ?? profile.uid,
        clienteNombre: clienteUid ? listing!.autorNombre : profile.nombre,
        prestadorUid: prestadorUid ?? profile.uid,
        prestadorNombre: prestadorUid ? listing!.autorNombre : profile.nombre,
        precioAcordado: listing!.precioDesde,
      });
      Alert.alert('¡Listo!', 'Tu solicitud fue enviada. Podés verla en la pestaña Reservas.');
      router.push('/(tabs)/bookings');
    } catch {
      Alert.alert('No pudimos enviar la solicitud', 'Intentá nuevamente.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScreenContainer scroll>
      <Stack.Screen options={{ headerShown: true, title: category.label }} />

      <View style={[styles.badge, listing.tipo === 'oferta' ? styles.badgeOferta : styles.badgeSolicitud]}>
        <Text style={styles.badgeText}>{listing.tipo === 'oferta' ? 'Ofrece este servicio' : 'Busca este servicio'}</Text>
      </View>

      <Text style={styles.title}>
        {category.icon} {listing.titulo}
      </Text>

      <Pressable style={styles.authorRow} onPress={() => router.push(`/user/${listing.autorUid}`)}>
        <Avatar nombre={listing.autorNombre} fotoUrl={listing.autorFotoUrl} size={44} />
        <View style={styles.authorInfo}>
          <Text style={styles.authorName}>{listing.autorNombre}</Text>
          <RatingStars value={listing.autorCalificacion} size={14} showValue />
        </View>
      </Pressable>

      <Text style={styles.sectionTitle}>Descripción</Text>
      <Text style={styles.description}>{listing.descripcion}</Text>

      <Text style={styles.sectionTitle}>Ubicación</Text>
      <Text style={styles.description}>
        📍 {listing.barrio ? `${listing.barrio}, ` : ''}
        {listing.departamento}
      </Text>

      {listing.precioDesde ? (
        <>
          <Text style={styles.sectionTitle}>Precio estimado</Text>
          <Text style={styles.price}>
            $U {listing.precioDesde}
            {listing.precioHasta ? ` - $U ${listing.precioHasta}` : ''}
          </Text>
        </>
      ) : null}

      {!isOwnListing && (
        <View style={styles.actions}>
          <Button label="Contactar" variant="outline" onPress={handleContact} loading={busy} style={styles.actionButton} />
          <Button
            label={listing.tipo === 'oferta' ? 'Solicitar servicio' : 'Ofrecer mis servicios'}
            onPress={handleRequest}
            loading={busy}
            style={styles.actionButton}
          />
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    marginTop: spacing.xl,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    marginBottom: spacing.sm,
  },
  badgeOferta: {
    backgroundColor: colors.primaryLight,
  },
  badgeSolicitud: {
    backgroundColor: '#FEF3C7',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.md,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  description: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  price: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  actionButton: {
    flex: 1,
  },
});
