import type { Category, FinancialType } from '@/services/types';
import { api } from '@/services/api';
import { normalizeType } from './format';

const DEFAULT_CATEGORIES: Array<{ name: string; category_type: FinancialType }> = [
  { name: 'Alimentação', category_type: 'despesa' },
  { name: 'Moradia', category_type: 'despesa' },
  { name: 'Transporte', category_type: 'despesa' },
  { name: 'Saúde', category_type: 'despesa' },
  { name: 'Lazer', category_type: 'despesa' },
  { name: 'Outros', category_type: 'despesa' },
  { name: 'Salário', category_type: 'receita' },
  { name: 'Freelance', category_type: 'receita' },
  { name: 'Renda extra', category_type: 'receita' },
  { name: 'Outros', category_type: 'receita' },
];

function key(name: string, type: unknown) {
  return `${normalizeType(type)}::${name.trim().toLocaleLowerCase('pt-BR')}`;
}

export async function ensureDefaultCategories(userId: number, current?: Category[]) {
  const categories = current ?? (await api.getCategories(userId));
  const existing = new Set(categories.map((category) => key(category.name, category.category_type)));
  const missing = DEFAULT_CATEGORIES.filter((category) => !existing.has(key(category.name, category.category_type)));

  // As categorias são independentes; criá-las em paralelo reduz bastante o tempo do primeiro acesso.
  await Promise.allSettled(
    missing.map((category) => api.createCategory({ user_id: userId, ...category })),
  );

  return api.getCategories(userId);
}
