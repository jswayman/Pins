// Mirrors GameGrid/client/src/utils/ssoCookie.js exactly
// Shared ygs_token cookie enables cross-app SSO

const COOKIE_NAME = "ygs_token";
const MAX_AGE = 30 * 24 * 60 * 60;

function cookieDomain() {
  const h = window.location.hostname;
  if (h === "localhost" || h === "127.0.0.1") return null;
  if (h === "yourgamespot.com" || h.endsWith(".yourgamespot.com")) return "yourgamespot.com";
  return null;
}

function cookieFlags() {
  return window.location.protocol === "https:" ? "; Secure; SameSite=Lax" : "; SameSite=Lax";
}

function readAllCookieTokens() {
  const out = [];
  if (!document.cookie) return out;
  for (const part of document.cookie.split(";")) {
    const trimmed = part.trim();
    if (!trimmed.startsWith(COOKIE_NAME + "=")) continue;
    const raw = trimmed.slice(COOKIE_NAME.length + 1);
    let v = raw;
    try { v = decodeURIComponent(raw); } catch { /* legacy */ }
    if (v && out.indexOf(v) === -1) out.push(v);
  }
  return out;
}

function lsGet() {
  try { return localStorage.getItem(COOKIE_NAME); } catch { return null; }
}

function lsSet(token) {
  try {
    if (token) localStorage.setItem(COOKIE_NAME, token);
    else localStorage.removeItem(COOKIE_NAME);
  } catch { /* private mode */ }
}

function writeCookie(token, domain) {
  let cookie = COOKIE_NAME + "=" + token + "; path=/; max-age=" + MAX_AGE + cookieFlags();
  if (domain) cookie += "; domain=" + domain;
  document.cookie = cookie;
}

function eraseCookie(domain) {
  let cookie = COOKIE_NAME + "=; path=/; max-age=0" + cookieFlags();
  if (domain) cookie += "; domain=" + domain;
  document.cookie = cookie;
}

function eraseHostOnlyCookie() { eraseCookie(null); }

function eraseLegacyDottedDomainCookie() {
  const domain = cookieDomain();
  if (domain) eraseCookie("." + domain);
}

function clearAllCookies() {
  eraseHostOnlyCookie();
  const domain = cookieDomain();
  if (domain) {
    eraseCookie(domain);
    eraseLegacyDottedDomainCookie();
  }
}

export function getSharedToken() {
  const cookies = readAllCookieTokens();
  if (cookies.length) return cookies[cookies.length - 1];
  return lsGet();
}

export function getTokenCandidates() {
  const cookies = readAllCookieTokens();
  const ls = lsGet();
  const out = [];
  function add(t) { if (t && out.indexOf(t) === -1) out.push(t); }
  for (const c of cookies) add(c);
  add(ls);
  return out;
}

export function persistDomainCookie(token) {
  if (!token) return;
  eraseHostOnlyCookie();
  eraseLegacyDottedDomainCookie();
  const domain = cookieDomain();
  if (domain) writeCookie(token, domain);
  else writeCookie(token, null);
  lsSet(token);
}

export function setSharedToken(token) {
  if (!token) { clearSharedToken(); return; }
  persistDomainCookie(token);
}

export function clearSharedToken() {
  clearAllCookies();
  lsSet(null);
}

export function repairStorage() {
  const h = window.location.hostname;
  if (h === "yourgamespot.com" || h.endsWith(".yourgamespot.com")) {
    eraseHostOnlyCookie();
  }
  const cookies = readAllCookieTokens();
  const ls = lsGet();
  const cookie = cookies[cookies.length - 1] || null;
  if (cookie) {
    if (ls !== cookie) lsSet(cookie);
  } else if (ls) {
    persistDomainCookie(ls);
  }
}

repairStorage();
