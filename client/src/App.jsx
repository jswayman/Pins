import { useState, useEffect } from "react";
import { useAuth } from "./hooks/useAuth";
import { getPool, joinPool } from "./api";
import AuthScreen        from "./components/AuthScreen";
import HomeScreen        from "./components/HomeScreen";
import AdminScreen       from "./components/AdminScreen";
import CreatePoolScreen  from "./components/CreatePoolScreen";
import LeaderboardScreen from "./components/LeaderboardScreen";
import PickEntryScreen   from "./components/PickEntryScreen";
import HostDashboard     from "./components/HostDashboard";
import S, { C, FONT_DISPLAY } from "./components/styles";

// Check for ?join=CODE or /join/CODE in URL
const urlParams   = new URLSearchParams(window.location.search);
const URL_JOIN    = urlParams.get("join")?.toUpperCase() || null;
const IS_ADMIN    = window.location.pathname === "/admin";

function LoadingScreen() {
  return (
    <div style={S.loadWrap}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: "2rem", fontWeight: 700, color: C.gold, letterSpacing: "0.15em", marginBottom: 16 }}>
        PINS
      </div>
      <span style={S.spinner} />
    </div>
  );
}

export default function App() {
  const { user, loading: authLoading, logout } = useAuth();

  // ── Screen state ──────────────────────────────────────────────────────────
  // "home" | "admin" | "create" | "pool" | "pick" | "host"
  const [screen, setScreen] = useState("loading");
  const [activePoolCode, setActivePoolCode] = useState(null);
  const [activePool, setActivePool]         = useState(null);
  const [pickContext, setPickContext]        = useState(null); // { tournamentId }

  // Navigate to a pool's leaderboard
  function openPool(code) {
    setActivePoolCode(code);
    setScreen("pool");
    // Clean up URL after deep-link join
    if (window.location.search.includes("join=")) {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }

  // Fetch pool details whenever we land on pool screen
  useEffect(() => {
    if (screen === "pool" && activePoolCode) {
      getPool(activePoolCode)
        .then(setActivePool)
        .catch(() => setActivePool(null));
    }
  }, [screen, activePoolCode]);

  // Auth state → initial screen
  useEffect(() => {
    if (authLoading) return;
    if (!user) { setScreen("auth"); return; }

    if (IS_ADMIN) { setScreen("admin"); return; }
    if (URL_JOIN) {
      // Auto-join and navigate to pool
      joinPool(URL_JOIN)
        .then(() => openPool(URL_JOIN))
        .catch(() => openPool(URL_JOIN)); // open even if already joined
      return;
    }
    setScreen("home");
  }, [authLoading, user]);

  // ── Render ────────────────────────────────────────────────────────────────
  if (authLoading || screen === "loading") return <LoadingScreen />;

  if (!user) return <AuthScreen />;

  if (screen === "admin") {
    return (
      <AdminScreen onBack={() => { window.history.replaceState({}, "", "/"); setScreen("home"); }} />
    );
  }

  if (screen === "create") {
    return (
      <CreatePoolScreen
        onBack={() => setScreen("home")}
        onCreated={(code) => openPool(code)}
      />
    );
  }

  if (screen === "pick" && activePoolCode && pickContext) {
    return (
      <PickEntryScreen
        poolCode={activePoolCode}
        tournamentId={pickContext.tournamentId}
        pool={activePool}
        onBack={() => setScreen("pool")}
        onSubmitted={() => { setScreen("pool"); setActivePool(null); }}
      />
    );
  }

  if (screen === "host" && activePoolCode) {
    return (
      <HostDashboard
        poolCode={activePoolCode}
        onBack={() => setScreen("pool")}
      />
    );
  }

  if (screen === "pool" && activePoolCode) {
    return (
      <LeaderboardScreen
        poolCode={activePoolCode}
        currentUser={user}
        onBack={() => setScreen("home")}
        onPickEntry={() => {
          if (activePool) {
            setPickContext({ tournamentId: activePool.tournament_id });
          }
          setScreen("pick");
        }}
        onHostDashboard={() => setScreen("host")}
      />
    );
  }

  return (
    <HomeScreen
      currentUser={user}
      onOpenPool={openPool}
      onCreatePool={() => setScreen("create")}
      onAdmin={() => setScreen("admin")}
    />
  );
}
