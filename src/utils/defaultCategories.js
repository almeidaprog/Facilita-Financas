import { normalizeType } from "./formatters";

export const DEFAULT_CATEGORIES = [
  { name: "Alimentação", category_type: "despesa" },
  { name: "Moradia", category_type: "despesa" },
  { name: "Transporte", category_type: "despesa" },
  { name: "Saúde", category_type: "despesa" },
  { name: "Lazer", category_type: "despesa" },
  { name: "Outros", category_type: "despesa" },
  { name: "Salário", category_type: "receita" },
  { name: "Freelance", category_type: "receita" },
  { name: "Renda extra", category_type: "receita" },
  { name: "Outros", category_type: "receita" },
];

function normalizeName(value) {
  return String(value || "").trim().toLocaleLowerCase("pt-BR");
}

export function missingDefaultCategories(categories = []) {
  const existing = new Set(
    categories.map((category) => `${normalizeType(category.category_type)}::${normalizeName(category.name)}`)
  );

  return DEFAULT_CATEGORIES.filter((category) => {
    const key = `${normalizeType(category.category_type)}::${normalizeName(category.name)}`;
    return !existing.has(key);
  });
}
