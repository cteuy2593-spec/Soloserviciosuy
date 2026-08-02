import { router, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { EmptyState } from '../../src/components/EmptyState';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { CATEGORY_MAP } from '../../src/constants/categories';
import { listMyListings, setListingActive } from '../../src/services/listings';
import { useAuthStore } from '../../src/store/authStore';
import { colors, radius, spacing } from '../../src/theme/colors';
import type { ServiceListing } from '../../src/types';

export default function MyListingsScreen() {
  const uid = useAuthStore((s) => s.firebaseUid);
  const [listings, setListings] = useState<ServiceListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;
    listMyListings(uid)
      .then(setListings)
      .finally(() => setLoading(false));
  }, [uid]);

  async function toggleActive(listing: ServiceListing) {
    const nuevoEstado = !listing.activo;
    setListings((prev) => prev.map((l) => (l.id === listing.id ? { ...l, activo: nuevoEstado } : l)));
    await setListingActive(listing.id, nuevoEstado);
  }

  return (
    <ScreenContainer padded={false}>
      <Stack.Screen options={{ headerShown: true, title: 'Mis publicaciones' }} />
      {loading ? (
        <ActivityIndicator style={styles.loading} color={colors.primary} />
      ) : listings.length === 0 ? (
        <EmptyState
          icon="🧰"
          title="Todavía no publicaste ningún servicio"
          subtitle="Tocá 'Publicar un servicio' desde el inicio para empezar."
        />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {listings.map((listing) => {
            const category = CATEGORY_MAP[listing.categoria];
            return (
              <Pressable key={listing.id} style={styles.card} onPress={() => router.push(`/service/${listing.id}`)}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {category.icon} {listing.titulo}
                  </Text>
                  <Switch
                    value={listing.activo}
                    onValueChange={() => toggleActive(listing)}
                    trackColor={{ true: colors.primary }}
                  />
                </View>
                <Text style={styles.cardStatus}>{listing.activo ? 'Publicado' : 'Pausado'}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    marginTop: spacing.xl,
  },
  content: {
    padding: spacing.md,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  cardStatus: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
});
