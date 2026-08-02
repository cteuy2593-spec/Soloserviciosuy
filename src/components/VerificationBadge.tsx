import { StyleSheet, Text, View } from 'react-native';
import type { VerificationStatus } from '../types';
import { colors, radius, spacing } from '../theme/colors';

const CONFIG: Record<VerificationStatus, { label: string; bg: string; fg: string }> = {
  verificado: { label: '✓ Verificado', bg: '#DCFCE7', fg: colors.success },
  pendiente: { label: 'Verificación pendiente', bg: '#FEF3C7', fg: colors.warning },
  rechazado: { label: 'Verificación rechazada', bg: '#FEE2E2', fg: colors.danger },
  sin_verificar: { label: 'Sin verificar', bg: colors.surface, fg: colors.textMuted },
};

export function VerificationBadge({ status }: { status: VerificationStatus }) {
  const config = CONFIG[status];
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.text, { color: config.fg }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
  },
});
