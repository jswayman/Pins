import { getSharedToken, setSharedToken, clearSharedToken, getTokenCandidates } from "../utils/ssoCookie";

const TOKEN_KEY = "pins_token";

// ── Token helpers ─────────────────────────────────────────────────────────────
export function getToken() {
  const candidates = getTokenCandidates();
  const local = localStorage.getItem(TOKEN_KEY);
  if (local && candidates.indexOf(local) === -1) candidates.unshift(local);
  return candidates[0] || "";
}

export function setToken(t) {
  if (t) {
    localStorage.setItem(TOKEN_KEY, t);
    setSharedToken(t);
  } else {
    localStorage.removeItem(TOKEN_KEY);
    clearSharedToken();
  }
}

export function isAuthError(err) {
  return err?.status === 401 || err?.status === 403;
}

// ── Base fetch helpers ────────────────────────────────────────────────────────
async function request(method, path, body, token) {
  const headers = { "Content-Type": "application/json" };
  const tok = token || getToken();
  if (tok) headers["Authorization"] = `Bearer ${tok}`;
  const opts = { method, headers };
  if (body !== undefined) opts.body = JSON.stringify(body);
  const r = await fetch(path, opts);
  let data = {};
  try { data = await r.json(); } catch { /* non-JSON */ }
  if (!r.ok) {
    const err = new Error(data.error || "Request failed");
    err.status = r.status;
    throw err;
  }
  return data;
}

const post = (path, body, token) => request("POST", path, body, token);
const get  = (path, token)       => request("GET",  path, undefined, token);
const put  = (path, body, token) => request("PUT",  path, body, token);
const del  = (path, token)       => request("DELETE", path, undefined, token);

// ── Auth (shared /api/auth/* routes) ─────────────────────────────────────────
export const signup      = (body)  => post("/api/auth/signup", body);
export const login       = (body)  => post("/api/auth/login", body);
export const verifyToken = (token) => post("/api/auth/verify", { token });
export const forgotPw    = (body)  => post("/api/auth/forgot", body);
export const resetPw     = (body)  => post("/api/auth/reset", body);
export const getProfile  = (tok)   => get("/api/auth/profile", tok);

export const updateProfile = (body) =>
  fetch("/api/auth/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then(async r => {
    const d = await r.json();
    if (!r.ok) { const e = new Error(d.error || "Update failed"); e.status = r.status; throw e; }
    return d;
  });

export const checkAvailability = (params) =>
  fetch(`/api/auth/check?${new URLSearchParams(params)}`).then(r => r.json());

export const deleteAccount = (token) =>
  fetch("/api/auth/account", {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  }).then(r => r.json());

// ── Tournaments ───────────────────────────────────────────────────────────────
export const getTournaments       = ()        => get("/api/pins/tournaments");
export const getTournament        = (id)      => get(`/api/pins/tournaments/${id}`);
export const syncTournaments      = ()        => post("/api/pins/admin/sync-tournaments");
export const updateTournament     = (id, body) => put(`/api/pins/admin/tournaments/${id}`, body);
export const refreshTournamentScores = (id)  => post(`/api/pins/admin/tournaments/${id}/refresh`);

// ── Pools ─────────────────────────────────────────────────────────────────────
export const createPool  = (body)       => post("/api/pins/pools", body);
export const getPools    = ()           => get("/api/pins/pools");
export const getPool     = (code)       => get(`/api/pins/pools/${code}`);
export const joinPool    = (code)       => post(`/api/pins/pools/${code}/join`);
export const lockPool    = (code)       => post(`/api/pins/pools/${code}/lock`);
export const deletePool  = (code)       => del(`/api/pins/pools/${code}`);
export const getPublicPools = ()        => get("/api/pins/pools/public");

// ── Entries ───────────────────────────────────────────────────────────────────
export const submitEntry  = (code, body)     => post(`/api/pins/pools/${code}/entries`, body);
export const getMyEntries = (code)           => get(`/api/pins/pools/${code}/entries/mine`);
export const deleteEntry  = (code, entryId)  => del(`/api/pins/pools/${code}/entries/${entryId}`);

// ── Payments (host) ───────────────────────────────────────────────────────────
export const getPayments       = (code)              => get(`/api/pins/pools/${code}/payments`);
export const markPaid          = (code, entryId)     => post(`/api/pins/pools/${code}/payments`, { entryId, status: "paid" });
export const markUnpaid        = (code, entryId)     => post(`/api/pins/pools/${code}/payments`, { entryId, status: "pending" });
export const getPayoutReport   = (code)              => get(`/api/pins/pools/${code}/payout-report`);
