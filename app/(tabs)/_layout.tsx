import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { colors } from '../../src/theme/colors';

function TabIcon({ icon }: { icon: string }) {
  return <Text style={{ fontSize: 20 }}>{icon}</Text>;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Inicio', tabBarIcon: () => <TabIcon icon="🏠" /> }}
      />
      <Tabs.Screen
        name="search"
        options={{ title: 'Buscar', tabBarIcon: () => <TabIcon icon="🔍" /> }}
      />
      <Tabs.Screen
        name="messages"
        options={{ title: 'Mensajes', tabBarIcon: () => <TabIcon icon="💬" /> }}
      />
      <Tabs.Screen
        name="bookings"
        options={{ title: 'Reservas', tabBarIcon: () => <TabIcon icon="📅" /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Perfil', tabBarIcon: () => <TabIcon icon="👤" /> }}
      />
    </Tabs>
  );
}
