import { Tabs } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/theme/colors';

const TabIcon = ({ symbol, focused }: { symbol: string; focused: boolean }) => (
  <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
    <Text style={[styles.icon, focused && styles.iconActive]}>{symbol}</Text>
  </View>
);

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 8);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primaryDark,
        tabBarInactiveTintColor: '#718077',
        tabBarHideOnKeyboard: true,
        tabBarStyle: [styles.tabBar, { height: 66 + bottomPadding, paddingBottom: bottomPadding }],
        tabBarItemStyle: styles.tabItem,
        tabBarLabelStyle: styles.label,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Início', tabBarIcon: ({ focused }) => <TabIcon symbol="⌂" focused={focused} /> }} />
      <Tabs.Screen name="entries" options={{ title: 'Lançamentos', tabBarIcon: ({ focused }) => <TabIcon symbol="↕" focused={focused} /> }} />
      <Tabs.Screen name="categories" options={{ title: 'Categorias', tabBarIcon: ({ focused }) => <TabIcon symbol="▦" focused={focused} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil', tabBarIcon: ({ focused }) => <TabIcon symbol="●" focused={focused} /> }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    paddingTop: 7,
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    elevation: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
  },
  tabItem: { paddingVertical: 2 },
  label: { fontSize: 10, fontWeight: '800', marginTop: 1 },
  iconWrap: { width: 34, height: 28, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  iconWrapActive: { backgroundColor: colors.primarySoft },
  icon: { fontSize: 18, color: '#718077', fontWeight: '800' },
  iconActive: { color: colors.primaryDark },
});
