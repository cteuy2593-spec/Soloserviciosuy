import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Avatar } from '../../src/components/Avatar';
import { Button } from '../../src/components/Button';
import { EmptyState } from '../../src/components/EmptyState';
import { RatingStars } from '../../src/components/RatingStars';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { VerificationBadge } from '../../src/components/VerificationBadge';
import { CATEGORIES } from '../../src/constants/categories';
import { getOrCreateThread } from '../../src/services/chat';
import { listReviewsForUser } from '../../src/services/reviews';
import { getUserProfile } from '../../src/services/users';
import { useAuthStore } from '../../src/store/authStore';
import { colors, radius, spacing } from '../../src/theme/colors';
import type { Review, UserProfile } from '../../src/types';

export default function UserProfileScreen() {
  const { uid } = useLocalSearchParams<{ uid: string }>();
  const currentProfile = useAuthStore((s) => s.profile);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    Promise.all([getUserProfile(uid), listReviewsForUser(uid)]).then(([p, r]) => {
      setProfile(p);
      setReviews(r);
      setLoading(false);
    });
  }, [uid]);

  async function handleContact() {
    if (!currentProfile || !profile) return;
    setBusy(true);
    try {
      const threadId = await getOrCreateThread(
        currentProfile.uid,
        { nombre: currentProfile.nombre, fotoUrl: currentProfile.fotoUrl },
        profile.uid,
        { nombre: profile.nombre, fotoUrl: profile.fotoUrl },
      );
      router.push(`/chat/${threadId}`);
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <ScreenContainer>
        <ActivityIndicator style={styles.loading} color={colors.primary} />
      </ScreenContainer>
    );
  }

  if (!profile) {
    return (
      <ScreenContainer>
        <Text>No encontramos este perfil.</Text>
      </ScreenContainer>
    );
  }

  const isOwnProfile = currentProfile?.uid === profile.uid;

  return (
    <ScreenContainer scroll>
      <Stack.Screen options={{ headerShown: true, title: profile.nombre }} />

      <View style={styles.header}>
        <Avatar nombre={profile.nombre} fotoUrl={profile.fotoUrl} size={88} />
        <Text style={styles.name}>{profile.nombre}</Text>
        <RatingStars value={profile.calificacionPromedio} showValue />
        <Text style={styles.reviewCount}>{profile.cantidadResenas} reseñas</Text>
        <VerificationBadge status={profile.verificacion} />
      </View>

      {profile.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}

      {profile.categorias.length > 0 && (
        <View style={styles.chipGrid}>
          {profile.categorias.map((id) => {
            const cat = CATEGORIES.find((c) => c.id === id);
            if (!cat) return null;
            return (
              <View key={id} style={styles.chip}>
                <Text style={styles.chipLabel}>
                  {cat.icon} {cat.label}
                </Text>
              </View>
            );
          })}
        </View>
      )}

      {profile.departamento ? (
        <Text style={styles.location}>
          📍 {profile.barrio ? `${profile.barrio}, ` : ''}
          {profile.departamento}
        </Text>
      ) : null}

      {!isOwnProfile && (
        <Button label="Contactar" onPress={handleContact} loading={busy} style={styles.contactButton} />
      )}

      <Text style={styles.sectionTitle}>Reseñas</Text>
      {reviews.length === 0 ? (
        <EmptyState icon="⭐" title="Todavía no tiene reseñas" />
      ) : (
        reviews.map((review) => (
          <View key={review.id} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <Text style={styles.reviewAuthor}>{review.autorNombre}</Text>
              <RatingStars value={review.calificacion} size={14} />
            </View>
            {review.comentario ? <Text style={styles.reviewComment}>{review.comentario}</Text> : null}
          </View>
        ))
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    marginTop: spacing.xl,
  },
  header: {
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginTop: spacing.xs,
  },
  reviewCount: {
    fontSize: 12,
    color: colors.textMuted,
  },
  bio: {
    fontSize: 14,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
  },
  chipLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primaryDark,
  },
  location: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  contactButton: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  reviewCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  reviewAuthor: {
    fontWeight: '700',
    color: colors.text,
    fontSize: 14,
  },
  reviewComment: {
    fontSize: 14,
    color: colors.textMuted,
  },
});
