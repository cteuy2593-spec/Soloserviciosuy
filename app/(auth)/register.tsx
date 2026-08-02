import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../src/components/Button';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { TextField } from '../../src/components/TextField';
import { registerUser } from '../../src/services/users';
import { colors, radius, spacing } from '../../src/theme/colors';
import type { UserRole } from '../../src/types';

const ROLE_OPTIONS: { value: UserRole; label: string; description: string }[] = [
  { value: 'cliente', label: 'Busco servicios', description: 'Quiero contratar ayuda' },
  { value: 'prestador', label: 'Ofrezco servicios', description: 'Quiero trabajar' },
  { value: 'ambos', label: 'Ambos', description: 'Busco y también ofrezco' },
];

export default function RegisterScreen() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rol, setRol] = useState<UserRole>('cliente');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!nombre || !email || !password) {
      Alert.alert('Faltan datos', 'Completá nombre, email y contraseña.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Contraseña muy corta', 'Usá al menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Las contraseñas no coinciden', 'Revisá que ambas contraseñas sean iguales.');
      return;
    }

    setLoading(true);
    try {
      await registerUser({ nombre: nombre.trim(), email: email.trim(), password, rol });
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('No pudimos crear tu cuenta', mapAuthError(error?.code));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer scroll>
      <Text style={styles.title}>Creá tu cuenta</Text>
      <Text style={styles.subtitle}>Unite al marketplace de servicios de Uruguay</Text>

      <TextField label="Nombre completo" placeholder="Ana Pérez" value={nombre} onChangeText={setNombre} />
      <TextField
        label="Email"
        placeholder="tu@email.com"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextField label="Contraseña" secureTextEntry value={password} onChangeText={setPassword} />
      <TextField
        label="Confirmar contraseña"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <Text style={styles.label}>¿Qué querés hacer?</Text>
      <View style={styles.roleGroup}>
        {ROLE_OPTIONS.map((option) => {
          const selected = rol === option.value;
          return (
            <Pressable
              key={option.value}
              style={[styles.roleCard, selected && styles.roleCardSelected]}
              onPress={() => setRol(option.value)}
            >
              <Text style={[styles.roleLabel, selected && styles.roleLabelSelected]}>{option.label}</Text>
              <Text style={styles.roleDescription}>{option.description}</Text>
            </Pressable>
          );
        })}
      </View>

      <Button label="Crear cuenta" onPress={handleRegister} loading={loading} style={styles.button} />

      <View style={styles.footer}>
        <Text style={styles.footerText}>¿Ya tenés cuenta?</Text>
        <Link href="/(auth)/login" style={styles.link}>
          Iniciá sesión
        </Link>
      </View>
    </ScreenContainer>
  );
}

function mapAuthError(code?: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'Ese email ya está registrado. Probá iniciar sesión.';
    case 'auth/invalid-email':
      return 'El email ingresado no es válido.';
    case 'auth/weak-password':
      return 'La contraseña es muy débil.';
    default:
      return 'Ocurrió un error. Intentá nuevamente.';
  }
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginTop: spacing.md,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  roleGroup: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  roleCard: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  roleCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  roleLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  roleLabelSelected: {
    color: colors.primaryDark,
  },
  roleDescription: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  button: {
    marginTop: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  footerText: {
    color: colors.textMuted,
  },
  link: {
    color: colors.primary,
    fontWeight: '700',
  },
});
