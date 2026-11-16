import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Card, Chip, Field, Message, PageHeader, Title } from '@/components/UI';
import { useSession } from '@/context/SessionContext';
import { api } from '@/services/api';
import type { Category, FinancialType } from '@/services/types';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/layout';
import { normalizeType } from '@/utils/format';

export default function CategoriesScreen() {
  const { user } = useSession();
  const [categories, setCategories] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setCategories(await api.getCategories(user.id));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar categorias.');
    }
  }, [user]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const grouped = useMemo(() => ({
    despesa: categories.filter((category) => normalizeType(category.category_type) === 'despesa'),
    receita: categories.filter((category) => normalizeType(category.category_type) === 'receita'),
  }), [categories]);

  function newCategory() {
    setEditing(null);
    setOpen(true);
  }

  function remove(category: Category) {
    Alert.alert('Excluir categoria?', 'Os lançamentos existentes ficarão sem categoria.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.deleteCategory(category.id);
            await load();
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao excluir categoria.');
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
            title="Categorias"
            subtitle="Organize receitas e despesas."
            action={<Pressable onPress={newCategory} style={styles.headerAdd}><Text style={styles.headerAddText}>＋ Nova</Text></Pressable>}
          />
          <Message text={error} />
          <CategoryGroup type="despesa" title="Despesas" items={grouped.despesa} onEdit={(item) => { setEditing(item); setOpen(true); }} onDelete={remove} />
          <CategoryGroup type="receita" title="Receitas" items={grouped.receita} onEdit={(item) => { setEditing(item); setOpen(true); }} onDelete={remove} />
        </ScrollView>
        <CategoryModal visible={open} category={editing} userId={user?.id || 0} onClose={() => setOpen(false)} onSaved={async () => { setOpen(false); await load(); }} />
      </View>
    </SafeAreaView>
  );
}

function CategoryGroup({ type, title, items, onEdit, onDelete }: { type: FinancialType; title: string; items: Category[]; onEdit: (item: Category) => void; onDelete: (item: Category) => void }) {
  return (
    <Card>
      <View style={styles.groupHeader}>
        <View style={[styles.dot, type === 'receita' ? styles.dotIncome : styles.dotExpense]} />
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.count}><Text style={styles.countText}>{items.length}</Text></View>
      </View>
      {items.length ? items.map((item) => (
        <View key={item.id} style={styles.row}>
          <Text style={styles.name}>{item.name}</Text>
          <View style={styles.actions}>
            <Pressable onPress={() => onEdit(item)} style={styles.miniAction}><Text style={styles.edit}>Editar</Text></Pressable>
            <Pressable onPress={() => onDelete(item)} style={styles.miniAction}><Text style={styles.delete}>Excluir</Text></Pressable>
          </View>
        </View>
      )) : <Text style={styles.empty}>Nenhuma categoria.</Text>}
    </Card>
  );
}

function CategoryModal({ visible, category, userId, onClose, onSaved }: { visible: boolean; category: Category | null; userId: number; onClose: () => void; onSaved: () => Promise<void> }) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [type, setType] = useState<FinancialType>('despesa');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setName(category?.name || '');
      setType(category ? normalizeType(category.category_type) : 'despesa');
      setError('');
    }
  }, [visible, category]);

  async function save() {
    if (!name.trim()) return setError('Informe o nome da categoria.');
    setSaving(true);
    setError('');
    try {
      if (category) await api.updateCategory(category.id, { name: name.trim() });
      else await api.createCategory({ user_id: userId, name: name.trim(), category_type: type });
      await onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar categoria.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom + 10, 24) }]}>
          <View style={styles.sheetHandle} />
          <Title>{category ? 'Editar categoria' : 'Nova categoria'}</Title>
          <Field label="Nome" value={name} onChangeText={setName} placeholder="Ex.: Academia" />
          {!category ? (
            <View style={{ gap: 8 }}>
              <Text style={styles.smallLabel}>Tipo</Text>
              <View style={styles.chips}>
                <Chip label="Despesa" active={type === 'despesa'} onPress={() => setType('despesa')} />
                <Chip label="Receita" active={type === 'receita'} onPress={() => setType('receita')} />
              </View>
            </View>
          ) : null}
          <Message text={error} />
          <Button title="Salvar" onPress={save} loading={saving} />
          <Button title="Cancelar" kind="secondary" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primaryDark },
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: 110, gap: spacing.md },
  headerAdd: { minHeight: 42, paddingHorizontal: 13, borderRadius: 10, backgroundColor: colors.primaryDark, alignItems: 'center', justifyContent: 'center' },
  headerAddText: { color: colors.white, fontWeight: '900', fontSize: 12 },
  groupHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 9, height: 9, borderRadius: 5 },
  dotIncome: { backgroundColor: '#4A965D' },
  dotExpense: { backgroundColor: '#C16666' },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: '900', flex: 1 },
  count: { minWidth: 28, height: 24, borderRadius: 12, backgroundColor: colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' },
  countText: { color: colors.textMuted, fontSize: 10, fontWeight: '900' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  name: { color: colors.text, fontWeight: '800', flex: 1 },
  actions: { flexDirection: 'row', gap: 6 },
  miniAction: { minHeight: 36, paddingHorizontal: 9, justifyContent: 'center', borderRadius: 8, backgroundColor: colors.surfaceMuted },
  edit: { color: colors.primaryDark, fontWeight: '900', fontSize: 11 },
  delete: { color: colors.danger, fontWeight: '900', fontSize: 11 },
  empty: { color: colors.textMuted, paddingVertical: 8 },
  backdrop: { flex: 1, backgroundColor: '#10201888', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.background, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, paddingHorizontal: spacing.md, paddingBottom: 24, gap: spacing.md },
  sheetHandle: { width: 44, height: 5, borderRadius: 3, backgroundColor: '#C9D3CC', alignSelf: 'center', marginTop: 9 },
  chips: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  smallLabel: { fontSize: 13, fontWeight: '800', color: colors.text },
});
