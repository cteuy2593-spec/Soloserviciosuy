import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { EmptyState } from '../../src/components/EmptyState';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { subscribeToMyBookingsAsClient, subscribeToMyBookingsAsPrestador } from '../../src/services/bookings';
import { useAuthStore } from '../../src/store/authStore';
import { colors, radius, spacing } from '../../src/theme/colors';
import type { Booking, BookingStatus } from '../../src/types';

const STATUS_CONFIG: Record<BookingStatus, { label: string; bg: string; fg: string }> = {
  pendiente: { label: 'Pendiente', bg: '#FEF3C7', fg: colors.warning },
  aceptada: { label: 'Aceptada', bg: '#DBEAFE', fg: '#1D4ED8' },
  rechazada: { label: 'Rechazada', bg: '#FEE2E2', fg: colors.danger },
  cancelada: { label: 'Cancelada', bg: colors.surface, fg: colors.textMuted },
  completada: { label: 'Completada', bg: '#DCFCE7', fg: colors.success },
  pagada: { label: 'Pagada', bg: '#DCFCE7', fg: colors.success },
};

export default function BookingsScreen() {
  const uid = useAuthStore((s) => s.firebaseUid);
  const profile = useAuthStore((s) => s.profile);
  const [tab, setTab] = useState<'cliente' | 'prestador'>('cliente');
  const [clientBookings, setClientBookings] = useState<Booking[]>([]);
  const [providerBookings, setProviderBookings] = useState<Booking[]>([]);

  const showTabs = profile?.rol === 'ambos';

  useEffect(() => {
    if (!uid) return;
    return subscribeToMyBookingsAsClient(uid, setClientBookings);
  }, [uid]);

  useEffect(() => {
    if (!uid) return;
    return subscribeToMyBookingsAsPrestador(uid, setProviderBookings);
  }, [uid]);

  useEffect(() => {
    if (profile?.rol === 'prestador') setTab('prestador');
    if (profile?.rol === 'cliente') setTab('cliente');
  }, [profile?.rol]);

  const data = tab === 'cliente' ? clientBookings : providerBookings;

  return (
    <ScreenContainer padded={false}>
      <Text style={styles.title}>Reservas</Text>

      {showTabs && (
        <View style={styles.tabRow}>
          <Pressable style={[styles.tab, tab === 'cliente' && styles.tabActive]} onPress={() => setTab('cliente')}>
            <Text style={[styles.tabLabel, tab === 'cliente' && styles.tabLabelActive]}>Como cliente</Text>
          </Pressable>
          <Pressable
            style={[styles.tab, tab === 'prestador' && styles.tabActive]}
            onPress={() => setTab('prestador')}
          >
            <Text style={[styles.tabLabel, tab === 'prestador' && styles.tabLabelActive]}>Como prestador</Text>
          </Pressable>
        </View>
      )}

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<EmptyState icon="📅" title="No tenés reservas todavía" />}
        renderItem={({ item }) => {
          const status = STATUS_CONFIG[item.estado];
          const counterpart = tab === 'cliente' ? item.prestadorNombre : item.clienteNombre;
          return (
            <Pressable style={styles.card} onPress={() => router.push(`/booking/${item.id}`)}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {item.listingTitulo}
                </Text>
                <View style={[styles.badge, { backgroundColor: status.bg }]}>
                  <Text style={[styles.badgeText, { color: status.fg }]}>{status.label}</Text>
                </View>
              </View>
              <Text style={styles.counterpart}>Con {counterpart}</Text>
            </Pressable>
          );
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 4,
    marginBottom: spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radius.sm,
  },
  tabActive: {
    backgroundColor: colors.white,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  tabLabelActive: {
    color: colors.primary,
  },
  listContent: {
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
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  counterpart: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
});
