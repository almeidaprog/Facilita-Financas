import { normalizeType } from "./formatters.js";

export function sortEntries(entries = []) {
  return [...entries].sort((a, b) => {
    const dateCompare = String(b?.entry_date || "").localeCompare(String(a?.entry_date || ""));
    if (dateCompare !== 0) return dateCompare;
    return Number(b?.id || 0) - Number(a?.id || 0);
  });
}

export function entriesForMonth(entries = [], referenceDate = new Date()) {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth() + 1;

  return entries.filter((entry) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(entry?.entry_date || ""));
    if (!match) return false;
    return Number(match[1]) === year && Number(match[2]) === month;
  });
}

export function calculateDashboard({ entries = [], categories = [], profile = null, referenceDate = new Date() } = {}) {
  const monthEntries = entriesForMonth(entries, referenceDate);

  const extraIncome = monthEntries
    .filter((entry) => normalizeType(entry?.entry_type) === "receita")
    .reduce((sum, entry) => sum + Number(entry?.amount || 0), 0);

  const expenses = monthEntries
    .filter((entry) => normalizeType(entry?.entry_type) === "despesa")
    .reduce((sum, entry) => sum + Number(entry?.amount || 0), 0);

  const monthlyIncome = Number(profile?.monthly_income || 0);
  const balance = monthlyIncome + extraIncome - expenses;

  const expenseByCategory = monthEntries
    .filter((entry) => normalizeType(entry?.entry_type) === "despesa")
    .reduce((accumulator, entry) => {
      const categoryName = categories.find((item) => Number(item?.id) === Number(entry?.category_id))?.name || "Sem categoria";
      accumulator[categoryName] = (accumulator[categoryName] || 0) + Number(entry?.amount || 0);
      return accumulator;
    }, {});

  const topExpenses = Object.entries(expenseByCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  return {
    monthEntries,
    monthlyIncome,
    extraIncome,
    expenses,
    balance,
    topExpenses,
    recentEntries: sortEntries(entries).slice(0, 5),
  };
}
