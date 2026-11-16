import type { FinancialType } from '@/services/types';

export function normalizeType(value: unknown): FinancialType {
  const normalized = String(value || '').trim().toLowerCase();
  return ['receita', 'entrada', 'income'].includes(normalized) ? 'receita' : 'despesa';
}

export function formatCurrency(value: unknown) {
  const numeric = Number(value || 0);
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numeric);
}

export function formatDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '');
  if (!match) return value || '—';
  return `${match[3]}/${match[2]}/${match[1]}`;
}

export function todayISO() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseMoneyInput(value: string) {
  const raw = String(value || '').trim().replace(/[^0-9,.-]/g, '');
  if (!raw) return 0;

  // Formato brasileiro: 1.234,56 -> 1234.56
  if (raw.includes(',')) {
    return Number(raw.replace(/\./g, '').replace(',', '.'));
  }

  // Sem vírgula, um ponto com três casas costuma ser separador de milhar no pt-BR.
  const dotParts = raw.split('.');
  if (dotParts.length > 2) return Number(dotParts.join(''));
  if (dotParts.length === 2 && dotParts[1].length === 3) return Number(dotParts.join(''));

  // Mantém ponto decimal para teclados que usam 1234.56.
  return Number(raw);
}

export function isValidISODate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '');
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
}

