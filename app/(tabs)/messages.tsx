import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Avatar } from '../../src/components/Avatar';
import { EmptyState } from '../../src/components/EmptyState';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { subscribeToMyThreads } from '../../src/services/chat';
import { useAuthStore } from '../../src/store/authStore';
import { colors, spacing } from '../../src/theme/colors';
import type { ChatThread } from '../../src/types';

export default function MessagesScreen() {
  const uid = useAuthStore((s) => s.firebaseUid);
  const [threads, setThreads] = useState<ChatThread[]>([]);

  useEffect(() => {
    if (!uid) return;
    return subscribeToMyThreads(uid, setThreads);
  }, [uid]);

  return (
    <ScreenContainer padded={false}>
      <Text style={styles.title}>Mensajes</Text>
      <FlatList
        data={threads}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState icon="💬" title="No tenés conversaciones" subtitle="Cuando contactes a alguien va a aparecer acá." />
        }
        renderItem={({ item }) => {
          const otherUid = item.participantes.find((p) => p !== uid) ?? '';
          const otherInfo = item.participantesInfo?.[otherUid];
          return (
            <Pressable style={styles.row} onPress={() => router.push(`/chat/${item.id}`)}>
              <Avatar nombre={otherInfo?.nombre ?? 'Usuario'} fotoUrl={otherInfo?.fotoUrl} />
              <View style={styles.rowText}>
                <Text style={styles.name}>{otherInfo?.nombre ?? 'Usuario'}</Text>
                <Text style={styles.lastMessage} numberOfLines={1}>
                  {item.ultimoMensaje ?? 'Conversación iniciada'}
                </Text>
              </View>
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
    paddingBottom: 0,
  },
  listContent: {
    padding: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowText: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  lastMessage: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
});
