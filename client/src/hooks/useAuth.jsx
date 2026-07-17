import { useState, useEffect, createContext, useContext } from "react";
import { verifyToken, isAuthError, getToken, setToken } from "../api";
import { getTokenCandidates, repairStorage, getSharedToken } from "../utils/ssoCookie";

export { getToken, setToken };

function allTokenCandidates() {
  const out = getTokenCandidates();
  const local = localStorage.getItem("pins_token");
  if (local && out.indexOf(local) === -1) out.unshift(local);
  return out;
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    repairStorage();

    const shared = getSharedToken();
    if (shared) {
      const local = localStorage.getItem("pins_token");
      if (local !== shared) localStorage.setItem("pins_token", shared);
    }

    const candidates = allTokenCandidates();
    if (!candidates.length) { setLoading(false); return; }

    (async () => {
      let lastAuthErr = null;
      for (let i = 0; i < candidates.length; i++) {
        try {
          const { user: u, token: newToken } = await verifyToken(candidates[i]);
          if (cancelled) return;
          setToken(newToken);
          setUser(u);
          setLoading(false);
          return;
        } catch (err) {
          if (isAuthError(err)) { lastAuthErr = err; continue; }
          if (i + 1 < candidates.length) continue;
          if (!cancelled) setLoading(false);
          return;
        }
      }
      if (!cancelled && lastAuthErr) setToken(null);
      if (!cancelled) setLoading(false);
    })();

    return () => { cancelled = true; };
  }, []);

  function login(userData, newToken) {
    setToken(newToken);
    setUser(userData);
  }

  function logout() {
    setToken(null);
    setUser(null);
    window.location.href = "https://yourgamespot.com?signed_out=1";
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
