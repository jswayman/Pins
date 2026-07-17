import { useState, useEffect, useCallback } from "react";
import { getTournamentLeaderboard } from "../api";
import S, { C, FONT_DISPLAY, FONT_BODY } from "./styles";

const REFRESH_MS = 5 * 60 * 1000;

function scoreColor(s) {
  if (!s || s === "-" || s === "E") return C.textDim;
  if (String(s).startsWith("-")) return "#5dbb63";
  if (String(s).startsWith("+")) return "#e87c6a";
  return C.textDim;
}

function fmtPos(pos, status) {
  if (status === "cut") return "CUT";
  if (status === "withdrawn") return "WD";
  if (!pos) return "—";
  return String(pos);
}

function fmt$(cents) {
  if (!cents) return "";
  if (cents >= 100000000) return "$" + (cents / 100 / 1e6).toFixed(2) + "M";
  if (cents >= 100000) return "$" + Math.round(cents / 100 / 1000) + "K";
  return "$" + (cents / 100).toLocaleString("en-US", { maximumFractionDigits: 0 });
}

/**
 * TV-style PGA tournament leaderboard (golfer standings).
 * Props:
 *   tournamentId  — pins_tournaments.id
 *   myPickIds     — optional Set/array of espn golfer ids to highlight
 */
export default function TournamentBoard({ tournamentId, myPickIds = [] }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // all | active | mypicks

  const pickSet = new Set((myPickIds || []).map(String));

  const load = useCallback(async (quiet = false, force = false) => {
    if (!tournamentId) return;
    if (!quiet) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await getTournamentLeaderboard(tournamentId, force);
      setData(res);
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [tournamentId]);

  useEffect(() => {
    load();
    const interval = setInterval(() => load(true), REFRESH_MS);
    return () => clearInterval(interval);
  }, [load]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 40 }}>
        <span style={S.spinner} />
      </div>
    );
  }

  if (error && !data) {
    return <div style={S.errorBanner}>{error}</div>;
  }

  const golfers = data?.golfers || [];
  const maxRounds = golfers.reduce((m, g) => Math.max(m, (g.rounds || []).length), 0);

  let shown = golfers;
  if (filter === "active") shown = golfers.filter(g => g.status === "active");
  if (filter === "mypicks") shown = golfers.filter(g => pickSet.has(String(g.espnGolferId)));

  const statusLabel = data?.status === "completed" ? "FINAL"
    : data?.status === "active" ? "LIVE"
    : "FIELD";

  return (
    <div>
      {/* Board header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 10, gap: 8, flexWrap: "wrap",
      }}>
        <div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: "0.72rem", color: C.textDim, letterSpacing: "0.1em" }}>
            TOURNAMENT LEADERBOARD
          </div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: "1rem", fontWeight: 700, color: C.text }}>
            {data?.name}
            <span style={{
              marginLeft: 8, fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.08em",
              color: data?.status === "active" ? C.green : C.gold,
              background: data?.status === "active" ? C.greenDim : C.goldDim,
              border: `1px solid ${data?.status === "active" ? C.greenBorder : C.goldBorder}`,
              borderRadius: 6, padding: "2px 7px", verticalAlign: "middle",
            }}>
              {statusLabel}
            </span>
          </div>
        </div>
        <button
          style={{ ...S.btnSmall, opacity: refreshing ? 0.6 : 1 }}
          onClick={() => load(true, true)}
          disabled={refreshing}
        >
          {refreshing ? "…" : "↻ Refresh"}
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        {[
          ["all", "All"],
          ["active", "Active"],
          ...(pickSet.size ? [["mypicks", "My Picks"]] : []),
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            style={{
              ...S.btnSmall,
              background: filter === key ? C.goldDim : "rgba(255,255,255,0.04)",
              border: `1px solid ${filter === key ? C.goldBorder : C.border}`,
              color: filter === key ? C.gold : C.textDim,
              fontSize: "0.75rem",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div style={S.empty}>
          <div style={S.emptyIcon}>📺</div>
          <div>
            {data?.status === "upcoming"
              ? "Leaderboard will appear once the tournament starts."
              : filter === "mypicks"
                ? "None of your picks are on the board yet."
                : "No golfer scores yet."}
          </div>
        </div>
      ) : (
        <div style={{
          background: C.bgCard,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          overflow: "hidden",
        }}>
          {/* Column headers */}
          <div style={{
            display: "grid",
            gridTemplateColumns: `36px 1fr 42px 42px 40px ${maxRounds > 0 ? `repeat(${maxRounds}, 36px)` : ""} 56px`,
            gap: 4,
            padding: "8px 10px",
            background: "rgba(0,0,0,0.3)",
            borderBottom: `1px solid ${C.border}`,
            fontFamily: FONT_DISPLAY,
            fontSize: "0.65rem",
            color: C.textFaint,
            letterSpacing: "0.06em",
            position: "sticky",
            top: 0,
          }}>
            <div>POS</div>
            <div>PLAYER</div>
            <div style={{ textAlign: "right" }}>TOT</div>
            <div style={{ textAlign: "right" }}>TODAY</div>
            <div style={{ textAlign: "center" }}>THRU</div>
            {Array.from({ length: maxRounds }, (_, i) => (
              <div key={i} style={{ textAlign: "right" }}>R{i + 1}</div>
            ))}
            <div style={{ textAlign: "right" }}>$</div>
          </div>

          <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
            {shown.map((g, i) => {
              const isMine = pickSet.has(String(g.espnGolferId));
              const isCut = g.status === "cut" || g.status === "withdrawn";
              const posLabel = fmtPos(g.position, g.status);
              return (
                <div
                  key={g.espnGolferId || i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: `36px 1fr 42px 42px 40px ${maxRounds > 0 ? `repeat(${maxRounds}, 36px)` : ""} 56px`,
                    gap: 4,
                    padding: "8px 10px",
                    alignItems: "center",
                    background: isMine ? C.goldDim : (i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)"),
                    borderBottom: `1px solid rgba(255,255,255,0.04)`,
                    opacity: isCut ? 0.55 : 1,
                  }}
                >
                  <div style={{
                    fontFamily: FONT_DISPLAY, fontSize: "0.8rem", fontWeight: 700,
                    color: posLabel === "1" ? C.gold : C.textDim,
                  }}>
                    {posLabel}
                  </div>
                  <div style={{
                    fontFamily: FONT_DISPLAY, fontSize: "0.85rem", fontWeight: isMine ? 700 : 500,
                    color: isMine ? C.gold : C.text,
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>
                    {g.name}
                    {isMine && <span style={{ marginLeft: 4, fontSize: "0.65rem", color: C.gold }}>★</span>}
                  </div>
                  <div style={{
                    fontFamily: FONT_DISPLAY, fontSize: "0.85rem", fontWeight: 700,
                    textAlign: "right", color: scoreColor(g.scoreToPar),
                  }}>
                    {g.scoreToPar || "—"}
                  </div>
                  <div style={{
                    fontFamily: FONT_DISPLAY, fontSize: "0.8rem",
                    textAlign: "right", color: scoreColor(g.today),
                  }}>
                    {g.today || "—"}
                  </div>
                  <div style={{
                    fontFamily: FONT_DISPLAY, fontSize: "0.72rem",
                    textAlign: "center", color: C.textDim,
                  }}>
                    {g.thru || "—"}
                  </div>
                  {Array.from({ length: maxRounds }, (_, ri) => (
                    <div key={ri} style={{
                      fontFamily: FONT_DISPLAY, fontSize: "0.72rem",
                      textAlign: "right", color: scoreColor(g.rounds?.[ri]),
                    }}>
                      {g.rounds?.[ri] ?? "—"}
                    </div>
                  ))}
                  <div style={{
                    fontFamily: FONT_DISPLAY, fontSize: "0.72rem",
                    textAlign: "right", color: C.textFaint,
                  }}>
                    {fmt$(g.earningsCents)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {data?.updatedAt && (
        <div style={{ fontFamily: FONT_BODY, fontSize: "0.7rem", color: C.textFaint, marginTop: 8, textAlign: "right" }}>
          Scores updated {new Date(data.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      )}
    </div>
  );
}
