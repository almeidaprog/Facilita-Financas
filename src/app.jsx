import "./App.css";

function App() {
  const nome = "Pedro";

  const saldoTotal = 2500;
  const receitas = 3000;
  const despesas = 500;

  return (
    <main className="container">
      <h2>Olá, {nome} 👋</h2>

      <section className="cards">
        <div className="card saldo">
          <span>Saldo Total</span>

          <strong>
            R${" "}
            {saldoTotal.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </strong>
        </div>

        <div className="card">
          <span>Receitas</span>

          <strong>
            R${" "}
            {receitas.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </strong>

          <small>Este mês</small>
        </div>

        <div className="card">
          <span>Despesas</span>

          <strong>
            R${" "}
            {despesas.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </strong>

          <small>Este mês</small>
        </div>
      </section>
    </main>
  );
}

export default App;