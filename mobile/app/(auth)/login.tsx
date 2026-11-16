import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { Button, Card, Field, Message } from '@/components/UI';
import { useSession } from '@/context/SessionContext';
import { ApiError, api } from '@/services/api';
import { colors } from '@/theme/colors';
import { radius } from '@/theme/layout';
import { ensureDefaultCategories } from '@/utils/defaultCategories';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) return setError('Informe e-mail e senha.');
    setLoading(true);
    setError('');
    try {
      const result = await api.login({ email: email.trim(), password });
      let destination: '/(tabs)' | '/onboarding' = '/(tabs)';

      try {
        await api.getFinancialProfile(result.user.id);
        await ensureDefaultCategories(result.user.id).catch(() => []);
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) destination = '/onboarding';
        else throw err;
      }

      await signIn(result.user);
      router.replace(destination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.brandHero}>
        <Text style={styles.eyebrow}>FACILITA FINANÇAS</Text>
        <Text style={styles.heroTitle}>Seu dinheiro, sem complicação.</Text>
        <Text style={styles.heroText}>Acompanhe renda, despesas e categorias direto do celular.</Text>
      </View>
      <Card>
        <Text style={styles.formTitle}>Entrar</Text>
        <Text style={styles.formSubtitle}>Acesse sua conta para continuar.</Text>
        <Field label="E-mail" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} placeholder="voce@email.com" />
        <Field label="Senha" secureTextEntry value={password} onChangeText={setPassword} placeholder="Sua senha" />
        <Message text={error} />
        <Button title="Entrar" onPress={handleLogin} loading={loading} />
        <Text style={styles.helper}>Ainda não tem conta? <Link href="/(auth)/register" style={styles.link}>Criar conta</Link></Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 18 },
  brandHero: { backgroundColor: colors.primaryDark, borderRadius: radius.lg, padding: 22, minHeight: 190, justifyContent: 'flex-end', overflow: 'hidden' },
  eyebrow: { color: '#B7E5C2', fontSize: 10, letterSpacing: 1.2, fontWeight: '900' },
  heroTitle: { color: colors.white, fontSize: 29, lineHeight: 34, fontWeight: '900', letterSpacing: -0.7, marginTop: 8 },
  heroText: { color: '#CBE0D0', fontSize: 13, lineHeight: 19, marginTop: 7, maxWidth: 290 },
  formTitle: { color: colors.text, fontSize: 21, fontWeight: '900' },
  formSubtitle: { color: colors.textMuted, fontSize: 13, marginTop: -4, marginBottom: 4 },
  helper: { textAlign: 'center', color: colors.textMuted, marginTop: 3 },
  link: { color: colors.primaryDark, fontWeight: '900' },
});
