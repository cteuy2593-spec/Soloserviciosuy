import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet } from 'react-native';
import { EmptyState } from '../../src/components/EmptyState';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { ServiceCard } from '../../src/components/ServiceCard';
import { CATEGORY_MAP, type CategoryId } from '../../src/constants/categories';
import { queryListings } from '../../src/services/listings';
import { colors, spacing } from '../../src/theme/colors';
import type { ServiceListing } from '../../src/types';

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: CategoryId }>();
  const category = CATEGORY_MAP[id];
  const [listings, setListings] = useState<ServiceListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    queryListings({ categoria: id })
      .then(setListings)
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <ScreenContainer padded={false}>
      <Stack.Screen options={{ headerShown: true, title: category?.label ?? 'Categoría' }} />
      {loading ? (
        <ActivityIndicator style={styles.loading} color={colors.primary} />
      ) : listings.length === 0 ? (
        <EmptyState
          icon={category?.icon ?? '🔍'}
          title="No hay publicaciones en esta categoría todavía"
        />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {listings.map((item) => (
            <ServiceCard key={item.id} listing={item} onPress={() => router.push(`/service/${item.id}`)} />
          ))}
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
});
