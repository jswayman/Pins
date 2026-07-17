import S, { C, FONT_DISPLAY } from "./styles";

export default function AboutModal({ onClose }) {
  return (
    <div style={S.overlay} onClick={onClose}>
      <div
        style={{ ...S.modal, maxWidth: 400, width: "92%", textAlign: "center" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Logo */}
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: "2.2rem", fontWeight: 700, letterSpacing: "0.15em", marginBottom: 2 }}>
          <span style={{ color: C.gold }}>PINS</span>
        </div>

        <div style={{ color: C.textDim, fontFamily: FONT_DISPLAY, fontSize: "0.72rem", letterSpacing: "0.14em", marginBottom: 4 }}>
          GOLF PICK'EM POOL
        </div>

        <div style={{ color: "rgba(255,255,255,0.2)", fontFamily: FONT_DISPLAY, fontSize: "0.68rem", letterSpacing: "0.08em", marginBottom: 24 }}>
          v1.3
        </div>

        <p style={{ color: C.textDim, fontSize: "0.88rem", lineHeight: 1.65, margin: "0 0 20px", fontFamily: "'Inter',sans-serif" }}>
          Pins is a golf pick'em pool for PGA Tour events. Select 10 golfers from the tournament field — their combined prize earnings become your pool score. Highest score wins the pot.
        </p>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 16, marginBottom: 20 }}>
          {[
            ["PGA Tour events",   "Live field & results via ESPN Golf API"],
            ["10-golfer picks",   "Combined prize earnings = your score"],
            ["Public & private",  "Browse open pools or join by code"],
            ["Live standings",    "Leaderboard updates every 5 minutes"],
            ["Host controls",     "Payments, payout report, lock picks"],
            ["Display Names",     "Custom name shown on all leaderboards"],
            ["Avatar picker",     "DiceBear styles, emoji, or custom photo"],
            ["Shared account",    "Same login as GameGrid, GridIron & GameNight"],
          ].map(([feature, desc]) => (
            <div
              key={feature}
              style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, marginBottom: 8 }}
            >
              <span style={{ color: C.gold, fontFamily: FONT_DISPLAY, fontSize: "0.8rem", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
                {feature}
              </span>
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.78rem", textAlign: "right" }}>{desc}</span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            style={{ ...S.ghostBtn, flex: 1, marginTop: 0 }}
            onClick={() => window.open("/help.html", "_blank")}
          >
            ❓ View Help
          </button>
          <button style={{ ...S.primaryBtn, flex: 1, marginTop: 0 }} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
