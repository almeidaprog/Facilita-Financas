import { useState } from "react";
import { loginUser } from "../services/api";
import StatusMessage from "../components/StatusMessage";

export default function Login({ onLogin, onGoRegister, initialEmail = "" }) {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginUser({ email: email.trim(), password });
      onLogin(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-hero">
        <div className="auth-brand"><span>F</span> Facilita Finanças</div>
        <div className="auth-copy">
          <span className="eyebrow">Controle financeiro sem complicação</span>
          <h1>Entenda seu dinheiro. Organize sua rotina.</h1>
          <p>Registre sua renda e seus gastos em poucos passos e acompanhe sua vida financeira com clareza.</p>
        </div>
        <p className="auth-footnote">Seu dinheiro, do seu jeito.</p>
      </section>

      <section className="auth-panel">
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form-heading">
            <span className="mobile-auth-logo">F</span>
            <h2>Bem-vindo de volta</h2>
            <p>Entre para continuar acompanhando suas finanças.</p>
          </div>

          <StatusMessage>{error}</StatusMessage>

          <label>
            E-mail
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="voce@email.com"
              autoComplete="email"
              required
            />
          </label>

          <label>
            Senha
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Sua senha"
              autoComplete="current-password"
              required
            />
          </label>

          <button className="primary-button auth-submit" type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>

          <p className="auth-switch">
            Ainda não tem conta?{" "}
            <button type="button" onClick={onGoRegister}>Criar conta</button>
          </p>
        </form>
      </section>
    </div>
  );
}
