import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Animated, Modal, PanResponder, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Card, Chip, Field, Message, PageHeader, Title } from '@/components/UI';
import { useSession } from '@/context/SessionContext';
import { api } from '@/services/api';
import type { Category, Entry, FinancialType } from '@/services/types';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/layout';
import { formatCurrency, formatDate, isValidISODate, normalizeType, parseMoneyInput, todayISO } from '@/utils/format';

export default function EntriesScreen() {
  const { user } = useSession();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filter, setFilter] = useState<'todos' | FinancialType>('todos');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Entry | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!user) return;
    setError('');
    try {
      const [e, c] = await Promise.all([api.getEntries(user.id), api.getCategories(user.id)]);
      setEntries(e);
      setCategories(c);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar lançamentos.');
    }
  }, [user]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const visible = useMemo(
    () => entries.filter((entry) => filter === 'todos' || normalizeType(entry.entry_type) === filter),
    [entries, filter],
  );

  function startEdit(entry: Entry) {
    setEditing(entry);
    setOpen(true);
  }

  function startNew() {
    setEditing(null);
    setOpen(true);
  }

  function remove(entry: Entry) {
    Alert.alert('Excluir lançamento?', entry.description || 'Este lançamento será removido.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.deleteEntry(entry.id);
            await load();
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao excluir.');
          }
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.root}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <PageHeader
            title="Lançamentos"
            subtitle="Receitas e despesas em um só lugar."
            action={<Pressable onPress={startNew} style={styles.headerAdd}><Text style={styles.headerAddText}>＋ Novo</Text></Pressable>}
          />
          <Message text={error} />
          <View style={styles.chips}>
            <Chip label="Todos" active={filter === 'todos'} onPress={() => setFilter('todos')} />
            <Chip label="Despesas" active={filter === 'despesa'} onPress={() => setFilter('despesa')} />
            <Chip label="Receitas" active={filter === 'receita'} onPress={() => setFilter('receita')} />
          </View>

          {visible.length ? visible.map((entry) => {
            const type = normalizeType(entry.entry_type);
            const category = categories.find((c) => Number(c.id) === Number(entry.category_id));
            return (
              <Card key={entry.id}>
                <View style={styles.entryTop}>
                  <View style={[styles.entryIcon, type === 'receita' ? styles.incomeIcon : styles.expenseIcon]}>
                    <Text style={type === 'receita' ? styles.incomeIconText : styles.expenseIconText}>{type === 'receita' ? '↑' : '↓'}</Text>
                  </View>
                  <View style={styles.entryCopy}>
                    <Text style={styles.entryTitle} numberOfLines={2}>{entry.description || 'Lançamento'}</Text>
                    <Text style={styles.meta}>{formatDate(entry.entry_date)} · {category?.name || 'Sem categoria'}</Text>
                  </View>
                  <Text style={[styles.amount, { color: type === 'receita' ? colors.success : colors.danger }]}>
                    {type === 'receita' ? '+' : '-'} {formatCurrency(entry.amount)}
                  </Text>
                </View>
                {entry.notes ? <Text style={styles.note}>{entry.notes}</Text> : null}
                <View style={styles.actions}>
                  <Pressable onPress={() => startEdit(entry)} style={styles.actionButton}><Text style={styles.action}>Editar</Text></Pressable>
                  <Pressable onPress={() => remove(entry)} style={styles.actionButton}><Text style={[styles.action, { color: colors.danger }]}>Excluir</Text></Pressable>
                </View>
              </Card>
            );
          }) : (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>Nenhum lançamento encontrado</Text>
              <Text style={styles.empty}>Toque em “Novo” para registrar sua primeira movimentação.</Text>
              <Button title="Adicionar lançamento" onPress={startNew} />
            </View>
          )}
        </ScrollView>

        <Pressable style={styles.fab} onPress={startNew}><Text style={styles.fabText}>＋</Text></Pressable>
        <EntryModal
          visible={open}
          onClose={() => setOpen(false)}
          userId={user?.id || 0}
          categories={categories}
          entry={editing}
          onSaved={async () => { setOpen(false); await load(); }}
        />
      </View>
    </SafeAreaView>
  );
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];
const WEEK_DAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

function isoToLocalDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1, 12, 0, 0);
}

function localDateToISO(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function shiftDays(days: number) {
  const value = new Date();
  value.setHours(12, 0, 0, 0);
  value.setDate(value.getDate() + days);
  return localDateToISO(value);
}

function getCalendarCells(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstWeekDay = new Date(year, month, 1, 12).getDay();
  const totalDays = new Date(year, month + 1, 0, 12).getDate();
  const cells: Array<number | null> = [];
  for (let index = 0; index < firstWeekDay; index += 1) cells.push(null);
  for (let day = 1; day <= totalDays; day += 1) cells.push(day);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function EntryModal({ visible, onClose, userId, categories, entry, onSaved }: { visible: boolean; onClose: () => void; userId: number; categories: Category[]; entry: Entry | null; onSaved: () => Promise<void> }) {
  const insets = useSafeAreaInsets();
  const initialType = entry ? normalizeType(entry.entry_type) : 'despesa';
  const [type, setType] = useState<FinancialType>(initialType);
  const [description, setDescription] = useState(entry?.description || '');
  const [amount, setAmount] = useState(entry ? String(entry.amount) : '');
  const [date, setDate] = useState(entry?.entry_date || todayISO());
  const [notes, setNotes] = useState(entry?.notes || '');
  const [categoryId, setCategoryId] = useState<number | null>(entry?.category_id ?? null);
  const [newCategory, setNewCategory] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => isoToLocalDate(entry?.entry_date || todayISO()));
  const translateY = useRef(new Animated.Value(0)).current;

  const closeWithReset = useCallback(() => {
    setCalendarOpen(false);
    translateY.setValue(0);
    onClose();
  }, [onClose, translateY]);

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gesture) => gesture.dy > 4 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
    onPanResponderMove: (_, gesture) => {
      if (gesture.dy > 0) translateY.setValue(gesture.dy);
    },
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dy > 90 || gesture.vy > 1.1) {
        Animated.timing(translateY, {
          toValue: 700,
          duration: 180,
          useNativeDriver: true,
        }).start(closeWithReset);
      } else {
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 4,
        }).start();
      }
    },
    onPanResponderTerminate: () => {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 4,
      }).start();
    },
  }), [closeWithReset, translateY]);

  useEffect(() => {
    if (!visible) return;
    const nextDate = entry?.entry_date || todayISO();
    setType(entry ? normalizeType(entry.entry_type) : 'despesa');
    setDescription(entry?.description || '');
    setAmount(entry ? String(entry.amount) : '');
    setDate(nextDate);
    setCalendarMonth(isoToLocalDate(nextDate));
    setCalendarOpen(false);
    setNotes(entry?.notes || '');
    setCategoryId(entry?.category_id ?? null);
    setNewCategory('');
    setError('');
    translateY.setValue(0);
  }, [visible, entry, translateY]);

  const filtered = categories.filter((c) => normalizeType(c.category_type) === type);
  const selectedDate = isoToLocalDate(date);
  const calendarCells = getCalendarCells(calendarMonth);
  const isToday = date === todayISO();
  const isYesterday = date === shiftDays(-1);

  function chooseQuickDate(value: string) {
    setDate(value);
    setCalendarMonth(isoToLocalDate(value));
    setCalendarOpen(false);
  }

  function changeMonth(delta: number) {
    setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1, 12));
  }

  function chooseCalendarDay(day: number) {
    const value = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day, 12);
    setDate(localDateToISO(value));
    setCalendarOpen(false);
  }

  async function save() {
    const numeric = parseMoneyInput(amount);
    if (!Number.isFinite(numeric) || numeric <= 0) return setError('Informe um valor maior que zero.');
    if (!isValidISODate(date)) return setError('Selecione uma data válida.');
    setSaving(true);
    setError('');
    try {
      let selected = categoryId;
      if (newCategory.trim()) {
        const created = await api.createCategory({ user_id: userId, name: newCategory.trim(), category_type: type });
        selected = created.id;
      }
      const payload = {
        category_id: selected,
        description: description.trim() || null,
        amount: numeric,
        entry_type: type,
        entry_date: date,
        notes: notes.trim() || null,
      };
      if (entry) await api.updateEntry(entry.id, payload);
      else await api.createEntry({ user_id: userId, ...payload });
      await onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar lançamento.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={closeWithReset}>
      <View style={styles.backdrop}>
        <Animated.View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom + 10, 18), transform: [{ translateY }] }]}>
          <View style={styles.dragArea} {...panResponder.panHandlers}>
            <View style={styles.sheetHandle} />
          </View>
          <ScrollView contentContainerStyle={styles.sheetContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Title subtitle="Preencha só o necessário.">{entry ? 'Editar lançamento' : 'Novo lançamento'}</Title>
            <View style={styles.chips}>
              <Chip label="Despesa" active={type === 'despesa'} onPress={() => { setType('despesa'); setCategoryId(null); }} />
              <Chip label="Receita" active={type === 'receita'} onPress={() => { setType('receita'); setCategoryId(null); }} />
            </View>
            <Field label="Descrição" value={description} onChangeText={setDescription} placeholder="Ex.: Mercado" />
            <Field label="Valor" keyboardType="decimal-pad" value={amount} onChangeText={setAmount} placeholder="0,00" />

            <Text style={styles.label}>Data</Text>
            <Pressable
              style={styles.dateSelector}
              onPress={() => {
                setCalendarMonth(selectedDate);
                setCalendarOpen((current) => !current);
              }}
            >
              <View>
                <Text style={styles.dateMain}>{isToday ? 'Hoje' : isYesterday ? 'Ontem' : formatDate(date)}</Text>
                {(isToday || isYesterday) ? <Text style={styles.dateSub}>{formatDate(date)}</Text> : null}
              </View>
              <Text style={styles.dateChange}>{calendarOpen ? 'Fechar' : 'Alterar'}</Text>
            </Pressable>

            <View style={styles.quickDates}>
              <Chip label="Hoje" active={isToday} onPress={() => chooseQuickDate(todayISO())} />
              <Chip label="Ontem" active={isYesterday} onPress={() => chooseQuickDate(shiftDays(-1))} />
            </View>

            {calendarOpen ? (
              <View style={styles.calendarBox}>
                <View style={styles.calendarHeader}>
                  <Pressable style={styles.calendarNav} onPress={() => changeMonth(-1)}><Text style={styles.calendarNavText}>‹</Text></Pressable>
                  <Text style={styles.calendarTitle}>{MONTH_NAMES[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}</Text>
                  <Pressable style={styles.calendarNav} onPress={() => changeMonth(1)}><Text style={styles.calendarNavText}>›</Text></Pressable>
                </View>
                <View style={styles.calendarGrid}>
                  {WEEK_DAYS.map((label, index) => <View key={`${label}-${index}`} style={styles.calendarCell}><Text style={styles.weekDay}>{label}</Text></View>)}
                  {calendarCells.map((day, index) => {
                    if (!day) return <View key={`empty-${index}`} style={styles.calendarCell} />;
                    const candidate = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day, 12);
                    const candidateISO = localDateToISO(candidate);
                    const selected = candidateISO === date;
                    const today = candidateISO === todayISO();
                    return (
                      <Pressable key={candidateISO} style={styles.calendarCell} onPress={() => chooseCalendarDay(day)}>
                        <View style={[styles.dayCircle, selected && styles.dayCircleSelected, !selected && today && styles.dayCircleToday]}>
                          <Text style={[styles.dayText, selected && styles.dayTextSelected]}>{day}</Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ) : null}

            <Text style={styles.label}>Categoria</Text>
            <View style={styles.chips}>
              <Chip label="Sem categoria" active={categoryId === null} onPress={() => setCategoryId(null)} />
              {filtered.map((c) => <Chip key={c.id} label={c.name} active={Number(categoryId) === Number(c.id)} onPress={() => setCategoryId(c.id)} />)}
            </View>
            <Field label="Criar nova categoria (opcional)" value={newCategory} onChangeText={setNewCategory} placeholder="Ex.: Academia" />
            <Field label="Observação (opcional)" value={notes} onChangeText={setNotes} multiline />
            <Message text={error} />
            <Button title={entry ? 'Salvar alterações' : 'Adicionar lançamento'} onPress={save} loading={saving} />
            <Button title="Cancelar" onPress={closeWithReset} kind="secondary" />
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primaryDark },
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: 115, gap: spacing.md },
  headerAdd: { minHeight: 42, paddingHorizontal: 13, borderRadius: 10, backgroundColor: colors.primaryDark, alignItems: 'center', justifyContent: 'center' },
  headerAddText: { color: colors.white, fontWeight: '900', fontSize: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  entryTop: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  entryIcon: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  incomeIcon: { backgroundColor: colors.successSoft },
  expenseIcon: { backgroundColor: colors.dangerSoft },
  incomeIconText: { color: colors.success, fontWeight: '900' },
  expenseIconText: { color: colors.danger, fontWeight: '900' },
  entryCopy: { flex: 1, minWidth: 0 },
  entryTitle: { fontWeight: '900', color: colors.text, fontSize: 15 },
  meta: { color: colors.textMuted, marginTop: 4, fontSize: 11 },
  amount: { fontWeight: '900', fontSize: 14, maxWidth: 115, textAlign: 'right' },
  note: { backgroundColor: '#F7F9F7', color: colors.textMuted, padding: 10, borderRadius: 10, fontSize: 12, lineHeight: 17 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, paddingTop: 10 },
  actionButton: { minHeight: 38, paddingHorizontal: 11, borderRadius: 9, backgroundColor: colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' },
  action: { color: colors.primaryDark, fontWeight: '900', fontSize: 12 },
  emptyBox: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: 24, gap: 10, alignItems: 'stretch' },
  emptyTitle: { color: colors.text, fontWeight: '900', fontSize: 16, textAlign: 'center' },
  empty: { color: colors.textMuted, textAlign: 'center', lineHeight: 19, marginBottom: 4 },
  fab: { position: 'absolute', right: 20, bottom: 22, width: 58, height: 58, borderRadius: 29, backgroundColor: colors.primaryDark, alignItems: 'center', justifyContent: 'center', elevation: 6, shadowColor: colors.shadow, shadowOpacity: 0.18, shadowRadius: 8 },
  fabText: { color: colors.white, fontSize: 30, lineHeight: 33 },
  backdrop: { flex: 1, backgroundColor: '#10201888', justifyContent: 'flex-end' },
  sheet: { maxHeight: '92%', backgroundColor: colors.background, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, paddingHorizontal: spacing.md, paddingTop: 8, paddingBottom: 18 },
  dragArea: { alignItems: 'center', justifyContent: 'center', paddingVertical: 7, marginHorizontal: -8 },
  dateSelector: { minHeight: 64, borderWidth: 1, borderColor: colors.border, borderRadius: 12, backgroundColor: colors.surface, paddingHorizontal: 14, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dateMain: { color: colors.text, fontSize: 15, fontWeight: '900' },
  dateSub: { color: colors.textMuted, fontSize: 12, marginTop: 3 },
  dateChange: { color: colors.primaryDark, fontWeight: '900', fontSize: 13 },
  quickDates: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  calendarBox: { borderWidth: 1, borderColor: colors.border, borderRadius: 14, backgroundColor: colors.surface, padding: 10, gap: 8 },
  calendarHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 42 },
  calendarNav: { width: 40, height: 40, borderRadius: 10, backgroundColor: colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' },
  calendarNavText: { color: colors.primaryDark, fontSize: 28, lineHeight: 30, fontWeight: '700' },
  calendarTitle: { color: colors.text, fontWeight: '900', fontSize: 14, textTransform: 'capitalize' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calendarCell: { width: '14.2857%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  weekDay: { color: colors.textMuted, fontWeight: '800', fontSize: 11 },
  dayCircle: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  dayCircleSelected: { backgroundColor: colors.primaryDark },
  dayCircleToday: { borderWidth: 1, borderColor: colors.primaryDark },
  dayText: { color: colors.text, fontSize: 13, fontWeight: '700' },
  dayTextSelected: { color: colors.white, fontWeight: '900' },
  sheetHandle: { width: 44, height: 5, borderRadius: 3, backgroundColor: '#C9D3CC', alignSelf: 'center', marginVertical: 8 },
  sheetContent: { gap: 12, paddingBottom: 12 },
  label: { fontWeight: '800', color: colors.text, fontSize: 13 },
});
