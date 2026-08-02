import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';

export default function Index() {
  const firebaseUid = useAuthStore((s) => s.firebaseUid);
  return <Redirect href={firebaseUid ? '/(tabs)' : '/(auth)/login'} />;
}
