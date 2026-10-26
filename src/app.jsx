import { useCallback, useEffect, useState } from "react";
import "./app.css";
import AppShell from "./components/AppShell";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import EntriesPage from "./pages/EntriesPage";
import CategoriesPage from "./pages/CategoriesPage";
import ProfilePage from "./pages/ProfilePage";
import { getCategories, getEntries, getFinancialProfile } from "./services/api";

function readStoredUser() {
  try {
    const saved = localStorage.getItem("facilita_user") || localStorage.getItem("user");
    const parsed = saved ? JSON.parse(saved) : null;
    if (parsed) localStorage.setItem("facilita_user", JSON.stringify(parsed));
    return parsed;
  } catch {
    return null;
  }
}

export default function App() {
  const [authScreen, setAuthScreen] = useState("login");
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [user, setUser] = useState(readStoredUser);
  const [currentView, setCurrentView] = useState("dashboard");
  const [profile, setProfile] = useState(null);
  const [entries, setEntries] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openEntryOnLoad, setOpenEntryOnLoad] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setLoadError("");

    try {
      const [entriesData, categoriesData, profileResult] = await Promise.all([
        getEntries(user.id),
        getCategories(user.id),
        getFinancialProfile(user.id).catch((error) => {
          if (error.status === 404) return null;
          throw error;
        }),
      ]);
      setEntries(entriesData || []);
      setCategories(categoriesData || []);
      setProfile(profileResult);
    } catch (error) {
      setLoadError(error.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function handleLogin(loggedUser) {
    localStorage.setItem("facilita_user", JSON.stringify(loggedUser));
    setUser(loggedUser);
    setCurrentView("dashboard");
  }

  function handleLogout() {
    localStorage.removeItem("facilita_user");
    localStorage.removeItem("user");
    setUser(null);
    setProfile(null);
    setEntries([]);
    setCategories([]);
    setCurrentView("dashboard");
  }

  function handleNewEntry() {
    setOpenEntryOnLoad(true);
    setCurrentView("entries");
  }

  function handleNavigate(view) {
    setOpenEntryOnLoad(false);
    setCurrentView(view);
  }

  if (!user) {
    if (authScreen === "register") {
      return <Register onRegistered={(email) => { setRegisteredEmail(email); setAuthScreen("login"); }} onGoLogin={() => setAuthScreen("login")} />;
    }
    return <Login initialEmail={registeredEmail} onLogin={handleLogin} onGoRegister={() => setAuthScreen("register")} />;
  }

  let page;
  if (currentView === "entries") page = <EntriesPage user={user} entries={entries} categories={categories} onRefresh={loadData} openCreateOnMount={openEntryOnLoad} />;
  else if (currentView === "categories") page = <CategoriesPage user={user} categories={categories} entries={entries} onRefresh={loadData} />;
  else if (currentView === "profile") page = <ProfilePage user={user} profile={profile} onRefresh={loadData} />;
  else page = <Dashboard user={user} profile={profile} entries={entries} categories={categories} loading={loading} onNewEntry={handleNewEntry} onNavigate={handleNavigate} />;

  return (
    <AppShell user={user} currentView={currentView} onNavigate={handleNavigate} onLogout={handleLogout} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen}>
      {loadError && <div className="global-error"><span>{loadError}</span><button onClick={loadData}>Tentar novamente</button></div>}
      {page}
    </AppShell>
  );
}
