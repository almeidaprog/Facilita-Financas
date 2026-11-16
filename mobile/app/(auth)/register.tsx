import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { Button, Card, Field, Message } from '@/components/UI';
import { useSession } from '@/context/SessionContext';
import { api } from '@/services/api';
import { colors } from '@/theme/colors';
import { radius } from '@/theme/layout';
import { ensureDefaultCategories } from '@/utils/defaultCategories';

export default function RegisterScreen() {
  const router = useRouter();
  const { signIn } = useSession();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!name.trim() || !email.trim() || !password) return setError('Preencha todos os campos.');
    if (password.length < 6) return setError('Use uma senha com pelo menos 6 caracteres.');
    if (password !== confirm) return setError('As senhas não coincidem.');
    setLoading(true);
    setError('');
    try {
      const user = await api.createUser({ name: name.trim(), email: email.trim(), password });
      await ensureDefaultCategories(user.id).catch(() => []);
      await signIn(user);
      router.replace('/onboarding');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível criar a conta.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.brandStrip}>
        <Text style={styles.brand}>Facilita Finanças</Text>
        <Text style={styles.brandText}>Crie sua conta e comece com o essencial.</Text>
      </View>
      <Card>
        <Text style={styles.formTitle}>Criar conta</Text>
        <Field label="Nome" value={name} onChangeText={setName} placeholder="Seu nome" />
        <Field label="E-mail" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} placeholder="voce@email.com" />
        <Field label="Senha" secureTextEntry value={password} onChangeText={setPassword} placeholder="Mínimo de 6 caracteres" />
        <Field label="Confirmar senha" secureTextEntry value={confirm} onChangeText={setConfirm} placeholder="Repita a senha" />
        <Message text={error} />
        <Button title="Criar conta" onPress={handleRegister} loading={loading} />
        <Text style={styles.helper}>Já tem conta? <Link href="/(auth)/login" style={styles.link}>Entrar</Link></Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 18 },
  brandStrip: { backgroundColor: colors.primaryDark, borderRadius: radius.md, padding: 20, gap: 5 },
  brand: { color: colors.white, fontSize: 24, fontWeight: '900' },
  brandText: { color: '#CBE0D0', fontSize: 13 },
  formTitle: { color: colors.text, fontSize: 21, fontWeight: '900' },
  helper: { textAlign: 'center', color: colors.textMuted },
  link: { color: colors.primaryDark, fontWeight: '900' },
});
