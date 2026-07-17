import { useState } from "react";
import S, { C, FONT_DISPLAY, FONT_BODY } from "./styles";

/**
 * Share sheet for a Pins pool (or the app itself).
 *
 * Props:
 *   pool     — pool object (if null, shares the app homepage)
 *   hostName — display name of the host
 *   onClose  — close handler
 */
export default function ShareModal({ pool, hostName, onClose }) {
  const [copied, setCopied] = useState(false);

  const joinUrl = pool
    ? `${window.location.origin}?join=${pool.code}`
    : "https://pins.yourgamespot.com";

  const shareTitle = pool
    ? `Join ${hostName}'s Pins golf pool — ${pool.name || pool.tournament_name}`
    : "Pins — golf pick'em pools";

  const shareText = pool
    ? `${hostName} invited you to join their Pins golf pool!\n\n` +
      `Pool: ${pool.name || pool.tournament_name}\n` +
      `Tournament: ${pool.tournament_name || ""}\n\n` +
      `Join here:`
    : "Join me on Pins — pick your golfers and win the pot!";

  function handleNativeShare() {
    navigator.share({
      title: shareTitle,
      text: shareText,
      url: joinUrl,
    }).catch(() => {});
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback: select the input text
    }
  }

  const canNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  return (
    <div style={S.overlay} onClick={onClose}>
      <div
        style={{ ...S.modal, maxWidth: 400, width: "95%", textAlign: "center" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: "1.1rem", color: C.gold, margin: 0, letterSpacing: "0.05em" }}>
            {pool ? "Invite Players" : "Share Pins"}
          </h3>
          <button style={S.microBtn} onClick={onClose}>✕</button>
        </div>

        {/* PINS logo mark */}
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: "2rem", fontWeight: 700, color: C.gold, letterSpacing: "0.15em", marginBottom: 4 }}>
          PINS
        </div>
        <div style={{ fontFamily: FONT_BODY, fontSize: "0.78rem", color: C.textDim, marginBottom: 20 }}>
          golf pool
        </div>

        {/* Pool info */}
        {pool && (
          <div style={{
            background: C.goldDim, border: `1px solid ${C.goldBorder}`,
            borderRadius: 10, padding: "10px 14px", marginBottom: 16,
          }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: "0.95rem", fontWeight: 700, color: C.text, marginBottom: 2 }}>
              {pool.name || pool.tournament_name}
            </div>
            <div style={{ fontFamily: FONT_BODY, fontSize: "0.8rem", color: C.textDim }}>
              {pool.tournament_name} · Hosted by {hostName}
            </div>
            <div style={{
              fontFamily: FONT_DISPLAY, fontSize: "1.6rem", fontWeight: 700,
              color: C.gold, letterSpacing: "0.25em", marginTop: 8,
            }}>
              {pool.code}
            </div>
            <div style={{ fontFamily: FONT_BODY, fontSize: "0.72rem", color: C.textDim, marginTop: 2 }}>
              join code
            </div>
          </div>
        )}

        {/* Join link */}
        <div style={{
          background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`,
          borderRadius: 8, padding: "8px 12px", marginBottom: 16,
          fontFamily: FONT_BODY, fontSize: "0.78rem", color: C.textDim,
          wordBreak: "break-all", textAlign: "left",
        }}>
          {joinUrl}
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={handleCopy}
            style={{
              flex: 1, padding: "12px 0", borderRadius: 10,
              background: copied ? "rgba(39,174,96,0.15)" : "rgba(255,255,255,0.06)",
              border: `1px solid ${copied ? C.greenBorder : C.border}`,
              color: copied ? C.green : C.text,
              fontFamily: FONT_DISPLAY, fontSize: "0.9rem", fontWeight: 600,
              letterSpacing: "0.04em", cursor: "pointer",
            }}
          >
            {copied ? "✓ Copied!" : "Copy Link"}
          </button>

          {canNativeShare && (
            <button
              onClick={handleNativeShare}
              style={{
                flex: 1, padding: "12px 0", borderRadius: 10,
                background: C.gold, border: "none",
                color: "#0a1a0a",
                fontFamily: FONT_DISPLAY, fontSize: "0.9rem", fontWeight: 700,
                letterSpacing: "0.04em", cursor: "pointer",
              }}
            >
              Share ↗
            </button>
          )}
        </div>

        <p style={{
          fontFamily: FONT_BODY, fontSize: "0.72rem", color: C.textFaint,
          margin: "12px 0 0", lineHeight: 1.5,
        }}>
          {pool
            ? "Share this link with anyone you want to invite. They'll join your pool automatically."
            : "Share Pins with your friends — create golf pick'em pools for any PGA tournament."}
        </p>
      </div>
    </div>
  );
}
