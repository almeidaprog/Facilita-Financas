import { useState } from "react";
import StatusMessage from "../components/StatusMessage";
import { createCategory, createFinancialProfile } from "../services/api";
import { missingDefaultCategories } from "../utils/defaultCategories";

export default function Onboarding({ user, categories, onComplete, onLogout }) {
  const [income, setIncome] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const value = Number(income);
    if (!Number.isFinite(value) || value < 0 || income === "") {
      setError("Informe uma renda mensal válida.");
      return;
    }

    setSaving(true);
    try {
      const missing = missingDefaultCategories(categories);

      if (missing.length) {
        await Promise.all(
          missing.map((category) =>
            createCategory({
              user_id: user.id,
              name: category.name,
              category_type: category.category_type,
            })
          )
        );
      }

      await createFinancialProfile({
        user_id: user.id,
        monthly_income: value,
      });

      await onComplete();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="onboarding-page">
      <section className="onboarding-card">
        <div className="onboarding-top">
          <div className="onboarding-brand"><span>F</span> Facilita Finanças</div>
          <button type="button" className="onboarding-logout" onClick={onLogout}>Sair</button>
        </div>
        <span className="eyebrow">Primeiro acesso</span>
        <h1>Vamos começar pelo essencial.</h1>
        <p>Informe sua renda mensal. As categorias mais comuns já ficam prontas para você usar.</p>

        <form className="onboarding-form" onSubmit={handleSubmit}>
          <StatusMessage>{error}</StatusMessage>
          <label>
            Renda mensal
            <div className="money-input onboarding-money">
              <span>R$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={income}
                onChange={(event) => setIncome(event.target.value)}
                placeholder="Ex.: 2500,00"
                autoFocus
                required
              />
            </div>
          </label>
          <small>Se sua renda varia, informe uma média aproximada. Você pode alterar depois.</small>
          <button className="primary-button onboarding-submit" disabled={saving}>
            {saving ? "Preparando seu espaço..." : "Começar a organizar minhas finanças"}
          </button>
        </form>

        <div className="onboarding-hint">
          <strong>Já deixamos o básico preparado</strong>
          <span>Alimentação, Moradia, Transporte, Saúde, Lazer, Salário e outras categorias úteis.</span>
        </div>
      </section>
    </main>
  );
}
