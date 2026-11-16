import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { Button, Card, Field, Message } from '@/components/UI';
import { useSession } from '@/context/SessionContext';
import { ApiError, api } from '@/services/api';
import { colors } from '@/theme/colors';
import { radius } from '@/theme/layout';
import { ensureDefaultCategories } from '@/utils/defaultCategories';
import { parseMoneyInput } from '@/utils/format';

export default function OnboardingScreen() {
  const router = useRouter();
  const { user } = useSession();
  const [income, setIncome] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleStart() {
    if (!user) return;
    const value = parseMoneyInput(income);
    if (!Number.isFinite(value) || value < 0) return setError('Informe uma renda válida.');
    setLoading(true);
    setError('');
    try {
      try {
        await api.createFinancialProfile({ user_id: user.id, monthly_income: value });
      } catch (err) {
        if (err instanceof ApiError && err.status === 400) {
          await api.updateFinancialProfile(user.id, { monthly_income: value });
        } else {
          throw err;
        }
      }
      await ensureDefaultCategories(user.id).catch(() => []);
      router.replace('/(tabs)');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível concluir a configuração.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.step}>PRIMEIRO ACESSO</Text>
        <Text style={styles.title}>Olá, {user?.name?.split(' ')[0] || 'usuário'} 👋</Text>
        <Text style={styles.subtitle}>Vamos deixar seu resumo financeiro pronto em poucos segundos.</Text>
      </View>
      <Card>
        <Text style={styles.cardTitle}>Qual é sua renda mensal?</Text>
        <Text style={styles.cardText}>Você poderá alterar esse valor depois na aba Perfil.</Text>
        <Field label="Renda mensal" keyboardType="decimal-pad" value={income} onChangeText={setIncome} placeholder="Ex.: 2500,00" />
        <Message text={error} />
        <Button title="Começar a organizar minhas finanças" onPress={handleStart} loading={loading} />
      </Card>
      <View style={styles.hint}>
        <Text style={styles.hintTitle}>Categorias prontas</Text>
        <Text style={styles.hintText}>Alimentação, Moradia, Transporte, Saúde, Lazer e outras serão criadas automaticamente.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 18 },
  hero: { backgroundColor: colors.primaryDark, borderRadius: radius.lg, padding: 22 },
  step: { color: '#B7E5C2', fontWeight: '900', fontSize: 10, letterSpacing: 1.1 },
  title: { color: colors.white, fontWeight: '900', fontSize: 27, marginTop: 7 },
  subtitle: { color: '#CBE0D0', lineHeight: 20, fontSize: 13, marginTop: 6 },
  cardTitle: { color: colors.text, fontSize: 18, fontWeight: '900' },
  cardText: { color: colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: -3 },
  hint: { backgroundColor: colors.primarySoft, borderWidth: 1, borderColor: '#CFE1D3', borderRadius: radius.md, padding: 15 },
  hintTitle: { color: colors.primaryDark, fontSize: 13, fontWeight: '900' },
  hintText: { color: '#68776C', fontSize: 11, lineHeight: 17, marginTop: 4 },
});
