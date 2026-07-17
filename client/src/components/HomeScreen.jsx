import { useState, useEffect } from "react";
import { getPools, getPublicPools, joinPool } from "../api";
import S, { C, FONT_DISPLAY, FONT_BODY } from "./styles";

function fmt$(cents) {
  if (!cents) return "Free";
  return "$" + (cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function tournamentStatusDot(status) {
  if (status === "active") return <span style={{ color: C.green, marginRight: 4 }}>●</span>;
  if (status === "completed") return <span style={{ color: C.textFaint, marginRight: 4 }}>●</span>;
  return <span style={{ color: C.textDim, marginRight: 4 }}>○</span>;
}

function PoolCard({ pool, onOpen }) {
  return (
    <div style={S.poolCard} onClick={() => onOpen(pool.code)}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={S.poolCardTitle}>{pool.name}</div>
          <div style={S.poolCardMeta}>
            {tournamentStatusDot(pool.tournament_status)}
            {pool.tournament_name}
          </div>
          {pool.start_date && (
            <div style={{ fontFamily: FONT_BODY, fontSize: "0.75rem", color: C.textFaint, marginTop: 1 }}>
              {pool.start_date} – {pool.end_date}
            </div>
          )}
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: "0.85rem", fontWeight: 700, color: C.gold }}>
            {fmt$(pool.entry_fee_cents)}
          </div>
          <div style={{ fontFamily: FONT_BODY, fontSize: "0.72rem", color: C.textDim }}>
            {pool.entry_count} {Number(pool.entry_count) === 1 ? "entry" : "entries"}
          </div>
        </div>
      </div>

      <div style={S.poolCardRow}>
        <div style={{ display: "flex", gap: 6 }}>
          {pool.is_public && <span style={S.badgeGray}>PUBLIC</span>}
          {pool.host_username && (
            <span style={{ fontFamily: FONT_BODY, fontSize: "0.72rem", color: C.textFaint }}>
              by {pool.host_username}
            </span>
          )}
        </div>
        <span style={
          pool.status === "open" ? S.badgeGreen :
          pool.status === "locked" ? S.badgeGold :
          S.badgeGray
        }>
          {pool.status?.toUpperCase()}
        </span>
      </div>
    </div>
  );
}

export default function HomeScreen({ currentUser, onOpenPool, onCreatePool, onAdmin }) {
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

      {/* Header */}
      <div style={S.appHeader}>
        <div style={S.appHeaderRow}>
          <button style={S.headerLogo} onClick={() => {}}>
            <span style={S.headerLogoText}>PINS</span>
            <span style={S.headerLogoSub}>golf pool</span>
          </button>
          <div style={{ flex: 1 }} />
          {currentUser?.is_admin && (
            <button style={S.btnSmallGold} onClick={onAdmin}>Admin</button>
          )}
          <div style={S.headerUser} onClick={() => {}}>
            <span style={S.headerAvatar}>⛳</span>
            <span style={S.headerUserName}>{currentUser?.username}</span>
          </div>
        </div>
      </div>

      <div style={S.page}>
        {/* Join by code */}
        <div style={{ ...S.card, marginBottom: 16 }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: "0.78rem", fontWeight: 700, color: C.textDim, letterSpacing: "0.1em", marginBottom: 8 }}>
            JOIN A POOL
          </div>
          <form onSubmit={handleJoin} style={{ display: "flex", gap: 8 }}>
            <input
              style={{ ...S.input, flex: 1, textTransform: "uppercase", letterSpacing: "0.15em", fontFamily: FONT_DISPLAY }}
              placeholder="ENTER CODE"
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              maxLength={6}
            />
            <button
              type="submit"
              style={{ ...S.btnPrimary, width: "auto", padding: "11px 18px", flexShrink: 0, opacity: joining ? 0.6 : 1 }}
              disabled={joining}
            >
              {joining ? "…" : "Join"}
            </button>
          </form>
          {joinError && <div style={{ ...S.errorBanner, marginTop: 8, marginBottom: 0 }}>{joinError}</div>}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, marginBottom: 14, borderBottom: `1px solid ${C.border}` }}>
          {[
            { id: "mine", label: `My Pools${myPools.length ? ` (${myPools.length})` : ""}` },
            { id: "public", label: `Browse Public` },
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
          <div style={{ textAlign: "center", paddingTop: 40 }}><span style={S.spinner} /></div>
        ) : (
          <>
            {tab === "mine" && (
              myPools.length === 0 ? (
                <div style={S.empty}>
                  <div style={S.emptyIcon}>⛳</div>
                  <div>No pools yet.</div>
                  <div style={{ marginTop: 6, fontSize: "0.8rem" }}>Create one or join with a code.</div>
                </div>
              ) : (
                myPools.map(p => <PoolCard key={p.code} pool={p} onOpen={onOpenPool} />)
              )
            )}

            {tab === "public" && (
              publicPools.length === 0 ? (
                <div style={S.empty}>
                  <div style={S.emptyIcon}>🔍</div>
                  <div>No public pools available right now.</div>
                </div>
              ) : (
                publicPools.map(p => <PoolCard key={p.code} pool={p} onOpen={onOpenPool} />)
              )
            )}
          </>
        )}
      </div>

      {/* FAB — create pool */}
      <button style={S.fab} onClick={onCreatePool} title="Create Pool">+</button>
    </div>
  );
}
