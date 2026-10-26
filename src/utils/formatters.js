export const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatCurrency(value) {
  return currencyFormatter.format(Number(value || 0));
}

export function formatDate(value) {
  if (!value) return "—";
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR").format(new Date(year, month - 1, day));
}

export function todayInputValue() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export function normalizeType(value) {
  if (["income", "receita", "entrada"].includes(value)) return "receita";
  return "despesa";
}

export function typeLabel(value) {
  return normalizeType(value) === "receita" ? "Receita" : "Despesa";
}
