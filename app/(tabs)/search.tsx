import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { EmptyState } from '../../src/components/EmptyState';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { ServiceCard } from '../../src/components/ServiceCard';
import { CATEGORIES, DEPARTAMENTOS_UY, type Departamento } from '../../src/constants/categories';
import type { CategoryId } from '../../src/constants/categories';
import { queryListings } from '../../src/services/listings';
import { colors, radius, spacing } from '../../src/theme/colors';
import type { ListingType, ServiceListing } from '../../src/types';

const TIPO_OPTIONS: { value: ListingType | undefined; label: string }[] = [
  { value: undefined, label: 'Todos' },
  { value: 'oferta', label: 'Ofrecen' },
  { value: 'solicitud', label: 'Buscan' },
];

export default function SearchScreen() {
  const [categoria, setCategoria] = useState<CategoryId | undefined>(undefined);
  const [departamento, setDepartamento] = useState<Departamento | undefined>(undefined);
  const [tipo, setTipo] = useState<ListingType | undefined>(undefined);
  const [results, setResults] = useState<ServiceListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    queryListings({ categoria, departamento, tipo })
      .then(setResults)
      .finally(() => setLoading(false));
  }, [categoria, departamento, tipo]);

  return (
    <ScreenContainer padded={false}>
      <View style={styles.filters}>
        <Text style={styles.filterLabel}>Tipo</Text>
        <View style={styles.chipRow}>
          {TIPO_OPTIONS.map((option) => (
            <Chip
              key={option.label}
              label={option.label}
              selected={tipo === option.value}
              onPress={() => setTipo(option.value)}
            />
          ))}
        </View>

        <Text style={styles.filterLabel}>Categoría</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
          <Chip label="Todas" selected={!categoria} onPress={() => setCategoria(undefined)} />
          {CATEGORIES.map((cat) => (
            <Chip
              key={cat.id}
              label={`${cat.icon} ${cat.label}`}
              selected={categoria === cat.id}
              onPress={() => setCategoria(cat.id)}
            />
          ))}
        </ScrollView>

        <Text style={styles.filterLabel}>Departamento</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
          <Chip label="Todos" selected={!departamento} onPress={() => setDepartamento(undefined)} />
          {DEPARTAMENTOS_UY.map((dep) => (
            <Chip key={dep} label={dep} selected={departamento === dep} onPress={() => setDepartamento(dep)} />
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loading} color={colors.primary} />
      ) : results.length === 0 ? (
        <EmptyState title="No encontramos resultados" subtitle="Probá cambiar los filtros de búsqueda." />
      ) : (
        <ScrollView contentContainerStyle={styles.results}>
          {results.map((item) => (
            <ServiceCard key={item.id} listing={item} onPress={() => router.push(`/service/${item.id}`)} />
          ))}
        </ScrollView>
      )}
    </ScreenContainer>
  );
}

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.chip, selected && styles.chipSelected]} onPress={onPress}>
      <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  filters: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  chipScroll: {
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginRight: spacing.xs,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipLabel: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '600',
  },
  chipLabelSelected: {
    color: colors.white,
  },
  loading: {
    marginTop: spacing.xl,
  },
  results: {
    padding: spacing.md,
  },
});
