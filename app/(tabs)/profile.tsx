import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Avatar } from '../../src/components/Avatar';
import { Button } from '../../src/components/Button';
import { RatingStars } from '../../src/components/RatingStars';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { TextField } from '../../src/components/TextField';
import { VerificationBadge } from '../../src/components/VerificationBadge';
import { CATEGORIES, DEPARTAMENTOS_UY, type CategoryId, type Departamento } from '../../src/constants/categories';
import { uploadImageAsync } from '../../src/services/storageUpload';
import { logoutUser, updateUserProfile } from '../../src/services/users';
import { useAuthStore } from '../../src/store/authStore';
import { colors, radius, spacing } from '../../src/theme/colors';

export default function ProfileScreen() {
  const profile = useAuthStore((s) => s.profile);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [categorias, setCategorias] = useState<CategoryId[]>(profile?.categorias ?? []);
  const [departamento, setDepartamento] = useState<Departamento | undefined>(profile?.departamento);
  const [barrio, setBarrio] = useState(profile?.barrio ?? '');
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  if (!profile) return null;

  const isPrestador = profile.rol === 'prestador' || profile.rol === 'ambos';

  function toggleCategoria(id: CategoryId) {
    setCategorias((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  }

  async function handlePickPhoto() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permiso necesario', 'Necesitamos acceso a tus fotos para cambiar tu imagen de perfil.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (result.canceled || !result.assets[0]) return;

    setUploadingPhoto(true);
    try {
      const url = await uploadImageAsync(result.assets[0].uri, `profilePhotos/${profile!.uid}.jpg`);
      await updateUserProfile(profile!.uid, { fotoUrl: url });
    } catch {
      Alert.alert('No pudimos subir la foto', 'Intentá nuevamente.');
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateUserProfile(profile!.uid, { bio, categorias, departamento, barrio });
      setEditing(false);
    } catch {
      Alert.alert('No pudimos guardar los cambios', 'Intentá nuevamente.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScreenContainer scroll>
      <View style={styles.header}>
        <Pressable onPress={handlePickPhoto} disabled={uploadingPhoto}>
          <Avatar nombre={profile.nombre} fotoUrl={profile.fotoUrl} size={88} />
          <Text style={styles.changePhoto}>{uploadingPhoto ? 'Subiendo...' : 'Cambiar foto'}</Text>
        </Pressable>
        <Text style={styles.name}>{profile.nombre}</Text>
        <RatingStars value={profile.calificacionPromedio} showValue />
        <Text style={styles.reviewCount}>{profile.cantidadResenas} reseñas</Text>
        <VerificationBadge status={profile.verificacion} />
      </View>

      {profile.verificacion !== 'verificado' && (
        <Pressable style={styles.verifyBanner} onPress={() => router.push('/verification')}>
          <Text style={styles.verifyBannerText}>
            {profile.verificacion === 'pendiente'
              ? '⏳ Tu verificación está en revisión'
              : '🪪 Verificá tu identidad para generar más confianza'}
          </Text>
          {profile.verificacion !== 'pendiente' && <Text style={styles.verifyBannerLink}>Verificar →</Text>}
        </Pressable>
      )}

      {editing ? (
        <View style={styles.section}>
          <TextField
            label="Sobre mí"
            placeholder="Contale a la gente sobre tu experiencia..."
            multiline
            numberOfLines={4}
            value={bio}
            onChangeText={setBio}
          />

          {isPrestador && (
            <>
              <Text style={styles.label}>Servicios que ofrecés</Text>
              <View style={styles.chipGrid}>
                {CATEGORIES.map((cat) => {
                  const selected = categorias.includes(cat.id);
                  return (
                    <Pressable
                      key={cat.id}
                      style={[styles.chip, selected && styles.chipSelected]}
                      onPress={() => toggleCategoria(cat.id)}
                    >
                      <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>
                        {cat.icon} {cat.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}

          <Text style={styles.label}>Departamento</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipGrid}>
            {DEPARTAMENTOS_UY.map((dep) => (
              <Pressable
                key={dep}
                style={[styles.chip, departamento === dep && styles.chipSelected]}
                onPress={() => setDepartamento(dep)}
              >
                <Text style={[styles.chipLabel, departamento === dep && styles.chipLabelSelected]}>{dep}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <TextField label="Barrio (opcional)" value={barrio} onChangeText={setBarrio} />

          <View style={styles.buttonRow}>
            <Button label="Cancelar" variant="outline" onPress={() => setEditing(false)} style={styles.flexButton} />
            <Button label="Guardar" onPress={handleSave} loading={saving} style={styles.flexButton} />
          </View>
        </View>
      ) : (
        <View style={styles.section}>
          {profile.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}

          {isPrestador && profile.categorias.length > 0 && (
            <View style={styles.chipGrid}>
              {profile.categorias.map((id) => {
                const cat = CATEGORIES.find((c) => c.id === id);
                if (!cat) return null;
                return (
                  <View key={id} style={styles.chipStatic}>
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

          <Button label="Editar perfil" variant="outline" onPress={() => setEditing(true)} style={styles.editButton} />
        </View>
      )}

      {isPrestador && (
        <Button
          label="Mis publicaciones"
          variant="outline"
          onPress={() => router.push('/service/mine' as any)}
          style={styles.section}
        />
      )}

      <Button label="Cerrar sesión" variant="danger" onPress={logoutUser} style={styles.logoutButton} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  changePhoto: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: spacing.xs,
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
  verifyBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  verifyBannerText: {
    color: colors.primaryDark,
    fontWeight: '600',
    flex: 1,
    fontSize: 13,
  },
  verifyBannerLink: {
    color: colors.primaryDark,
    fontWeight: '700',
    fontSize: 13,
  },
  section: {
    marginBottom: spacing.md,
  },
  bio: {
    fontSize: 14,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipStatic: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  chipLabelSelected: {
    color: colors.white,
  },
  location: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  flexButton: {
    flex: 1,
  },
  editButton: {
    marginTop: spacing.xs,
  },
  logoutButton: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
});
