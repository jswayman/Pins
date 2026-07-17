import { useState, useEffect, useCallback } from "react";
import { getPool } from "../api";
import { getDisplayName } from "../utils/displayName";
import S, { C, FONT_DISPLAY, FONT_BODY } from "./styles";
import PinsHeader from "./PinsHeader";
import ShareModal from "./ShareModal";

const REFRESH_MS = 5 * 60 * 1000; // 5 minutes

function fmt$(cents) {
  if (!cents) return "$0";
  return "$" + (cents / 100).toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function scoreColor(s) {
  if (!s || s === "E") return C.textDim;
  if (s.startsWith("-")) return "#5dbb63";
  if (s.startsWith("+")) return "#e87c6a";
  return C.textDim;
}

function medalIcon(rank) {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return null;
}

function statusBadge(poolStatus, tournamentStatus) {
  if (tournamentStatus === "completed") return <span style={S.badgeGold}>FINAL</span>;
  if (tournamentStatus === "active")    return <span style={S.badgeGreen}>LIVE</span>;
  if (poolStatus === "locked")          return <span style={S.badgeGray}>LOCKED</span>;
  if (poolStatus === "open")            return <span style={S.badgeGray}>OPEN</span>;
  return null;
}

function PayoutBar({ payout, totalEntries, entryFeeCents }) {
  const places = Object.entries(payout).sort((a, b) => Number(a[0]) - Number(b[0]));
  const totalPot = totalEntries * (entryFeeCents || 0);
  if (!totalPot) return null;
  const labels = ["1st", "2nd", "3rd", "4th", "5th"];
  return (
    <div style={{ ...S.container, marginBottom: 12 }}>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: "0.75rem", color: C.textDim, letterSpacing: "0.08em", marginBottom: 8 }}>
        PRIZE POOL · {fmt$(totalPot)} ({totalEntries} entr{totalEntries === 1 ? "y" : "ies"} × {fmt$(entryFeeCents)})
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {places.map(([pos, pct]) => (
          <div key={pos} style={{
            flex: 1, minWidth: 60,
            background: C.goldDim,
            border: `1px solid ${C.goldBorder}`,
            borderRadius: 8, padding: "6px 8px", textAlign: "center",
          }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: "0.75rem", color: C.textDim }}>{labels[Number(pos)-1]}</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: "0.9rem", fontWeight: 700, color: C.gold }}>
              {fmt$(Math.round(Number(pct) / 100 * totalPot))}
            </div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: "0.68rem", color: C.textFaint }}>{pct}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EntryCard({ entry, rank, currentUserId, expanded, onToggle }) {
  const isMe = entry.user_id === currentUserId;
  const medal = medalIcon(rank);

  return (
    <div
      style={{
        background: isMe ? C.goldDim : C.bgCard,
        border: `1px solid ${isMe ? C.goldBorder : C.border}`,
        borderRadius: 12, marginBottom: 8, overflow: "hidden",
        cursor: "pointer",
      }}
      onClick={onToggle}
    >
      <div style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ ...S.lbRank, width: 32 }}>
          {medal || <span style={{ color: rank <= 3 ? C.gold : C.textDim }}>{rank}</span>}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: "0.9rem", fontWeight: 700, color: C.text }}>
            {getDisplayName(entry)}
            {entry.entry_number > 1 && (
              <span style={{ fontFamily: FONT_DISPLAY, fontSize: "0.7rem", color: C.textDim, marginLeft: 6 }}>
                #{entry.entry_number}
              </span>
            )}
            {isMe && <span style={{ marginLeft: 6, fontSize: "0.7rem", color: C.gold }}>(you)</span>}
          </div>
          <div style={{ fontFamily: FONT_BODY, fontSize: "0.75rem", color: C.textDim, marginTop: 1 }}>
            {(entry.picksDetail || []).filter(p => p.position).length} / {(entry.picks || []).length} golfers active
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: "1.05rem", fontWeight: 700, color: C.gold }}>
            {fmt$(entry.total_earnings_cents)}
          </div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: "0.68rem", color: C.textDim, letterSpacing: "0.06em" }}>
            {expanded ? "▲ HIDE" : "▼ PICKS"}
          </div>
        </div>
      </div>

      {expanded && (
        <div style={{ borderTop: `1px solid ${C.border}`, padding: "8px 14px 12px" }}>
          {(entry.picksDetail || []).map((g, i) => (
            <div key={g.espn_golfer_id || i} style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "5px 0", borderBottom: i < entry.picksDetail.length - 1 ? `1px solid rgba(255,255,255,0.04)` : "none",
            }}>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: "0.8rem", color: C.textFaint, width: 18 }}>
                {i + 1}
              </div>
              <div style={{ flex: 1, fontFamily: FONT_DISPLAY, fontSize: "0.85rem", color: g.status === "cut" ? C.textFaint : C.text }}>
                {g.name}
                {g.status === "cut" && <span style={{ color: C.red, marginLeft: 6, fontSize: "0.7rem" }}>CUT</span>}
              </div>
              {g.position && (
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontFamily: FONT_DISPLAY, fontSize: "0.78rem", color: C.textDim }}>
                    T{g.position}{"  "}
                  </span>
                  <span style={{ fontFamily: FONT_DISPLAY, fontSize: "0.78rem", color: scoreColor(g.score_to_par) }}>
                    {g.score_to_par}
                  </span>
                </div>
              )}
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: "0.82rem", color: C.gold, minWidth: 60, textAlign: "right" }}>
                {fmt$(g.earnings_cents)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function LeaderboardScreen({ poolCode, currentUser, onBack, onPickEntry, onHostDashboard }) {
  const [pool, setPool]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showShare, setShowShare] = useState(false);

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    else setRefreshing(true);
    try {
      const data = await getPool(poolCode);
      setPool(data);
      setLastUpdated(new Date());
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [poolCode]);

  useEffect(() => {
    load();
    const interval = setInterval(() => load(true), REFRESH_MS);
    return () => clearInterval(interval);
  }, [load]);

  function toggleExpand(id) {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  }

  if (loading) {
    return <div style={{ ...S.page, textAlign: "center", paddingTop: 60 }}><span style={S.spinner} /></div>;
  }

  if (!pool) {
    return (
      <div style={S.page}>
        <div style={S.errorBanner}>{error || "Pool not found"}</div>
        <button style={S.btnSecondary} onClick={onBack}>Back</button>
      </div>
    );
  }

  const isHost = pool.isHost;
  const canPick = pool.status === "open" && pool.tournament_status !== "completed";
  const entries = pool.entries || [];
  const payout = pool.payout || {};

  return (
    <>
    <div style={S.root}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={S.fieldBg} />

      <PinsHeader
        onBack={onBack}
        title={pool.name}
        subtitle={pool.tournament_name}
        right={
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginRight: 6 }}>
            {refreshing && <span style={{ ...S.spinner, width: 16, height: 16, borderWidth: 2 }} />}
            {statusBadge(pool.status, pool.tournament_status)}
          </div>
        }
      />

      <div style={{ ...S.pageWide, paddingBottom: 120 }}>
        {error && <div style={S.errorBanner}>{error}</div>}

        {/* Join code */}
        {pool.status === "open" && (
          <div style={{ ...S.container, marginBottom: 14, textAlign: "center" }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: "0.72rem", color: C.textDim, letterSpacing: "0.1em", marginBottom: 4 }}>
              JOIN CODE
            </div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: "2rem", fontWeight: 700, color: C.gold, letterSpacing: "0.2em" }}>
              {poolCode}
            </div>
            <div style={{ fontFamily: FONT_BODY, fontSize: "0.75rem", color: C.textFaint, marginTop: 2 }}>
              Share this code to invite players
            </div>
          </div>
        )}

        {/* Prize pool */}
        <PayoutBar
          payout={payout}
          totalEntries={entries.length}
          entryFeeCents={pool.entry_fee_cents}
        />

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {canPick && (
            <button style={{ ...S.btnPrimary, flex: 2 }} onClick={onPickEntry}>
              + Add Entry
            </button>
          )}
          <button
            style={{ ...S.btnSmall, flexShrink: 0 }}
            onClick={() => setShowShare(true)}
            title="Invite players"
          >
            📲 Invite
          </button>
          {isHost && (
            <button style={{ ...S.btnSmallGold, flexShrink: 0 }} onClick={onHostDashboard}>
              ⚙️ Manage
            </button>
          )}
        </div>

        {/* Leaderboard */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={S.sectionTitle}>LEADERBOARD — {entries.length} {entries.length === 1 ? "ENTRY" : "ENTRIES"}</div>
          {lastUpdated && (
            <div style={{ fontFamily: FONT_BODY, fontSize: "0.7rem", color: C.textFaint }}>
              Updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
          )}
        </div>

        {entries.length === 0 ? (
          <div style={S.empty}>
            <div style={S.emptyIcon}>⛳</div>
            <div>No entries yet.{canPick ? " Be the first to pick!" : ""}</div>
          </div>
        ) : (
          entries.map((entry, i) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              rank={i + 1}
              currentUserId={currentUser?.id}
              expanded={!!expanded[entry.id]}
              onToggle={() => toggleExpand(entry.id)}
            />
          ))
        )}
      </div>
    </div>

    {showShare && (
      <ShareModal
        pool={pool}
        hostName={pool.host_display_name || pool.host_username}
        onClose={() => setShowShare(false)}
      />
    )}
  </>
  );
}
