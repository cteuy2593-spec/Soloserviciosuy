import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

interface RatingStarsProps {
  value: number; // 0-5, admite decimales para solo lectura
  onChange?: (value: number) => void;
  size?: number;
  showValue?: boolean;
}

export function RatingStars({ value, onChange, size = 20, showValue = false }: RatingStarsProps) {
  const editable = !!onChange;
  const stars = [1, 2, 3, 4, 5];

  return (
    <View style={styles.row}>
      {stars.map((star) => {
        const filled = star <= Math.round(value);
        const StarComp = editable ? Pressable : Text;
        return (
          <StarComp key={star} onPress={editable ? () => onChange?.(star) : undefined}>
            <Text style={{ fontSize: size, color: filled ? colors.accent : colors.border }}>★</Text>
          </StarComp>
        );
      })}
      {showValue && <Text style={styles.value}>{value.toFixed(1)}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  value: {
    marginLeft: 6,
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '600',
  },
});
