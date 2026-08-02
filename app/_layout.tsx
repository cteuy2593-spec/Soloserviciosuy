import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '../src/theme/colors';
import { subscribeToAuthState, subscribeToUserProfile } from '../src/services/users';
import { useAuthStore } from '../src/store/authStore';

export default function RootLayout() {
  const setFirebaseUid = useAuthStore((s) => s.setFirebaseUid);
  const setProfile = useAuthStore((s) => s.setProfile);
  const setInitializing = useAuthStore((s) => s.setInitializing);
  const initializing = useAuthStore((s) => s.initializing);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | undefined;

    const unsubscribeAuth = subscribeToAuthState((user) => {
      unsubscribeProfile?.();
      if (user) {
        setFirebaseUid(user.uid);
        unsubscribeProfile = subscribeToUserProfile(user.uid, (profile) => {
          setProfile(profile);
          setInitializing(false);
        });
      } else {
        setFirebaseUid(null);
        setProfile(null);
        setInitializing(false);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeProfile?.();
    };
  }, [setFirebaseUid, setProfile, setInitializing]);

  if (initializing) {
    return (
      <SafeAreaProvider>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
