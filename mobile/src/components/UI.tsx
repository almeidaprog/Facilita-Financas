import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from 'react-native';

import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/layout';

export function Title({ children, subtitle }: { children: ReactNode; subtitle?: string }) {
  return (
    <View style={styles.titleWrap}>
      <Text style={styles.title}>{children}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <View style={styles.pageHeader}>
      <View style={styles.pageHeaderCopy}>
        <Text style={styles.pageHeaderTitle}>{title}</Text>
        {subtitle ? <Text style={styles.pageHeaderSubtitle}>{subtitle}</Text> : null}
      </View>
      {action}
    </View>
  );
}

export function Card({ children }: { children: ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput placeholderTextColor="#87928B" style={styles.input} {...props} />
    </View>
  );
}

export function Button({
  title,
  onPress,
  loading = false,
  kind = 'primary',
  disabled = false,
}: {
  title: string;
  onPress: () => void;
  loading?: boolean;
  kind?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}) {
  const backgroundColor = kind === 'primary' ? colors.primaryDark : kind === 'danger' ? colors.danger : colors.surfaceMuted;
  const textColor = kind === 'secondary' ? colors.text : colors.white;

  return (
    <Pressable
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor, opacity: disabled || loading ? 0.55 : pressed ? 0.84 : 1 },
      ]}
    >
      {loading ? <ActivityIndicator color={textColor} /> : <Text style={[styles.buttonText, { color: textColor }]}>{title}</Text>}
    </Pressable>
  );
}

export function Chip({ label, active, onPress }: { label: string; active?: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.chip, active && styles.chipActive, pressed && { opacity: 0.82 }]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

export function Message({ text, type = 'error' }: { text?: string; type?: 'error' | 'success' }) {
  if (!text) return null;
  return (
    <View style={[styles.message, { backgroundColor: type === 'error' ? colors.dangerSoft : colors.successSoft }]}>
      <Text style={{ color: type === 'error' ? colors.danger : colors.success, fontWeight: '700' }}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  titleWrap: { gap: 4 },
  title: { fontSize: 27, fontWeight: '900', color: colors.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, lineHeight: 20, color: colors.textMuted },
  pageHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  pageHeaderCopy: { flex: 1, gap: 3 },
  pageHeaderTitle: { fontSize: 25, fontWeight: '900', color: colors.text, letterSpacing: -0.4 },
  pageHeaderSubtitle: { fontSize: 13, lineHeight: 18, color: colors.textMuted },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  fieldWrap: { gap: 7 },
  label: { fontWeight: '800', color: '#3C4941', fontSize: 13 },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    minHeight: 52,
    fontSize: 16,
    color: colors.text,
  },
  button: { minHeight: 52, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  buttonText: { fontSize: 15, fontWeight: '900' },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: colors.primarySoft, borderColor: '#B8D9C0' },
  chipText: { color: colors.textMuted, fontWeight: '800' },
  chipTextActive: { color: colors.primaryDark },
  message: { padding: 12, borderRadius: radius.sm },
});
