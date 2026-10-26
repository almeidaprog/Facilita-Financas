import Icon from "./Icon";

const navItems = [
  { id: "dashboard", label: "Visão geral", icon: "dashboard" },
  { id: "entries", label: "Lançamentos", icon: "entries" },
  { id: "categories", label: "Categorias", icon: "categories" },
  { id: "profile", label: "Minha renda", icon: "profile" },
];

export default function AppShell({ user, currentView, onNavigate, onLogout, children, mobileOpen, setMobileOpen }) {
  const firstName = user?.name?.trim().split(/\s+/)[0] || "Olá";

  return (
    <div className="app-layout">
      {mobileOpen && <button className="mobile-overlay" onClick={() => setMobileOpen(false)} aria-label="Fechar menu" />}

      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">F</div>
          <div>
            <strong>Facilita</strong>
            <span>Finanças</span>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Navegação principal">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${currentView === item.id ? "active" : ""}`}
              onClick={() => {
                onNavigate(item.id);
                setMobileOpen(false);
              }}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-mini">
            <div className="avatar">{firstName.charAt(0).toUpperCase()}</div>
            <div>
              <strong>{user.name}</strong>
              <span>{user.email}</span>
            </div>
          </div>
          <button className="logout-button" onClick={onLogout}>
            <Icon name="logout" />
            Sair
          </button>
        </div>
      </aside>

      <div className="content-column">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Abrir menu">
            <Icon name="menu" />
          </button>
          <div>
            <span className="topbar-kicker">Facilita Finanças</span>
            <strong>Olá, {firstName} 👋</strong>
          </div>
          <div className="topbar-date">
            {new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "long" }).format(new Date())}
          </div>
        </header>

        <main className="main-content">{children}</main>
      </div>
    </div>
  );
}
