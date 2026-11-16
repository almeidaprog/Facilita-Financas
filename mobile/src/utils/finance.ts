import type { Category, Entry, FinancialProfile } from '@/services/types';
import { normalizeType } from './format';

export function sortEntries(entries: Entry[]) {
  return [...entries].sort((a, b) => {
    const dateCompare = String(b.entry_date).localeCompare(String(a.entry_date));
    return dateCompare || b.id - a.id;
  });
}

export function entriesForCurrentMonth(entries: Entry[], reference = new Date()) {
  const year = reference.getFullYear();
  const month = reference.getMonth() + 1;

  return entries.filter((entry) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(entry.entry_date);
    return !!match && Number(match[1]) === year && Number(match[2]) === month;
  });
}

export function calculateDashboard(
  profile: FinancialProfile | null,
  entries: Entry[],
  categories: Category[],
) {
  const monthEntries = entriesForCurrentMonth(entries);
  const monthlyIncome = Number(profile?.monthly_income || 0);
  const extraIncome = monthEntries
    .filter((entry) => normalizeType(entry.entry_type) === 'receita')
    .reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
  const expenses = monthEntries
    .filter((entry) => normalizeType(entry.entry_type) === 'despesa')
    .reduce((sum, entry) => sum + Number(entry.amount || 0), 0);

  const expenseMap = new Map<string, number>();
  monthEntries
    .filter((entry) => normalizeType(entry.entry_type) === 'despesa')
    .forEach((entry) => {
      const category = categories.find((item) => Number(item.id) === Number(entry.category_id));
      const name = category?.name || 'Sem categoria';
      expenseMap.set(name, (expenseMap.get(name) || 0) + Number(entry.amount || 0));
    });

  return {
    monthlyIncome,
    extraIncome,
    expenses,
    balance: monthlyIncome + extraIncome - expenses,
    recentEntries: sortEntries(entries).slice(0, 5),
    topExpenses: [...expenseMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4),
  };
}
