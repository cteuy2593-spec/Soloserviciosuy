import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../src/components/Button';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { TextField } from '../../src/components/TextField';
import { CATEGORIES, DEPARTAMENTOS_UY, type CategoryId, type Departamento } from '../../src/constants/categories';
import { createListing } from '../../src/services/listings';
import { useAuthStore } from '../../src/store/authStore';
import { colors, radius, spacing } from '../../src/theme/colors';
import type { ListingType } from '../../src/types';

export default function CreateListingScreen() {
  const profile = useAuthStore((s) => s.profile);
  const [tipo, setTipo] = useState<ListingType>('oferta');
  const [categoria, setCategoria] = useState<CategoryId>('limpieza_hogar');
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precioDesde, setPrecioDesde] = useState('');
  const [precioHasta, setPrecioHasta] = useState('');
  const [departamento, setDepartamento] = useState<Departamento>(profile?.departamento ?? 'Montevideo');
  const [barrio, setBarrio] = useState(profile?.barrio ?? '');
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!profile) return;
    if (!titulo.trim() || !descripcion.trim()) {
      Alert.alert('Faltan datos', 'Completá un título y una descripción.');
      return;
    }

    setSaving(true);
    try {
      const id = await createListing({
        autorUid: profile.uid,
        autorNombre: profile.nombre,
        autorFotoUrl: profile.fotoUrl,
        autorCalificacion: profile.calificacionPromedio,
        tipo,
        categoria,
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        precioDesde: precioDesde ? Number(precioDesde) : undefined,
        precioHasta: precioHasta ? Number(precioHasta) : undefined,
        departamento,
        barrio: barrio.trim() || undefined,
      });
      router.replace(`/service/${id}`);
    } catch {
      Alert.alert('No pudimos publicar', 'Intentá nuevamente.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScreenContainer scroll>
      <Stack.Screen options={{ headerShown: true, title: 'Publicar servicio' }} />

      <Text style={styles.label}>¿Qué querés publicar?</Text>
      <View style={styles.row}>
        <Pressable style={[styles.toggle, tipo === 'oferta' && styles.toggleSelected]} onPress={() => setTipo('oferta')}>
          <Text style={[styles.toggleLabel, tipo === 'oferta' && styles.toggleLabelSelected]}>Ofrezco un servicio</Text>
        </Pressable>
        <Pressable
          style={[styles.toggle, tipo === 'solicitud' && styles.toggleSelected]}
          onPress={() => setTipo('solicitud')}
        >
          <Text style={[styles.toggleLabel, tipo === 'solicitud' && styles.toggleLabelSelected]}>
            Busco a alguien
          </Text>
        </Pressable>
      </View>

      <Text style={styles.label}>Categoría</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
        {CATEGORIES.map((cat) => (
          <Pressable
            key={cat.id}
            style={[styles.chip, categoria === cat.id && styles.chipSelected]}
            onPress={() => setCategoria(cat.id)}
          >
            <Text style={[styles.chipLabel, categoria === cat.id && styles.chipLabelSelected]}>
              {cat.icon} {cat.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <TextField label="Título" placeholder="Ej: Limpieza profunda de apartamento" value={titulo} onChangeText={setTitulo} />
      <TextField
        label="Descripción"
        placeholder="Contá detalles: experiencia, disponibilidad, qué incluye..."
        multiline
        numberOfLines={5}
        value={descripcion}
        onChangeText={setDescripcion}
      />

      <View style={styles.row}>
        <TextField
          label="Precio desde ($U)"
          placeholder="500"
          keyboardType="numeric"
          value={precioDesde}
          onChangeText={setPrecioDesde}
          style={styles.flexInput}
        />
        <TextField
          label="Precio hasta ($U, opcional)"
          placeholder="1500"
          keyboardType="numeric"
          value={precioHasta}
          onChangeText={setPrecioHasta}
          style={styles.flexInput}
        />
      </View>

      <Text style={styles.label}>Departamento</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
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

      <Button label="Publicar" onPress={handleSubmit} loading={saving} style={styles.submitButton} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  flexInput: {
    flex: 1,
  },
  toggle: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
  },
  toggleSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  toggleLabel: {
    fontWeight: '600',
    color: colors.text,
    fontSize: 13,
  },
  toggleLabelSelected: {
    color: colors.primaryDark,
  },
  chipRow: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  chipLabelSelected: {
    color: colors.white,
  },
  submitButton: {
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
});
