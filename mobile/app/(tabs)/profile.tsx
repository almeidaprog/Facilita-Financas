import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { Button, Card, Field, Message, PageHeader } from '@/components/UI';
import { useSession } from '@/context/SessionContext';
import { ApiError, API_URL, api } from '@/services/api';
import { colors } from '@/theme/colors';
import { radius } from '@/theme/layout';
import { parseMoneyInput } from '@/utils/format';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useSession();
  const [income, setIncome] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const profile = await api.getFinancialProfile(user.id);
      setIncome(String(profile.monthly_income));
    } catch (err) {
      if (!(err instanceof ApiError && err.status === 404)) setError(err instanceof Error ? err.message : 'Erro ao carregar perfil.');
    }
  }, [user]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function save() {
    if (!user) return;
    const value = parseMoneyInput(income);
    if (!Number.isFinite(value) || value < 0) return setError('Informe uma renda válida.');
    setSaving(true);
    setError('');
    setMessage('');
    try {
      try {
        await api.updateFinancialProfile(user.id, { monthly_income: value });
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) await api.createFinancialProfile({ user_id: user.id, monthly_income: value });
        else throw err;
      }
      setMessage('Renda mensal atualizada.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar renda.');
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    await signOut();
    router.replace('/(auth)/login');
  }

  return (
    <Screen>
      <PageHeader title="Perfil" subtitle="Seus dados e preferências financeiras." />
      <View style={styles.identity}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{user?.name?.trim().charAt(0).toUpperCase() || 'U'}</Text></View>
        <View style={styles.identityCopy}>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>
      </View>
      <Card>
        <Text style={styles.sectionTitle}>Renda mensal</Text>
        <Text style={styles.sectionText}>Esse valor é usado para calcular seu saldo estimado no Dashboard.</Text>
        <Field label="Valor" keyboardType="decimal-pad" value={income} onChangeText={setIncome} placeholder="0,00" />
        <Message text={error} />
        <Message text={message} type="success" />
        <Button title="Salvar renda" onPress={save} loading={saving} />
      </Card>
      <Card>
        <Text style={styles.serverTitle}>Conexão com a API</Text>
        <Text style={styles.server} numberOfLines={1}>{API_URL}</Text>
        <Text style={styles.note}>Se o app não carregar dados, confira se o FastAPI está rodando no computador.</Text>
      </Card>
      <Button title="Sair da conta" kind="danger" onPress={logout} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  identity: { backgroundColor: colors.primaryDark, borderRadius: radius.md, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 13 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#DCEADF', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.primaryDark, fontSize: 20, fontWeight: '900' },
  identityCopy: { flex: 1 },
  name: { fontSize: 18, fontWeight: '900', color: colors.white },
  email: { color: '#CBE0D0', marginTop: 3, fontSize: 12 },
  sectionTitle: { fontWeight: '900', color: colors.text, fontSize: 16 },
  sectionText: { color: colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: -3 },
  serverTitle: { fontWeight: '900', color: colors.text },
  server: { color: colors.primaryDark, fontWeight: '800', backgroundColor: colors.primarySoft, padding: 10, borderRadius: 9 },
  note: { color: colors.textMuted, fontSize: 12, lineHeight: 18 },
});
