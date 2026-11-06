export const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatCurrency(value) {
  const number = Number(value);
  return currencyFormatter.format(Number.isFinite(number) ? number : 0);
}

export function formatDate(value) {
  if (!value) return "—";

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value));
  if (!match) return "—";

  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("pt-BR").format(date);
}

export function todayInputValue() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export function normalizeType(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (["income", "receita", "entrada"].includes(normalized)) return "receita";
  if (["expense", "despesa", "saida", "saída"].includes(normalized)) return "despesa";
  return "despesa";
}

export function typeLabel(value) {
  return normalizeType(value) === "receita" ? "Receita" : "Despesa";
}
