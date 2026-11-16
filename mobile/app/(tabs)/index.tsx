import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card, Message } from '@/components/UI';
import { useSession } from '@/context/SessionContext';
import { ApiError, api } from '@/services/api';
import type { Category, Entry, FinancialProfile } from '@/services/types';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/layout';
import { calculateDashboard } from '@/utils/finance';
import { formatCurrency, formatDate, normalizeType } from '@/utils/format';

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useSession();
  const [profile, setProfile] = useState<FinancialProfile | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const [cats, ents] = await Promise.all([api.getCategories(user.id), api.getEntries(user.id)]);
      setCategories(cats);
      setEntries(ents);
      try {
        setProfile(await api.getFinancialProfile(user.id));
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) setProfile(null);
        else throw err;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dashboard.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(useCallback(() => { load(); }, [load]));
  const data = calculateDashboard(profile, entries, categories);
  const firstName = user?.name?.trim().split(' ')[0] || 'usuário';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.root}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} colors={[colors.primary]} />}
      >
        <View style={styles.hero}>
          <View style={styles.heroCircleOne} />
          <View style={styles.heroCircleTwo} />
          <Text style={styles.eyebrow}>FACILITA FINANÇAS</Text>
          <Text style={styles.greeting}>Olá, {firstName} 👋</Text>
          <Text style={styles.heroSubtitle}>Seu resumo financeiro deste mês</Text>
          <View style={styles.balanceBox}>
            <Text style={styles.balanceLabel}>Saldo estimado</Text>
            <Text style={styles.balanceValue}>{formatCurrency(data.balance)}</Text>
          </View>
        </View>

        <Message text={error} />

        <View style={styles.quickGrid}>
          <QuickAction title="Lançamentos" subtitle="Ver e adicionar" symbol="＋" onPress={() => router.push('/(tabs)/entries')} />
          <QuickAction title="Categorias" subtitle="Organizar gastos" symbol="▦" onPress={() => router.push('/(tabs)/categories')} />
          <QuickAction title="Minha renda" subtitle="Alterar valor" symbol="R$" onPress={() => router.push('/(tabs)/profile')} />
          <QuickAction title="Atualizar" subtitle="Recarregar dados" symbol="↻" onPress={load} />
        </View>

        <View style={styles.grid}>
          <Summary label="Renda mensal" value={formatCurrency(data.monthlyIncome)} accent={colors.primaryDark} />
          <Summary label="Receitas extras" value={formatCurrency(data.extraIncome)} accent={colors.success} />
          <Summary label="Despesas" value={formatCurrency(data.expenses)} accent={colors.danger} />
          <Summary label="Lançamentos" value={String(entries.length)} accent={colors.text} />
        </View>

        <View style={styles.sectionWrap}>
        <Card>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Maiores despesas</Text>
            <Pressable onPress={() => router.push('/(tabs)/entries')}><Text style={styles.sectionLink}>Ver todas</Text></Pressable>
          </View>
          {data.topExpenses.length ? data.topExpenses.map(([name, value]) => (
            <View key={name} style={styles.row}>
              <View style={styles.categoryDot} />
              <Text style={styles.rowText}>{name}</Text>
              <Text style={styles.rowValue}>{formatCurrency(value)}</Text>
            </View>
          )) : <Text style={styles.empty}>Nenhuma despesa neste mês.</Text>}
        </Card>
        </View>

        <View style={styles.sectionWrap}>
        <Card>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Últimos lançamentos</Text>
            <Pressable onPress={() => router.push('/(tabs)/entries')}><Text style={styles.sectionLink}>Abrir</Text></Pressable>
          </View>
          {data.recentEntries.length ? data.recentEntries.map((entry) => {
            const type = normalizeType(entry.entry_type);
            return (
              <View key={entry.id} style={styles.entry}>
                <View style={[styles.entryMark, type === 'receita' ? styles.entryMarkIncome : styles.entryMarkExpense]}>
                  <Text style={type === 'receita' ? styles.entryMarkIncomeText : styles.entryMarkExpenseText}>{type === 'receita' ? '↑' : '↓'}</Text>
                </View>
                <View style={styles.entryCopy}>
                  <Text style={styles.rowText} numberOfLines={1}>{entry.description || 'Lançamento'}</Text>
                  <Text style={styles.meta}>{formatDate(entry.entry_date)}</Text>
                </View>
                <Text style={[styles.entryAmount, { color: type === 'receita' ? colors.success : colors.danger }]}>
                  {type === 'receita' ? '+' : '-'} {formatCurrency(entry.amount)}
                </Text>
              </View>
            );
          }) : <Text style={styles.empty}>Seu histórico aparecerá aqui.</Text>}
        </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function QuickAction({ title, subtitle, symbol, onPress }: { title: string; subtitle: string; symbol: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.quickAction, pressed && { opacity: 0.78 }]}>
      <View style={styles.quickIcon}><Text style={styles.quickIconText}>{symbol}</Text></View>
      <Text style={styles.quickTitle}>{title}</Text>
      <Text style={styles.quickSubtitle}>{subtitle}</Text>
    </Pressable>
  );
}

function Summary({ label, value, accent = colors.text }: { label: string; value: string; accent?: string }) {
  return (
    <View style={styles.summary}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryValue, { color: accent }]} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primaryDark },
  root: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 110, gap: spacing.md },
  hero: {
    backgroundColor: colors.primaryDark,
    paddingHorizontal: spacing.md,
    paddingTop: 18,
    paddingBottom: 24,
    overflow: 'hidden',
  },
  heroCircleOne: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: '#FFFFFF0B', right: -55, top: -60 },
  heroCircleTwo: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: '#FFFFFF08', right: 70, bottom: -55 },
  eyebrow: { color: '#B7E5C2', fontSize: 10, letterSpacing: 1.2, fontWeight: '900' },
  greeting: { color: colors.white, fontSize: 27, fontWeight: '900', marginTop: 6, letterSpacing: -0.6 },
  heroSubtitle: { color: '#CBE0D0', fontSize: 13, marginTop: 4 },
  balanceBox: { marginTop: 20, backgroundColor: '#FFFFFF12', borderWidth: 1, borderColor: '#FFFFFF1F', borderRadius: radius.md, padding: 15 },
  balanceLabel: { color: '#CBE0D0', fontSize: 12, fontWeight: '700' },
  balanceValue: { color: colors.white, fontSize: 29, fontWeight: '900', marginTop: 4, letterSpacing: -0.7 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: spacing.md },
  quickAction: { width: '48%', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: 14, minHeight: 112 },
  quickIcon: { width: 36, height: 36, borderRadius: 11, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  quickIconText: { color: colors.primaryDark, fontWeight: '900', fontSize: 15 },
  quickTitle: { color: colors.text, fontWeight: '900', fontSize: 14 },
  quickSubtitle: { color: colors.textMuted, fontSize: 11, marginTop: 3 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: spacing.md },
  summary: { width: '48%', minHeight: 94, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: 14, justifyContent: 'space-between' },
  summaryLabel: { color: colors.textMuted, fontWeight: '700', fontSize: 12 },
  summaryValue: { fontSize: 20, fontWeight: '900' },
  sectionWrap: { paddingHorizontal: spacing.md },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '900', color: colors.text },
  sectionLink: { color: colors.primary, fontSize: 12, fontWeight: '900' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 9, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  categoryDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#C16666', marginRight: 10 },
  rowText: { flex: 1, color: colors.text, fontWeight: '800' },
  rowValue: { color: colors.danger, fontWeight: '900' },
  entry: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  entryMark: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  entryMarkIncome: { backgroundColor: colors.successSoft },
  entryMarkExpense: { backgroundColor: colors.dangerSoft },
  entryMarkIncomeText: { color: colors.success, fontWeight: '900' },
  entryMarkExpenseText: { color: colors.danger, fontWeight: '900' },
  entryCopy: { flex: 1, minWidth: 0 },
  entryAmount: { fontWeight: '900', fontSize: 13 },
  meta: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  empty: { color: colors.textMuted, paddingVertical: 8 },
});
