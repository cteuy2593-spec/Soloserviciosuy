import * as ImagePicker from 'expo-image-picker';
import { router, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from '../src/components/Button';
import { ScreenContainer } from '../src/components/ScreenContainer';
import { TextField } from '../src/components/TextField';
import { VerificationBadge } from '../src/components/VerificationBadge';
import { submitVerification, subscribeToMyVerification } from '../src/services/verification';
import { useAuthStore } from '../src/store/authStore';
import { colors, radius, spacing } from '../src/theme/colors';
import type { VerificationRequest } from '../src/types';

export default function VerificationScreen() {
  const profile = useAuthStore((s) => s.profile);
  const [request, setRequest] = useState<VerificationRequest | null>(null);
  const [nombreCompleto, setNombreCompleto] = useState(profile?.nombre ?? '');
  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [frenteUri, setFrenteUri] = useState<string | null>(null);
  const [dorsoUri, setDorsoUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!profile) return;
    return subscribeToMyVerification(profile.uid, setRequest);
  }, [profile?.uid]);

  async function pickImage(setter: (uri: string) => void) {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permiso necesario', 'Necesitamos acceso a tus fotos para subir el documento.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (!result.canceled && result.assets[0]) setter(result.assets[0].uri);
  }

  async function handleSubmit() {
    if (!profile) return;
    if (!nombreCompleto.trim() || !numeroDocumento.trim() || !frenteUri) {
      Alert.alert('Faltan datos', 'Completá tu nombre, número de cédula y subí la foto del frente del documento.');
      return;
    }
    setSubmitting(true);
    try {
      await submitVerification({
        uid: profile.uid,
        nombreCompleto: nombreCompleto.trim(),
        numeroDocumento: numeroDocumento.trim(),
        documentoFrenteLocalUri: frenteUri,
        documentoDorsoLocalUri: dorsoUri ?? undefined,
      });
      Alert.alert('Solicitud enviada', 'Vamos a revisar tu documento. Te avisamos cuando esté verificado.');
      router.back();
    } catch {
      Alert.alert('No pudimos enviar tu solicitud', 'Intentá nuevamente.');
    } finally {
      setSubmitting(false);
    }
  }

  if (request && (request.estado === 'pendiente' || request.estado === 'verificado')) {
    return (
      <ScreenContainer>
        <Stack.Screen options={{ headerShown: true, title: 'Verificación de identidad' }} />
        <View style={styles.statusBlock}>
          <VerificationBadge status={request.estado} />
          <Text style={styles.statusText}>
            {request.estado === 'pendiente'
              ? 'Tu documento está en revisión. Este proceso puede demorar hasta 48hs.'
              : '¡Tu identidad ya está verificada!'}
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll>
      <Stack.Screen options={{ headerShown: true, title: 'Verificación de identidad' }} />

      <Text style={styles.intro}>
        Verificar tu identidad ayuda a generar confianza, especialmente para servicios sensibles como
        cuidado de ancianos y niñería. Subí una foto de tu cédula de identidad — un moderador la revisa
        manualmente.
      </Text>

      {request?.estado === 'rechazado' && (
        <View style={styles.rejectedBanner}>
          <Text style={styles.rejectedText}>
            Tu solicitud anterior fue rechazada{request.motivoRechazo ? `: ${request.motivoRechazo}` : '.'} Podés
            volver a intentarlo.
          </Text>
        </View>
      )}

      <TextField label="Nombre completo (como figura en la cédula)" value={nombreCompleto} onChangeText={setNombreCompleto} />
      <TextField
        label="Número de cédula"
        keyboardType="numeric"
        value={numeroDocumento}
        onChangeText={setNumeroDocumento}
      />

      <Text style={styles.label}>Foto del frente de la cédula</Text>
      <ImagePickerBox uri={frenteUri} onPress={() => pickImage(setFrenteUri)} />

      <Text style={styles.label}>Foto del dorso (opcional)</Text>
      <ImagePickerBox uri={dorsoUri} onPress={() => pickImage(setDorsoUri)} />

      <Button label="Enviar para revisión" onPress={handleSubmit} loading={submitting} style={styles.submitButton} />
    </ScreenContainer>
  );
}

function ImagePickerBox({ uri, onPress }: { uri: string | null; onPress: () => void }) {
  return (
    <Pressable style={styles.imageBox} onPress={onPress}>
      {uri ? (
        <Image source={{ uri }} style={styles.imagePreview} />
      ) : (
        <Text style={styles.imagePlaceholder}>Tocá para subir una foto</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  intro: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  rejectedBanner: {
    backgroundColor: '#FEE2E2',
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  rejectedText: {
    color: colors.danger,
    fontSize: 13,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  imageBox: {
    height: 140,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    color: colors.textMuted,
    fontSize: 13,
  },
  submitButton: {
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  statusBlock: {
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  statusText: {
    fontSize: 15,
    color: colors.text,
    textAlign: 'center',
  },
});
