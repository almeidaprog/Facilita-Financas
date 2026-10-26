import { useState } from "react";
import { createUser } from "../services/api";
import StatusMessage from "../components/StatusMessage";

export default function Register({ onRegistered, onGoLogin }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (form.password.length < 6) {
      setError("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      await createUser({ name: form.name.trim(), email: form.email.trim(), password: form.password });
      onRegistered(form.email.trim());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-hero register-hero">
        <div className="auth-brand"><span>F</span> Facilita Finanças</div>
        <div className="auth-copy">
          <span className="eyebrow">Comece com o essencial</span>
          <h1>Organização financeira começa com clareza.</h1>
          <p>Crie sua conta, informe sua renda e comece a registrar entradas e despesas.</p>
        </div>
        <p className="auth-footnote">Simples para começar. Útil para continuar.</p>
      </section>

      <section className="auth-panel">
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form-heading">
            <span className="mobile-auth-logo">F</span>
            <h2>Crie sua conta</h2>
            <p>Leva menos de um minuto.</p>
          </div>

          <StatusMessage>{error}</StatusMessage>

          <label>
            Nome
            <input value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="Como podemos te chamar?" required />
          </label>
          <label>
            E-mail
            <input type="email" value={form.email} onChange={(event) => update("email", event.target.value)} placeholder="voce@email.com" required />
          </label>
          <div className="form-grid two">
            <label>
              Senha
              <input type="password" value={form.password} onChange={(event) => update("password", event.target.value)} placeholder="Mínimo 6 caracteres" required />
            </label>
            <label>
              Confirmar senha
              <input type="password" value={form.confirmPassword} onChange={(event) => update("confirmPassword", event.target.value)} placeholder="Repita a senha" required />
            </label>
          </div>

          <button className="primary-button auth-submit" type="submit" disabled={loading}>
            {loading ? "Criando conta..." : "Criar conta"}
          </button>

          <p className="auth-switch">
            Já possui conta?{" "}
            <button type="button" onClick={onGoLogin}>Entrar</button>
          </p>
        </form>
      </section>
    </div>
  );
}
