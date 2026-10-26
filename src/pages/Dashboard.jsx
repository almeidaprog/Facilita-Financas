import Icon from "../components/Icon";
import { formatCurrency, formatDate, normalizeType } from "../utils/formatters";

function SummaryCard({ label, value, icon, tone, helper }) {
  return (
    <article className={`summary-card ${tone}`}>
      <div className="summary-icon"><Icon name={icon} /></div>
      <div>
        <span>{label}</span>
        <strong>{formatCurrency(value)}</strong>
        <small>{helper}</small>
      </div>
    </article>
  );
}

export default function Dashboard({ user, profile, entries, categories, loading, onNewEntry, onNavigate }) {
  const now = new Date();
  const monthEntries = entries.filter((entry) => {
    const [year, month] = entry.entry_date.split("-").map(Number);
    return year === now.getFullYear() && month === now.getMonth() + 1;
  });

  const extraIncome = monthEntries
    .filter((entry) => normalizeType(entry.entry_type) === "receita")
    .reduce((sum, entry) => sum + Number(entry.amount), 0);

  const expenses = monthEntries
    .filter((entry) => normalizeType(entry.entry_type) === "despesa")
    .reduce((sum, entry) => sum + Number(entry.amount), 0);

  const monthlyIncome = Number(profile?.monthly_income || 0);
  const balance = monthlyIncome + extraIncome - expenses;
  const recent = entries.slice(0, 5);

  const expenseByCategory = monthEntries
    .filter((entry) => normalizeType(entry.entry_type) === "despesa")
    .reduce((acc, entry) => {
      const category = categories.find((item) => item.id === entry.category_id)?.name || "Sem categoria";
      acc[category] = (acc[category] || 0) + Number(entry.amount);
      return acc;
    }, {});

  const topExpenses = Object.entries(expenseByCategory).sort((a, b) => b[1] - a[1]).slice(0, 4);
  const maxExpense = topExpenses[0]?.[1] || 1;

  if (loading) {
    return <div className="page-loading"><div className="spinner" /><span>Organizando seus números...</span></div>;
  }

  return (
    <div className="page-stack">
      <section className="page-heading dashboard-heading">
        <div>
          <span className="eyebrow">Seu mês em um olhar</span>
          <h1>Visão geral</h1>
          <p>Acompanhe o que entrou, o que saiu e quanto você tem disponível.</p>
        </div>
        <button className="primary-button" onClick={onNewEntry}><Icon name="plus" /> Novo lançamento</button>
      </section>

      {!profile && (
        <button className="setup-banner" onClick={() => onNavigate("profile")}>
          <div><strong>Comece informando sua renda mensal</strong><span>Isso deixa o saldo do Dashboard mais fiel à sua realidade.</span></div>
          <span>Configurar agora →</span>
        </button>
      )}

      <section className="summary-grid">
        <SummaryCard label="Saldo estimado" value={balance} icon="wallet" tone="balance" helper="Renda + entradas − despesas" />
        <SummaryCard label="Renda mensal" value={monthlyIncome} icon="up" tone="income" helper="Valor base cadastrado" />
        <SummaryCard label="Entradas extras" value={extraIncome} icon="up" tone="income-soft" helper="Neste mês" />
        <SummaryCard label="Despesas" value={expenses} icon="down" tone="expense" helper="Neste mês" />
      </section>

      <section className="dashboard-grid">
        <article className="panel recent-panel">
          <div className="panel-heading">
            <div><span className="eyebrow">Movimentação</span><h2>Últimos lançamentos</h2></div>
            <button className="text-button" onClick={() => onNavigate("entries")}>Ver todos</button>
          </div>

          {recent.length === 0 ? (
            <div className="empty-state compact"><strong>Nenhum lançamento ainda</strong><span>Quando você registrar uma entrada ou despesa, ela aparece aqui.</span><button onClick={onNewEntry}>Adicionar primeiro lançamento</button></div>
          ) : (
            <div className="transaction-list">
              {recent.map((entry) => {
                const isIncome = normalizeType(entry.entry_type) === "receita";
                return (
                  <div className="transaction-row" key={entry.id}>
                    <div className={`transaction-mark ${isIncome ? "income" : "expense"}`}><Icon name={isIncome ? "up" : "down"} size={17} /></div>
                    <div className="transaction-main"><strong>{entry.description}</strong><span>{categories.find((category) => category.id === entry.category_id)?.name || "Sem categoria"} • {formatDate(entry.entry_date)}</span></div>
                    <div className={`transaction-amount ${isIncome ? "positive" : "negative"}`}>{isIncome ? "+ " : "− "}{formatCurrency(entry.amount)}</div>
                  </div>
                );
              })}
            </div>
          )}
        </article>

        <article className="panel distribution-panel">
          <div className="panel-heading"><div><span className="eyebrow">Despesas</span><h2>Onde você mais gastou</h2></div></div>
          {topExpenses.length === 0 ? (
            <div className="empty-state compact"><strong>Ainda sem despesas no mês</strong><span>Seu resumo por categoria aparecerá aqui.</span></div>
          ) : (
            <div className="category-bars">
              {topExpenses.map(([name, value]) => (
                <div className="category-bar" key={name}>
                  <div><span>{name}</span><strong>{formatCurrency(value)}</strong></div>
                  <div className="bar-track"><span style={{ width: `${Math.max(8, (value / maxExpense) * 100)}%` }} /></div>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>

      <p className="dashboard-note">Olá, {user.name.split(/\s+/)[0]}. Os valores acima consideram apenas os lançamentos do mês atual.</p>
    </div>
  );
}
