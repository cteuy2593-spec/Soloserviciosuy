import { Link } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../src/components/Button';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { TextField } from '../../src/components/TextField';
import { loginUser } from '../../src/services/users';
import { colors, spacing } from '../../src/theme/colors';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Faltan datos', 'Ingresá tu email y contraseña.');
      return;
    }
    setLoading(true);
    try {
      await loginUser(email.trim(), password);
      // La redirección a (tabs) ocurre automáticamente desde app/index.tsx
      // al detectar el cambio de sesión en el listener de auth del root layout.
    } catch (error: any) {
      Alert.alert('No pudimos iniciar sesión', mapAuthError(error?.code));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer scroll>
      <View style={styles.header}>
        <Text style={styles.logo}>🧰</Text>
        <Text style={styles.title}>SoloServiciosUY</Text>
        <Text style={styles.subtitle}>Servicios de confianza para tu hogar</Text>
      </View>

      <TextField
        label="Email"
        placeholder="tu@email.com"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextField
        label="Contraseña"
        placeholder="••••••••"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Button label="Iniciar sesión" onPress={handleLogin} loading={loading} style={styles.button} />

      <View style={styles.footer}>
        <Text style={styles.footerText}>¿No tenés cuenta?</Text>
        <Link href="/(auth)/register" style={styles.link}>
          Registrate
        </Link>
      </View>
    </ScreenContainer>
  );
}

function mapAuthError(code?: string): string {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Email o contraseña incorrectos.';
    case 'auth/invalid-email':
      return 'El email ingresado no es válido.';
    case 'auth/too-many-requests':
      return 'Demasiados intentos. Probá de nuevo en unos minutos.';
    default:
      return 'Ocurrió un error. Intentá nuevamente.';
  }
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  logo: {
    fontSize: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginTop: spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  button: {
    marginTop: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.lg,
  },
  footerText: {
    color: colors.textMuted,
  },
  link: {
    color: colors.primary,
    fontWeight: '700',
  },
});
