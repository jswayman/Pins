import { useState, useEffect } from "react";
import { getPools, getPublicPools, joinPool } from "../api";
import S, { C, FONT_DISPLAY, FONT_BODY } from "./styles";
import PinsHeader from "./PinsHeader";

function fmt$(cents) {
  if (!cents) return "Free";
  return "$" + (cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function statusDot(tournamentStatus) {
  if (tournamentStatus === "active") return <span style={{ color: C.green, fontSize: "0.6rem", marginRight: 4 }}>●</span>;
  if (tournamentStatus === "completed") return <span style={{ color: C.textFaint, fontSize: "0.6rem", marginRight: 4 }}>●</span>;
  return <span style={{ color: C.textDim, fontSize: "0.6rem", marginRight: 4 }}>○</span>;
}

function PoolCard({ pool, onOpen }) {
  const statusStyle = pool.status === "open" ? S.badgeGreen : pool.status === "locked" ? S.badgeGold : S.badgeGray;

  return (
    <div
      style={S.poolCard}
      onClick={() => onOpen(pool.code)}
      onMouseEnter={e => e.currentTarget.style.background = C.bgCardHover}
      onMouseLeave={e => e.currentTarget.style.background = C.bgCard}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={S.poolCardTitle}>{pool.name}</div>
          <div style={{ ...S.poolCardMeta, marginTop: 2 }}>
            {statusDot(pool.tournament_status)}
            {pool.tournament_name}
          </div>
          {pool.start_date && (
            <div style={{ fontFamily: FONT_BODY, fontSize: "0.73rem", color: C.textFaint, marginTop: 2 }}>
              {pool.start_date} – {pool.end_date}
            </div>
          )}
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: "0.9rem", fontWeight: 700, color: C.gold }}>
            {fmt$(pool.entry_fee_cents)}
          </div>
          <div style={{ fontFamily: FONT_BODY, fontSize: "0.72rem", color: C.textDim, marginTop: 1 }}>
            {pool.entry_count} {Number(pool.entry_count) === 1 ? "entry" : "entries"}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
        <div style={{ fontFamily: FONT_BODY, fontSize: "0.72rem", color: C.textFaint }}>
          {pool.is_public && <span style={{ marginRight: 6 }}>PUBLIC</span>}
          by {pool.host_username}
        </div>
        <span style={statusStyle}>{pool.status?.toUpperCase()}</span>
      </div>
    </div>
  );
}

export default function HomeScreen({ onOpenPool, onCreatePool }) {
  const [myPools, setMyPools]     = useState([]);
  const [publicPools, setPublic]  = useState([]);
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState("mine");
  const [joinCode, setJoinCode]   = useState("");
  const [joining, setJoining]     = useState(false);
  const [joinError, setJoinError] = useState("");

  useEffect(() => {
    Promise.all([getPools(), getPublicPools()])
      .then(([mine, pub]) => {
        setMyPools(mine);
        setPublic(pub.filter(p => !mine.find(m => m.code === p.code)));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleJoin(e) {
    e.preventDefault();
    const code = joinCode.trim().toUpperCase();
    if (!code) return;
    setJoining(true); setJoinError("");
    try {
      await joinPool(code);
      onOpenPool(code);
    } catch (err) {
      setJoinError(err.message || "Pool not found");
      setJoining(false);
    }
  }

  return (
    <div style={S.root}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={S.fieldBg} />

      <PinsHeader />

      <div style={S.page}>

        {/* ── Join by code ── */}
        <div style={{ ...S.container, marginBottom: 0, marginTop: 16 }}>
          <div style={S.sectionTitle}>Join a Pool</div>
          <form onSubmit={handleJoin} style={{ display: "flex", gap: 8 }}>
            <input
              style={{
                ...S.input, flex: 1,
                textTransform: "uppercase", letterSpacing: "0.2em",
                fontFamily: FONT_DISPLAY, fontSize: "1.1rem", textAlign: "center",
              }}
              placeholder="ENTER CODE"
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              maxLength={6}
            />
            <button
              type="submit"
              style={{
                ...S.btnPrimary, width: "auto", padding: "11px 20px",
                flexShrink: 0, opacity: joining ? 0.6 : 1,
              }}
              disabled={joining}
            >
              {joining ? "…" : "Join"}
            </button>
          </form>
          {joinError && <div style={{ ...S.errorBanner, marginTop: 8, marginBottom: 0 }}>{joinError}</div>}
        </div>

        {/* ── My Pools / Browse tabs ── */}
        <div style={{ ...S.container, marginTop: 12 }}>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 0, marginBottom: 14, borderBottom: `1px solid ${C.border}` }}>
            {[
              { id: "mine",   label: `My Pools${myPools.length ? ` (${myPools.length})` : ""}` },
              { id: "public", label: "Browse Public" },
            ].map(t => (
              <button
                key={t.id}
                style={{
                  flex: 1, padding: "10px 8px", background: "transparent", border: "none",
                  borderBottom: tab === t.id ? `2px solid ${C.gold}` : "2px solid transparent",
                  fontFamily: FONT_DISPLAY, fontSize: "0.82rem", fontWeight: 600,
                  color: tab === t.id ? C.gold : C.textDim,
                  letterSpacing: "0.05em", cursor: "pointer",
                }}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <span style={S.spinner} />
            </div>
          ) : (
            <>
              {tab === "mine" && (
                myPools.length === 0 ? (
                  <div style={S.empty}>
                    <div style={S.emptyIcon}>⛳</div>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>No pools yet</div>
                    <div style={{ fontSize: "0.8rem" }}>Create one or join with a code above.</div>
                  </div>
                ) : (
                  myPools.map(p => <PoolCard key={p.code} pool={p} onOpen={onOpenPool} />)
                )
              )}
              {tab === "public" && (
                publicPools.length === 0 ? (
                  <div style={S.empty}>
                    <div style={S.emptyIcon}>🔍</div>
                    <div>No public pools right now.</div>
                  </div>
                ) : (
                  publicPools.map(p => <PoolCard key={p.code} pool={p} onOpen={onOpenPool} />)
                )
              )}
            </>
          )}
        </div>
      </div>

      {/* ── FAB: Create Pool ── */}
      <button style={S.fab} onClick={onCreatePool} title="Create Pool">+</button>
    </div>
  );
}
