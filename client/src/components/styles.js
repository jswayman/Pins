// Pins design system — mirrors GameGrid's visual language exactly
const FONT_BODY    = "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif";
const FONT_DISPLAY = "'Oswald', sans-serif";

export const C = {
  bg:          "#0a1a0a",
  bg2:         "#142814",
  bgCard:      "rgba(255,255,255,0.04)",
  bgCardHover: "rgba(255,255,255,0.07)",
  border:      "rgba(255,255,255,0.08)",
  borderMid:   "rgba(255,255,255,0.12)",
  gold:        "#FFB612",   // exact GameGrid gold
  goldDim:     "rgba(255,182,18,0.15)",
  goldBorder:  "rgba(255,182,18,0.35)",
  green:       "#27ae60",
  greenDim:    "rgba(39,174,96,0.15)",
  greenBorder: "rgba(39,174,96,0.3)",
  red:         "#e74c3c",
  redDim:      "rgba(192,57,43,0.2)",
  redBorder:   "rgba(192,57,43,0.4)",
  text:        "#ffffff",
  textDim:     "rgba(255,255,255,0.55)",
  textFaint:   "rgba(255,255,255,0.3)",
};

const S = {
  // ── Root & backgrounds ────────────────────────────────────────────────────
  root: {
    minHeight: "100vh",
    background: C.bg,
    fontFamily: FONT_BODY,
    position: "relative",
    overflowX: "hidden",
    paddingTop: "env(safe-area-inset-top, 0px)",
  },
  fieldBg: {
    position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
    background: `
      repeating-linear-gradient(0deg,transparent,transparent 48px,rgba(255,255,255,0.03) 48px,rgba(255,255,255,0.03) 50px),
      repeating-linear-gradient(90deg,transparent,transparent 48px,rgba(255,255,255,0.03) 48px,rgba(255,255,255,0.03) 50px),
      linear-gradient(180deg,#142814 0%,#1a3a1a 50%,#142814 100%)
    `,
  },
  loadWrap: {
    minHeight: "100vh", display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", background: C.bg2,
  },

  // ── App header ────────────────────────────────────────────────────────────
  appHeader: {
    position: "sticky", top: 0, zIndex: 100,
    display: "flex", flexDirection: "column",
    background: "rgba(6,16,6,0.97)", backdropFilter: "blur(12px)",
    borderBottom: "1px solid rgba(255,255,255,0.07)",
  },
  appHeaderRow: {
    display: "flex", alignItems: "center",
    padding: "0 14px", height: 52, gap: 8,
  },
  headerLogo: {
    display: "flex", alignItems: "center", gap: 8,
    background: "transparent", border: "none", cursor: "pointer", padding: 0,
    flex: 1,
  },
  headerLogoText: {
    fontFamily: FONT_DISPLAY, fontSize: "1.05rem", fontWeight: 700,
    color: C.gold, letterSpacing: "0.1em",
  },
  headerLogoSub: {
    fontFamily: FONT_DISPLAY, fontSize: "0.65rem", color: C.textDim,
    letterSpacing: "0.06em",
  },
  headerUser: {
    display: "flex", alignItems: "center", gap: 8,
    background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`,
    borderRadius: 24, padding: "5px 12px 5px 6px", cursor: "pointer",
    transition: "background 0.15s",
  },
  headerUserActive: {
    background: "rgba(255,182,18,0.12)", border: "1px solid rgba(255,182,18,0.35)",
  },
  headerAvatar: { fontSize: "1.3rem", lineHeight: 1, display: "flex", alignItems: "center" },
  headerAvatarImg: { width: 28, height: 28, borderRadius: "50%", objectFit: "cover" },
  headerUserName: {
    fontFamily: FONT_DISPLAY, fontSize: "0.85rem", color: C.text,
    letterSpacing: "0.04em", maxWidth: 110, overflow: "hidden",
    textOverflow: "ellipsis", whiteSpace: "nowrap",
  },
  headerGear: { fontSize: "0.9rem", opacity: 0.5 },

  // ── User dropdown menu ─────────────────────────────────────────────────────
  userMenu: {
    position: "absolute", top: "calc(100% + 8px)", right: 0,
    background: "rgba(8,22,8,0.98)", border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 12, padding: "6px", minWidth: 200,
    boxShadow: "0 12px 40px rgba(0,0,0,0.7)", zIndex: 350,
    overflowY: "auto", WebkitOverflowScrolling: "touch",
  },
  userMenuItem: {
    display: "flex", alignItems: "center", gap: 10, width: "100%",
    padding: "10px 12px", background: "transparent", border: "none",
    borderRadius: 8, color: "#fff", fontFamily: FONT_DISPLAY,
    fontSize: "0.9rem", letterSpacing: "0.04em", cursor: "pointer", textAlign: "left",
  },
  userMenuIcon: { fontSize: "1rem", lineHeight: 1, width: 20, textAlign: "center" },
  userMenuDivider: { height: 1, background: "rgba(255,255,255,0.07)", margin: "4px 0" },
  gamespotPill: {
    display: "inline-flex", alignItems: "center",
    background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 20, padding: "4px 12px", fontSize: 12,
    fontFamily: FONT_DISPLAY, fontWeight: 800, letterSpacing: "0.08em",
  },

  // ── Page / content container ──────────────────────────────────────────────
  // The main page wrapper — centered, max-width, relative z-index above fieldBg
  page: {
    position: "relative", zIndex: 1,
    maxWidth: 560, margin: "0 auto",
    padding: "16px 14px 100px",
  },
  pageWide: {
    position: "relative", zIndex: 1,
    maxWidth: 700, margin: "0 auto",
    padding: "16px 14px 100px",
  },

  // The "container" card — centered glass panel, matches GridIron lobbyCard
  container: {
    position: "relative", zIndex: 1,
    maxWidth: 540,
    margin: "clamp(12px, 3vw, 24px) auto",
    padding: "clamp(16px, 4vw, 24px) clamp(14px, 4vw, 20px)",
    background: "rgba(10,26,10,0.92)",
    backdropFilter: "blur(14px)",
    border: `1px solid ${C.border}`,
    borderRadius: 16,
    boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
  },

  // ── Section titles ────────────────────────────────────────────────────────
  sectionTitle: {
    fontFamily: FONT_DISPLAY, fontSize: "0.72rem", fontWeight: 600,
    color: C.textDim, letterSpacing: "0.1em", textTransform: "uppercase",
    marginBottom: 8,
  },
  pageTitle: {
    fontFamily: FONT_DISPLAY, fontSize: "1.3rem", fontWeight: 700,
    color: C.text, letterSpacing: "0.04em", marginBottom: 4,
  },
  pageSub: {
    fontFamily: FONT_BODY, fontSize: "0.83rem", color: C.textDim, marginBottom: 16,
  },

  // ── Banners ───────────────────────────────────────────────────────────────
  errorBanner: {
    background: C.redDim, border: `1px solid ${C.redBorder}`,
    color: C.red, borderRadius: 8, padding: "9px 14px", marginBottom: 10,
    fontFamily: FONT_DISPLAY, fontSize: "0.85rem",
  },
  infoBanner: {
    background: C.greenDim, border: `1px solid ${C.greenBorder}`,
    color: C.green, borderRadius: 8, padding: "9px 14px", marginBottom: 10,
    fontFamily: FONT_DISPLAY, fontSize: "0.85rem",
  },
  warnBanner: {
    background: C.goldDim, border: `1px solid ${C.goldBorder}`,
    color: C.gold, borderRadius: 8, padding: "9px 14px", marginBottom: 10,
    fontFamily: FONT_DISPLAY, fontSize: "0.85rem",
  },

  // ── Cards ─────────────────────────────────────────────────────────────────
  card: {
    background: C.bgCard, border: `1px solid ${C.border}`,
    borderRadius: 12, padding: "14px 16px", marginBottom: 10,
  },
  cardClickable: {
    background: C.bgCard, border: `1px solid ${C.border}`,
    borderRadius: 12, padding: "14px 16px", marginBottom: 10,
    cursor: "pointer", transition: "background 0.15s",
  },

  // ── Buttons ───────────────────────────────────────────────────────────────
  btnPrimary: {
    background: C.gold, color: "#0a1a0a",
    fontFamily: FONT_DISPLAY, fontSize: "0.95rem", fontWeight: 700,
    letterSpacing: "0.06em", border: "none", borderRadius: 10,
    padding: "12px 24px", cursor: "pointer", width: "100%",
  },
  btnSecondary: {
    background: "transparent", color: C.text,
    fontFamily: FONT_DISPLAY, fontSize: "0.9rem", fontWeight: 600,
    letterSpacing: "0.05em",
    border: `1px solid ${C.border}`, borderRadius: 10,
    padding: "11px 20px", cursor: "pointer", width: "100%",
  },
  btnDanger: {
    background: "transparent", color: C.red,
    fontFamily: FONT_DISPLAY, fontSize: "0.9rem", fontWeight: 600,
    letterSpacing: "0.05em",
    border: `1px solid ${C.redBorder}`, borderRadius: 10,
    padding: "11px 20px", cursor: "pointer", width: "100%",
  },
  btnSmall: {
    background: "rgba(255,255,255,0.06)", color: C.text,
    fontFamily: FONT_DISPLAY, fontSize: "0.78rem", fontWeight: 600,
    letterSpacing: "0.05em", border: `1px solid ${C.border}`, borderRadius: 8,
    padding: "6px 12px", cursor: "pointer",
  },
  btnSmallGold: {
    background: C.goldDim, color: C.gold,
    fontFamily: FONT_DISPLAY, fontSize: "0.78rem", fontWeight: 600,
    letterSpacing: "0.05em", border: `1px solid ${C.goldBorder}`, borderRadius: 8,
    padding: "6px 12px", cursor: "pointer",
  },
  btnSmallGreen: {
    background: C.greenDim, color: C.green,
    fontFamily: FONT_DISPLAY, fontSize: "0.78rem", fontWeight: 600,
    letterSpacing: "0.05em", border: `1px solid ${C.greenBorder}`, borderRadius: 8,
    padding: "6px 12px", cursor: "pointer",
  },
  btnSmallRed: {
    background: C.redDim, color: C.red,
    fontFamily: FONT_DISPLAY, fontSize: "0.78rem", fontWeight: 600,
    letterSpacing: "0.05em", border: `1px solid ${C.redBorder}`, borderRadius: 8,
    padding: "6px 12px", cursor: "pointer",
  },
  btnRow: { display: "flex", gap: 8, marginTop: 12 },

  // ── Form ──────────────────────────────────────────────────────────────────
  label: {
    fontFamily: FONT_DISPLAY, fontSize: "0.75rem", fontWeight: 600,
    color: C.textDim, letterSpacing: "0.08em", textTransform: "uppercase",
    display: "block", marginBottom: 5,
  },
  input: {
    width: "100%", background: "rgba(255,255,255,0.06)",
    border: `1px solid ${C.border}`, borderRadius: 8,
    padding: "11px 13px", color: C.text,
    fontFamily: FONT_BODY, fontSize: "0.95rem",
    outline: "none",
  },
  select: {
    width: "100%", background: "rgba(255,255,255,0.06)",
    border: `1px solid ${C.border}`, borderRadius: 8,
    padding: "11px 13px", color: C.text,
    fontFamily: FONT_BODY, fontSize: "0.95rem",
    outline: "none", cursor: "pointer",
  },
  formGroup: { marginBottom: 14 },
  inputHint: {
    fontFamily: FONT_BODY, fontSize: "0.73rem", color: C.textFaint, marginTop: 4,
  },

  // ── Dividers ──────────────────────────────────────────────────────────────
  divider: { height: 1, background: C.border, margin: "14px 0" },

  // ── Badges ────────────────────────────────────────────────────────────────
  badgeGold: {
    display: "inline-flex", alignItems: "center",
    background: C.goldDim, border: `1px solid ${C.goldBorder}`,
    color: C.gold, borderRadius: 20, padding: "2px 10px",
    fontFamily: FONT_DISPLAY, fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.06em",
  },
  badgeGreen: {
    display: "inline-flex", alignItems: "center",
    background: C.greenDim, border: `1px solid ${C.greenBorder}`,
    color: C.green, borderRadius: 20, padding: "2px 10px",
    fontFamily: FONT_DISPLAY, fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.06em",
  },
  badgeGray: {
    display: "inline-flex", alignItems: "center",
    background: "rgba(255,255,255,0.07)", border: `1px solid ${C.border}`,
    color: C.textDim, borderRadius: 20, padding: "2px 10px",
    fontFamily: FONT_DISPLAY, fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.06em",
  },
  badgeRed: {
    display: "inline-flex", alignItems: "center",
    background: C.redDim, border: `1px solid ${C.redBorder}`,
    color: C.red, borderRadius: 20, padding: "2px 10px",
    fontFamily: FONT_DISPLAY, fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.06em",
  },

  // ── Leaderboard ───────────────────────────────────────────────────────────
  lbRow: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "10px 0", borderBottom: `1px solid ${C.border}`,
  },
  lbRank: {
    fontFamily: FONT_DISPLAY, fontSize: "1.1rem", fontWeight: 700,
    color: C.textDim, width: 28, textAlign: "center", flexShrink: 0,
  },
  lbName: {
    fontFamily: FONT_DISPLAY, fontSize: "0.95rem", fontWeight: 600,
    color: C.text, flex: 1,
  },
  lbEarnings: {
    fontFamily: FONT_DISPLAY, fontSize: "0.9rem", fontWeight: 600, color: C.gold,
  },

  // ── Golfer pick card ──────────────────────────────────────────────────────
  golferCard: {
    display: "flex", alignItems: "center", gap: 10,
    background: C.bgCard, border: `1px solid ${C.border}`,
    borderRadius: 10, padding: "10px 12px", marginBottom: 6,
    cursor: "pointer", userSelect: "none",
  },
  golferCardSelected: {
    display: "flex", alignItems: "center", gap: 10,
    background: C.goldDim, border: `1px solid ${C.goldBorder}`,
    borderRadius: 10, padding: "10px 12px", marginBottom: 6,
    cursor: "pointer", userSelect: "none",
  },
  golferName: {
    fontFamily: FONT_DISPLAY, fontSize: "0.9rem", fontWeight: 600,
    color: C.text, flex: 1,
  },

  // ── Pool card ─────────────────────────────────────────────────────────────
  poolCard: {
    background: C.bgCard, border: `1px solid ${C.border}`,
    borderRadius: 14, padding: "14px 16px", marginBottom: 10,
    cursor: "pointer",
  },
  poolCardTitle: {
    fontFamily: FONT_DISPLAY, fontSize: "1rem", fontWeight: 700,
    color: C.text, letterSpacing: "0.03em", marginBottom: 2,
  },
  poolCardMeta: {
    fontFamily: FONT_BODY, fontSize: "0.8rem", color: C.textDim,
  },

  // ── Empty state ───────────────────────────────────────────────────────────
  empty: {
    textAlign: "center", padding: "40px 20px",
    color: C.textDim, fontFamily: FONT_BODY, fontSize: "0.9rem",
  },
  emptyIcon: { fontSize: "2.5rem", marginBottom: 10 },

  // ── Modal ─────────────────────────────────────────────────────────────────
  modalOverlay: {
    position: "fixed", inset: 0, zIndex: 200,
    background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
    display: "flex", alignItems: "flex-end", justifyContent: "center",
  },
  modalSheet: {
    background: "#142814", borderRadius: "16px 16px 0 0",
    padding: "20px 16px 40px", width: "100%", maxWidth: 540,
    maxHeight: "90vh", overflowY: "auto",
  },
  modalHandle: {
    width: 36, height: 4, background: "rgba(255,255,255,0.15)",
    borderRadius: 2, margin: "0 auto 16px",
  },
  modalTitle: {
    fontFamily: FONT_DISPLAY, fontSize: "1.1rem", fontWeight: 700,
    color: C.text, letterSpacing: "0.05em", marginBottom: 14,
  },

  // ── FAB ───────────────────────────────────────────────────────────────────
  fab: {
    position: "fixed", bottom: 24, right: 16, zIndex: 50,
    width: 52, height: 52, borderRadius: 26,
    background: C.gold, border: "none",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "1.5rem", cursor: "pointer",
    boxShadow: `0 4px 20px rgba(255,182,18,0.4)`,
  },

  // ── Spinner ───────────────────────────────────────────────────────────────
  spinner: {
    display: "inline-block", width: 22, height: 22,
    border: "3px solid rgba(255,255,255,0.15)",
    borderTopColor: C.gold, borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },

  // ── Overlay / full-screen modal ───────────────────────────────────────────
  overlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.72)",
    backdropFilter: "blur(4px)", display: "flex", alignItems: "flex-start", justifyContent: "center",
    zIndex: 1000, overflowY: "auto", padding: "16px",
  },
  modal: {
    background: "rgba(8,22,8,0.97)", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 18, padding: "28px 24px", maxWidth: 480, width: "100%",
    boxShadow: "0 20px 60px rgba(0,0,0,0.8)", flexShrink: 0,
  },
  microBtn: {
    background: "transparent", color: "rgba(255,255,255,0.3)",
    border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8,
    padding: "10px 14px", fontSize: "0.75rem", fontFamily: FONT_DISPLAY, cursor: "pointer",
    minHeight: 44, display: "inline-flex", alignItems: "center",
  },
  primaryBtn: {
    display: "block", width: "100%", padding: "12px", marginTop: 18,
    background: `linear-gradient(135deg,#27ae60,#2ecc71)`, color: "#fff",
    border: "none", borderRadius: 10,
    fontFamily: FONT_DISPLAY, fontSize: "1rem", fontWeight: 700,
    letterSpacing: "0.05em", cursor: "pointer",
  },
  ghostBtn: {
    display: "block", width: "100%", padding: "10px", marginTop: 10,
    background: "transparent", color: "#7dbb7d",
    border: "1px solid rgba(125,187,125,0.25)", borderRadius: 10,
    fontFamily: FONT_DISPLAY, fontSize: "0.88rem", cursor: "pointer",
    letterSpacing: "0.04em",
  },
  row: { display: "flex", gap: 12 },
  profileDivider: { height: 1, background: "rgba(255,255,255,0.08)", margin: "16px 0 10px" },
  profilePwToggle: {
    background: "transparent", border: "none", color: "rgba(255,255,255,0.4)",
    fontFamily: FONT_DISPLAY, fontSize: "0.82rem", cursor: "pointer",
    padding: 0, letterSpacing: "0.04em", marginBottom: 4,
  },
  uploadBtn: {
    padding: "8px 14px", background: "rgba(255,255,255,0.04)",
    border: "1px dashed rgba(255,255,255,0.2)", borderRadius: 9,
    color: "rgba(255,255,255,0.5)", fontFamily: FONT_DISPLAY,
    fontSize: "0.82rem", cursor: "pointer", letterSpacing: "0.04em",
  },
  uploadPreview: {
    width: 38, height: 38, borderRadius: "50%", objectFit: "cover",
    border: "2px solid #FFB612",
  },

  // ── Auth ──────────────────────────────────────────────────────────────────
  authWrap: {
    minHeight: "100vh", display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    padding: "24px 20px",
    background: `linear-gradient(180deg,${C.bg2} 0%,${C.bg} 100%)`,
  },
  authCard: {
    width: "100%", maxWidth: 380,
    background: "rgba(10,26,10,0.92)", border: `1px solid ${C.border}`,
    borderRadius: 16, padding: "28px 24px",
    backdropFilter: "blur(14px)",
    boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
  },
  authLogo: { textAlign: "center", marginBottom: 24 },
  authLogoText: {
    fontFamily: FONT_DISPLAY, fontSize: "2.2rem", fontWeight: 700,
    color: C.gold, letterSpacing: "0.15em",
  },
  authLogoSub: {
    fontFamily: FONT_BODY, fontSize: "0.8rem", color: C.textDim, marginTop: 2,
  },
  authTitle: {
    fontFamily: FONT_DISPLAY, fontSize: "1.1rem", fontWeight: 600,
    color: C.text, letterSpacing: "0.05em", marginBottom: 16,
  },
  authToggle: {
    textAlign: "center", marginTop: 16,
    fontFamily: FONT_BODY, fontSize: "0.85rem", color: C.textDim,
  },
  authToggleLink: {
    color: C.gold, cursor: "pointer", fontWeight: 600,
    background: "none", border: "none", fontSize: "0.85rem", fontFamily: FONT_BODY,
  },
};

export default S;
export { FONT_BODY, FONT_DISPLAY };
