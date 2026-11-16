import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { useSession } from '@/context/SessionContext';
import { ApiError, api } from '@/services/api';
import { colors } from '@/theme/colors';

export default function Index() {
  const { user, loading } = useSession();
  const [destination, setDestination] = useState<'tabs' | 'onboarding' | null>(null);
  const [error, setError] = useState('');
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (loading || !user) return;
    setError('');
    setDestination(null);
    api.getFinancialProfile(user.id)
      .then(() => setDestination('tabs'))
      .catch((requestError) => {
        if (requestError instanceof ApiError && requestError.status === 404) {
          setDestination('onboarding');
        } else {
          setError(requestError instanceof Error ? requestError.message : 'Não foi possível conectar ao servidor.');
        }
      });
  }, [user, loading, retryKey]);

  if (loading || (user && !destination && !error)) {
    return (
      <View style={styles.loading}>
        <View style={styles.logo}><Text style={styles.logoText}>F</Text></View>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.loadingText}>Facilita Finanças</Text>
      </View>
    );
  }

  if (!user) return <Redirect href="/(auth)/login" />;

  if (error) {
    return (
      <View style={styles.loading}>
        <View style={styles.logo}><Text style={styles.logoText}>F</Text></View>
        <Text style={styles.errorTitle}>Servidor indisponível</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retry} onPress={() => setRetryKey((value) => value + 1)}>
          <Text style={styles.retryText}>Tentar novamente</Text>
        </Pressable>
      </View>
    );
  }
  return <Redirect href={destination === 'onboarding' ? '/onboarding' : '/(tabs)'} />;
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: colors.background },
  logo: { width: 62, height: 62, borderRadius: 20, backgroundColor: colors.primaryDark, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  logoText: { color: colors.white, fontSize: 30, fontWeight: '900' },
  loadingText: { color: colors.textMuted, fontWeight: '800', fontSize: 12 },
  errorTitle: { color: colors.text, fontWeight: '900', fontSize: 18, marginTop: 4 },
  errorText: { color: colors.textMuted, textAlign: 'center', lineHeight: 19, paddingHorizontal: 24, maxWidth: 420 },
  retry: { minHeight: 48, paddingHorizontal: 22, borderRadius: 12, backgroundColor: colors.primaryDark, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  retryText: { color: colors.white, fontWeight: '900' },
});
