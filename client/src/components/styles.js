const FONT_BODY    = "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif";
const FONT_DISPLAY = "'Oswald', sans-serif";

// ── Brand palette ─────────────────────────────────────────────────────────────
export const C = {
  bg:          "#0a1a08",
  bgMid:       "#122010",
  bgCard:      "rgba(255,255,255,0.04)",
  bgCardHover: "rgba(255,255,255,0.07)",
  border:      "rgba(255,255,255,0.08)",
  borderLight: "rgba(255,255,255,0.12)",
  gold:        "#D4AF37",    // flag pin gold
  goldLight:   "#F0CC58",
  green:       "#4CAF50",
  greenDim:    "#2E7D32",
  red:         "#e74c3c",
  redDim:      "rgba(231,76,60,0.15)",
  text:        "#ffffff",
  textDim:     "rgba(255,255,255,0.55)",
  textFaint:   "rgba(255,255,255,0.3)",
};

const S = {
  root: {
    minHeight: "100vh",
    background: C.bg,
    fontFamily: FONT_BODY,
    position: "relative",
    overflowX: "hidden",
    paddingTop: "env(safe-area-inset-top, 0px)",
  },

  // ── Decorative field background ───────────────────────────────────────────
  fieldBg: {
    position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
    background: `
      repeating-linear-gradient(0deg,transparent,transparent 60px,rgba(255,255,255,0.02) 60px,rgba(255,255,255,0.02) 62px),
      repeating-linear-gradient(90deg,transparent,transparent 60px,rgba(255,255,255,0.02) 60px,rgba(255,255,255,0.02) 62px),
      linear-gradient(180deg,#0f2210 0%,#0a1a08 50%,#0f2210 100%)
    `,
  },

  // ── Loading / centering ───────────────────────────────────────────────────
  loadWrap: {
    minHeight: "100vh", display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    background: C.bg,
  },

  // ── Banners ───────────────────────────────────────────────────────────────
  errorBanner: {
    background: "rgba(192,57,43,0.18)", border: "1px solid rgba(192,57,43,0.35)",
    color: C.red, borderRadius: 8, padding: "9px 14px", marginBottom: 10,
    fontFamily: FONT_DISPLAY, fontSize: "0.85rem",
  },
  infoBanner: {
    background: "rgba(76,175,80,0.12)", border: "1px solid rgba(76,175,80,0.3)",
    color: C.green, borderRadius: 8, padding: "9px 14px", marginBottom: 10,
    fontFamily: FONT_DISPLAY, fontSize: "0.85rem",
  },
  warnBanner: {
    background: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.3)",
    color: C.gold, borderRadius: 8, padding: "9px 14px", marginBottom: 10,
    fontFamily: FONT_DISPLAY, fontSize: "0.85rem",
  },

  // ── App header ────────────────────────────────────────────────────────────
  appHeader: {
    position: "sticky", top: 0, zIndex: 100,
    display: "flex", flexDirection: "column",
    background: "rgba(6,14,6,0.97)", backdropFilter: "blur(12px)",
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
    fontFamily: FONT_DISPLAY, fontSize: "1.3rem", fontWeight: 700,
    color: C.gold, letterSpacing: "0.12em",
  },
  headerLogoSub: {
    fontFamily: FONT_DISPLAY, fontSize: "0.65rem", fontWeight: 400,
    color: C.textDim, letterSpacing: "0.08em", marginLeft: 2,
  },
  headerUser: {
    display: "flex", alignItems: "center", gap: 8,
    background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}`,
    borderRadius: 24, padding: "5px 12px 5px 6px", cursor: "pointer",
  },
  headerAvatar: { fontSize: "1.3rem", lineHeight: 1 },
  headerUserName: {
    fontFamily: FONT_DISPLAY, fontSize: "0.85rem", color: C.text,
    letterSpacing: "0.04em", maxWidth: 110, overflow: "hidden",
    textOverflow: "ellipsis", whiteSpace: "nowrap",
  },

  // ── Scrollable page body ──────────────────────────────────────────────────
  page: {
    position: "relative", zIndex: 1,
    padding: "16px 14px 80px",
    maxWidth: 540, margin: "0 auto",
  },
  pageWide: {
    position: "relative", zIndex: 1,
    padding: "16px 14px 80px",
    maxWidth: 700, margin: "0 auto",
  },

  // ── Section headings ──────────────────────────────────────────────────────
  sectionTitle: {
    fontFamily: FONT_DISPLAY, fontSize: "0.75rem", fontWeight: 600,
    color: C.textDim, letterSpacing: "0.1em", textTransform: "uppercase",
    marginBottom: 8,
  },
  pageTitle: {
    fontFamily: FONT_DISPLAY, fontSize: "1.4rem", fontWeight: 700,
    color: C.text, letterSpacing: "0.05em", marginBottom: 4,
  },
  pageSub: {
    fontFamily: FONT_BODY, fontSize: "0.85rem", color: C.textDim,
    marginBottom: 16,
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
    background: C.gold, color: "#0a1a08",
    fontFamily: FONT_DISPLAY, fontSize: "0.95rem", fontWeight: 700,
    letterSpacing: "0.06em", border: "none", borderRadius: 10,
    padding: "12px 24px", cursor: "pointer", width: "100%",
    transition: "opacity 0.15s",
  },
  btnSecondary: {
    background: "transparent", color: C.text,
    fontFamily: FONT_DISPLAY, fontSize: "0.9rem", fontWeight: 600,
    letterSpacing: "0.05em",
    border: `1px solid ${C.border}`, borderRadius: 10,
    padding: "11px 20px", cursor: "pointer", width: "100%",
    transition: "background 0.15s",
  },
  btnDanger: {
    background: "transparent", color: C.red,
    fontFamily: FONT_DISPLAY, fontSize: "0.9rem", fontWeight: 600,
    letterSpacing: "0.05em",
    border: `1px solid rgba(231,76,60,0.35)`, borderRadius: 10,
    padding: "11px 20px", cursor: "pointer", width: "100%",
  },
  btnSmall: {
    background: "rgba(255,255,255,0.08)", color: C.text,
    fontFamily: FONT_DISPLAY, fontSize: "0.78rem", fontWeight: 600,
    letterSpacing: "0.05em", border: `1px solid ${C.border}`, borderRadius: 8,
    padding: "6px 12px", cursor: "pointer",
  },
  btnSmallGold: {
    background: "rgba(212,175,55,0.15)", color: C.gold,
    fontFamily: FONT_DISPLAY, fontSize: "0.78rem", fontWeight: 600,
    letterSpacing: "0.05em", border: `1px solid rgba(212,175,55,0.3)`, borderRadius: 8,
    padding: "6px 12px", cursor: "pointer",
  },
  btnSmallGreen: {
    background: "rgba(76,175,80,0.12)", color: C.green,
    fontFamily: FONT_DISPLAY, fontSize: "0.78rem", fontWeight: 600,
    letterSpacing: "0.05em", border: `1px solid rgba(76,175,80,0.3)`, borderRadius: 8,
    padding: "6px 12px", cursor: "pointer",
  },
  btnSmallRed: {
    background: C.redDim, color: C.red,
    fontFamily: FONT_DISPLAY, fontSize: "0.78rem", fontWeight: 600,
    letterSpacing: "0.05em", border: `1px solid rgba(231,76,60,0.3)`, borderRadius: 8,
    padding: "6px 12px", cursor: "pointer",
  },
  btnRow: {
    display: "flex", gap: 8, marginTop: 12,
  },

  // ── Form elements ─────────────────────────────────────────────────────────
  label: {
    fontFamily: FONT_DISPLAY, fontSize: "0.78rem", fontWeight: 600,
    color: C.textDim, letterSpacing: "0.06em", textTransform: "uppercase",
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
    fontFamily: FONT_BODY, fontSize: "0.75rem", color: C.textFaint,
    marginTop: 4,
  },

  // ── Dividers ──────────────────────────────────────────────────────────────
  divider: {
    height: 1, background: C.border, margin: "14px 0",
  },

  // ── Badge / chip ──────────────────────────────────────────────────────────
  badgeGold: {
    display: "inline-flex", alignItems: "center",
    background: "rgba(212,175,55,0.15)", border: "1px solid rgba(212,175,55,0.3)",
    color: C.gold, borderRadius: 20, padding: "2px 10px",
    fontFamily: FONT_DISPLAY, fontSize: "0.75rem", fontWeight: 600,
    letterSpacing: "0.06em",
  },
  badgeGreen: {
    display: "inline-flex", alignItems: "center",
    background: "rgba(76,175,80,0.12)", border: "1px solid rgba(76,175,80,0.3)",
    color: C.green, borderRadius: 20, padding: "2px 10px",
    fontFamily: FONT_DISPLAY, fontSize: "0.75rem", fontWeight: 600,
    letterSpacing: "0.06em",
  },
  badgeGray: {
    display: "inline-flex", alignItems: "center",
    background: "rgba(255,255,255,0.07)", border: `1px solid ${C.border}`,
    color: C.textDim, borderRadius: 20, padding: "2px 10px",
    fontFamily: FONT_DISPLAY, fontSize: "0.75rem", fontWeight: 600,
    letterSpacing: "0.06em",
  },
  badgeRed: {
    display: "inline-flex", alignItems: "center",
    background: C.redDim, border: "1px solid rgba(231,76,60,0.3)",
    color: C.red, borderRadius: 20, padding: "2px 10px",
    fontFamily: FONT_DISPLAY, fontSize: "0.75rem", fontWeight: 600,
    letterSpacing: "0.06em",
  },

  // ── Leaderboard row ───────────────────────────────────────────────────────
  lbRow: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "10px 0", borderBottom: `1px solid ${C.border}`,
  },
  lbRank: {
    fontFamily: FONT_DISPLAY, fontSize: "1.1rem", fontWeight: 700,
    color: C.textDim, width: 28, textAlign: "center", flexShrink: 0,
  },
  lbRankFirst: {
    fontFamily: FONT_DISPLAY, fontSize: "1.1rem", fontWeight: 700,
    color: C.gold, width: 28, textAlign: "center", flexShrink: 0,
  },
  lbName: {
    fontFamily: FONT_DISPLAY, fontSize: "0.95rem", fontWeight: 600,
    color: C.text, flex: 1,
  },
  lbEarnings: {
    fontFamily: FONT_DISPLAY, fontSize: "0.9rem", fontWeight: 600,
    color: C.gold,
  },

  // ── Golfer pick card ──────────────────────────────────────────────────────
  golferCard: {
    display: "flex", alignItems: "center", gap: 10,
    background: C.bgCard, border: `1px solid ${C.border}`,
    borderRadius: 10, padding: "10px 12px", marginBottom: 6,
    cursor: "pointer", transition: "background 0.12s",
    userSelect: "none",
  },
  golferCardSelected: {
    display: "flex", alignItems: "center", gap: 10,
    background: "rgba(212,175,55,0.12)", border: `1px solid rgba(212,175,55,0.4)`,
    borderRadius: 10, padding: "10px 12px", marginBottom: 6,
    cursor: "pointer", transition: "background 0.12s",
    userSelect: "none",
  },
  golferName: {
    fontFamily: FONT_DISPLAY, fontSize: "0.9rem", fontWeight: 600,
    color: C.text, flex: 1,
  },
  golferScore: {
    fontFamily: FONT_DISPLAY, fontSize: "0.85rem", color: C.textDim,
  },
  golferPos: {
    fontFamily: FONT_DISPLAY, fontSize: "0.8rem", color: C.textFaint,
    width: 28, textAlign: "center",
  },

  // ── Empty state ───────────────────────────────────────────────────────────
  empty: {
    textAlign: "center", padding: "40px 20px",
    color: C.textDim, fontFamily: FONT_BODY, fontSize: "0.9rem",
  },
  emptyIcon: {
    fontSize: "2.5rem", marginBottom: 10,
  },

  // ── Modal overlay ─────────────────────────────────────────────────────────
  modalOverlay: {
    position: "fixed", inset: 0, zIndex: 200,
    background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
    display: "flex", alignItems: "flex-end", justifyContent: "center",
  },
  modalSheet: {
    background: "#122010", borderRadius: "16px 16px 0 0",
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

  // ── Tab bar ───────────────────────────────────────────────────────────────
  tabBar: {
    position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
    display: "flex",
    background: "rgba(6,14,6,0.97)", backdropFilter: "blur(12px)",
    borderTop: "1px solid rgba(255,255,255,0.07)",
    paddingBottom: "env(safe-area-inset-bottom, 0px)",
  },
  tabBtn: {
    flex: 1, display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    padding: "8px 4px", background: "transparent", border: "none",
    cursor: "pointer", gap: 2,
  },
  tabIcon: { fontSize: "1.3rem", lineHeight: 1 },
  tabLabel: {
    fontFamily: FONT_DISPLAY, fontSize: "0.6rem", letterSpacing: "0.07em",
    textTransform: "uppercase",
  },

  // ── Auth screen ───────────────────────────────────────────────────────────
  authWrap: {
    minHeight: "100vh", display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    padding: "24px 20px",
    background: `linear-gradient(180deg,#0d1f0b 0%,${C.bg} 100%)`,
  },
  authCard: {
    width: "100%", maxWidth: 380,
    background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`,
    borderRadius: 16, padding: "28px 24px",
  },
  authLogo: {
    textAlign: "center", marginBottom: 24,
  },
  authLogoText: {
    fontFamily: FONT_DISPLAY, fontSize: "2.2rem", fontWeight: 700,
    color: C.gold, letterSpacing: "0.15em",
  },
  authLogoSub: {
    fontFamily: FONT_BODY, fontSize: "0.8rem", color: C.textDim,
    marginTop: 2,
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
    background: "none", border: "none", fontSize: "0.85rem",
    fontFamily: FONT_BODY,
  },

  // ── Pool card on home ─────────────────────────────────────────────────────
  poolCard: {
    background: C.bgCard, border: `1px solid ${C.border}`,
    borderRadius: 14, padding: "14px 16px", marginBottom: 10,
    cursor: "pointer", transition: "background 0.15s",
  },
  poolCardTitle: {
    fontFamily: FONT_DISPLAY, fontSize: "1rem", fontWeight: 700,
    color: C.text, letterSpacing: "0.03em", marginBottom: 2,
  },
  poolCardMeta: {
    fontFamily: FONT_BODY, fontSize: "0.8rem", color: C.textDim,
  },
  poolCardRow: {
    display: "flex", alignItems: "center",
    justifyContent: "space-between", marginTop: 8,
  },

  // ── FAB ───────────────────────────────────────────────────────────────────
  fab: {
    position: "fixed", bottom: 72, right: 16, zIndex: 50,
    width: 52, height: 52, borderRadius: 26,
    background: C.gold, border: "none",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "1.5rem", cursor: "pointer",
    boxShadow: "0 4px 16px rgba(212,175,55,0.4)",
  },

  // ── Spinner ───────────────────────────────────────────────────────────────
  spinner: {
    display: "inline-block", width: 22, height: 22,
    border: "3px solid rgba(255,255,255,0.15)",
    borderTopColor: C.gold, borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },
};

export default S;
export { FONT_BODY, FONT_DISPLAY };
