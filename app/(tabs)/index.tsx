import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../src/components/Button';
import { EmptyState } from '../../src/components/EmptyState';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { ServiceCard } from '../../src/components/ServiceCard';
import { CATEGORIES } from '../../src/constants/categories';
import { CategoryCard } from '../../src/components/CategoryCard';
import { queryListings } from '../../src/services/listings';
import { useAuthStore } from '../../src/store/authStore';
import { colors, spacing } from '../../src/theme/colors';
import type { ServiceListing } from '../../src/types';

export default function HomeScreen() {
  const profile = useAuthStore((s) => s.profile);
  const [recientes, setRecientes] = useState<ServiceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const listings = await queryListings({}, 10);
      setRecientes(listings);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const canPublish = profile?.rol === 'prestador' || profile?.rol === 'ambos';

  return (
    <ScreenContainer padded={false}>
      <FlatList
        data={recientes}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
          />
        }
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <View>
                <Text style={styles.greeting}>Hola, {profile?.nombre?.split(' ')[0] ?? ''} 👋</Text>
                <Text style={styles.subtitle}>¿Qué servicio necesitás hoy?</Text>
              </View>
            </View>

            {canPublish && (
              <Button
                label="+ Publicar un servicio"
                onPress={() => router.push('/service/create')}
                style={styles.publishButton}
              />
            )}

            <Text style={styles.sectionTitle}>Categorías</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onPress={() => router.push(`/category/${category.id}`)}
                />
              ))}
            </View>

            <Text style={styles.sectionTitle}>Publicaciones recientes</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <ServiceCard listing={item} onPress={() => router.push(`/service/${item.id}`)} />
          </View>
        )}
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              icon="🧰"
              title="Todavía no hay publicaciones"
              subtitle="Sé el primero en ofrecer o solicitar un servicio."
            />
          ) : null
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: spacing.md,
  },
  header: {
    marginBottom: spacing.md,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 2,
  },
  publishButton: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  cardWrapper: {
    marginBottom: spacing.xs,
  },
});
