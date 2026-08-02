import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CATEGORY_MAP } from '../constants/categories';
import type { ServiceListing } from '../types';
import { colors, radius, spacing } from '../theme/colors';
import { Avatar } from './Avatar';
import { RatingStars } from './RatingStars';

interface ServiceCardProps {
  listing: ServiceListing;
  onPress: () => void;
}

export function ServiceCard({ listing, onPress }: ServiceCardProps) {
  const category = CATEGORY_MAP[listing.categoria];

  return (
    <Pressable style={({ pressed }) => [styles.card, pressed && styles.pressed]} onPress={onPress}>
      <View style={styles.header}>
        <Avatar nombre={listing.autorNombre} fotoUrl={listing.autorFotoUrl} size={40} />
        <View style={styles.headerText}>
          <Text style={styles.autor}>{listing.autorNombre}</Text>
          <RatingStars value={listing.autorCalificacion} size={13} showValue />
        </View>
        <View style={[styles.badge, listing.tipo === 'oferta' ? styles.badgeOferta : styles.badgeSolicitud]}>
          <Text style={styles.badgeText}>{listing.tipo === 'oferta' ? 'Ofrece' : 'Busca'}</Text>
        </View>
      </View>

      <Text style={styles.titulo} numberOfLines={1}>
        {category.icon} {listing.titulo}
      </Text>
      <Text style={styles.descripcion} numberOfLines={2}>
        {listing.descripcion}
      </Text>

      <View style={styles.footer}>
        <Text style={styles.zona}>
          📍 {listing.barrio ? `${listing.barrio}, ` : ''}
          {listing.departamento}
        </Text>
        {listing.precioDesde ? (
          <Text style={styles.precio}>
            $U {listing.precioDesde}
            {listing.precioHasta ? ` - ${listing.precioHasta}` : ''}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  pressed: {
    opacity: 0.75,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  headerText: {
    flex: 1,
  },
  autor: {
    fontWeight: '600',
    color: colors.text,
    fontSize: 14,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  badgeOferta: {
    backgroundColor: colors.primaryLight,
  },
  badgeSolicitud: {
    backgroundColor: '#FEF3C7',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  titulo: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  descripcion: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  zona: {
    fontSize: 12,
    color: colors.textMuted,
  },
  precio: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
});
