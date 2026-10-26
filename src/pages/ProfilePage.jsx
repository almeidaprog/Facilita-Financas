import { useEffect, useState } from "react";
import StatusMessage from "../components/StatusMessage";
import { createFinancialProfile, updateFinancialProfile } from "../services/api";
import { formatCurrency } from "../utils/formatters";

export default function ProfilePage({ user, profile, onRefresh }) {
  const [income, setIncome] = useState(profile?.monthly_income ?? "");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => setIncome(profile?.monthly_income ?? ""), [profile]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (Number(income) < 0 || income === "") return setError("Informe uma renda mensal válida.");
    setSaving(true);
    try {
      if (profile) await updateFinancialProfile(user.id, { monthly_income: Number(income) });
      else await createFinancialProfile({ user_id: user.id, monthly_income: Number(income) });
      await onRefresh();
      setSuccess("Renda mensal atualizada com sucesso.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page-stack narrow-page">
      <section className="page-heading"><div><span className="eyebrow">Seu ponto de partida</span><h1>Minha renda</h1><p>Informe quanto você recebe normalmente por mês. Você pode mudar este valor quando sua realidade mudar.</p></div></section>
      <section className="panel profile-panel">
        <div className="profile-value"><span>Renda mensal atual</span><strong>{profile ? formatCurrency(profile.monthly_income) : "Ainda não informada"}</strong><small>Este valor compõe o cálculo do saldo estimado no Dashboard.</small></div>
        <form className="income-form" onSubmit={handleSubmit}>
          <StatusMessage>{error}</StatusMessage><StatusMessage type="success">{success}</StatusMessage>
          <label>Nova renda mensal<div className="money-input"><span>R$</span><input type="number" min="0" step="0.01" value={income} onChange={(event) => setIncome(event.target.value)} placeholder="0,00" required /></div></label>
          <button className="primary-button" disabled={saving}>{saving ? "Salvando..." : profile ? "Atualizar renda" : "Cadastrar renda"}</button>
        </form>
      </section>
      <section className="info-card"><strong>Por que a renda fica separada dos lançamentos?</strong><p>Ela representa seu valor mensal recorrente. Entradas extras, como freelance ou venda de algo, entram como lançamentos de receita.</p></section>
    </div>
  );
}
