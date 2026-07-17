import S, { C, FONT_DISPLAY } from "./styles";

export default function AboutModal({ onClose }) {
  return (
    <div style={S.overlay} onClick={onClose}>
      <div
        style={{ ...S.modal, maxWidth: 420, width: "92%", textAlign: "center" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Logo */}
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: "2.2rem", fontWeight: 700, letterSpacing: "0.15em", marginBottom: 2 }}>
          <span style={{ color: C.gold }}>PINS</span>
        </div>

        <div style={{ color: C.textDim, fontFamily: FONT_DISPLAY, fontSize: "0.72rem", letterSpacing: "0.14em", marginBottom: 4 }}>
          GOLF PICK'EM POOL
        </div>

        <div style={{ color: "rgba(255,255,255,0.2)", fontFamily: FONT_DISPLAY, fontSize: "0.68rem", letterSpacing: "0.08em", marginBottom: 20 }}>
          v1.3
        </div>

        <p style={{ color: C.textDim, fontSize: "0.88rem", lineHeight: 1.65, margin: "0 0 16px", fontFamily: "'Inter',sans-serif", textAlign: "left" }}>
          Pick 10 golfers before the tournament. Your score is the sum of their estimated prize earnings from the event purse. Highest score wins your friends' pot.
        </p>

        {/* Scoring explainer */}
        <div style={{
          textAlign: "left",
          background: "rgba(255,182,18,0.07)",
          border: "1px solid rgba(255,182,18,0.22)",
          borderRadius: 12,
          padding: "14px 14px 12px",
          marginBottom: 16,
        }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: "0.75rem", color: C.gold, letterSpacing: "0.1em", marginBottom: 8 }}>
            HOW WINNINGS / SCORES WORK
          </div>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.82rem", lineHeight: 1.55, margin: "0 0 8px", fontFamily: "'Inter',sans-serif" }}>
            <strong style={{ color: C.text }}>Leaderboard score</strong> = each golfer's finish × standard PGA payout % × tournament purse, then summed across your 10 picks.
          </p>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.82rem", lineHeight: 1.55, margin: "0 0 8px", fontFamily: "'Inter',sans-serif" }}>
            Example: $20M purse → 1st earns 18% ($3.6M), 10th earns 2.7% ($540K). Missed cut = $0.
          </p>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.82rem", lineHeight: 1.55, margin: 0, fontFamily: "'Inter',sans-serif" }}>
            <strong style={{ color: C.text }}>Cash you win</strong> comes from the pool pot (entries × entry fee), split by the host's payout % (e.g. 70/20/10) — not from the PGA purse.
          </p>
          <button
            type="button"
            onClick={() => window.open("/help.html#scoring", "_blank")}
            style={{
              marginTop: 10, background: "none", border: "none", padding: 0,
              color: C.gold, fontSize: "0.8rem", fontFamily: FONT_DISPLAY,
              letterSpacing: "0.04em", cursor: "pointer", textDecoration: "underline",
            }}
          >
            Full scoring guide →
          </button>
        </div>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 16, marginBottom: 20 }}>
          {[
            ["PGA Tour events",   "Live field & results via ESPN Golf API"],
            ["10-golfer picks",   "Combined purse earnings = your score"],
            ["Field leaderboard", "TV-style golfer standings inside each pool"],
            ["Pool chat",         "Trash talk with your group in real time"],
            ["Host controls",     "Payments, payout report, lock picks"],
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
