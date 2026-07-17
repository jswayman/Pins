import { useState, useEffect, useMemo } from "react";
import { getTournament, submitEntry, getMyEntries } from "../api";
import S, { C, FONT_DISPLAY, FONT_BODY } from "./styles";

const MAX_PICKS = 10;

function scoreColor(s) {
  if (!s || s === "E") return C.textDim;
  if (s.startsWith("-")) return "#5dbb63";
  if (s.startsWith("+")) return "#e87c6a";
  return C.textDim;
}

export default function PickEntryScreen({ poolCode, tournamentId, pool, onBack, onSubmitted }) {
  const [tournament, setTournament] = useState(null);
  const [myEntries, setMyEntries]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState("");
  const [search, setSearch]         = useState("");
  const [picks, setPicks]           = useState([]); // array of espn_golfer_id strings

  useEffect(() => {
    Promise.all([
      getTournament(tournamentId),
      getMyEntries(poolCode),
    ])
      .then(([t, entries]) => {
        setTournament(t);
        setMyEntries(entries);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [tournamentId, poolCode]);

  const golfers = useMemo(() => {
    if (!tournament) return [];
    // Prefer scored golfers (they have position info), fall back to field list
    if (tournament.scores?.length) {
      return tournament.scores.map(s => ({
        id:       s.espn_golfer_id,
        name:     s.name,
        position: s.position,
        score:    s.score_to_par,
        status:   s.status,
      }));
    }
    return (tournament.field || []).map(f => ({
      id: f.id, name: f.name, position: null, score: null, status: "active",
    }));
  }, [tournament]);

  const filtered = useMemo(() => {
    if (!search.trim()) return golfers;
    const q = search.trim().toLowerCase();
    return golfers.filter(g => g.name.toLowerCase().includes(q));
  }, [golfers, search]);

  function togglePick(gId) {
    setPicks(prev => {
      if (prev.includes(gId)) return prev.filter(id => id !== gId);
      if (prev.length >= MAX_PICKS) return prev;
      return [...prev, gId];
    });
  }

  async function handleSubmit() {
    if (picks.length !== MAX_PICKS) { setError(`Select exactly ${MAX_PICKS} golfers`); return; }
    setError(""); setSaving(true);
    try {
      await submitEntry(poolCode, { picks });
      onSubmitted();
    } catch (e) {
      setError(e.message);
      setSaving(false);
    }
  }

  const maxEntries   = pool?.max_entries_per_player || 1;
  const canAddEntry  = myEntries.length < maxEntries;

  if (loading) {
    return <div style={{ ...S.page, textAlign: "center", paddingTop: 60 }}><span style={S.spinner} /></div>;
  }

  if (!canAddEntry) {
    return (
      <div style={S.page}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <button style={{ ...S.btnSmall, width: "auto" }} onClick={onBack}>← Back</button>
        </div>
        <div style={S.empty}>
          <div style={S.emptyIcon}>✓</div>
          <div>You've used all {maxEntries} entr{maxEntries === 1 ? "y" : "ies"} for this pool.</div>
        </div>
      </div>
    );
  }

  const entryLabel = myEntries.length > 0 ? `Entry #${myEntries.length + 1}` : "Your Entry";

  return (
    <div style={{ ...S.root }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Sticky header */}
      <div style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(6,14,6,0.97)", backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${C.border}`,
        padding: "10px 14px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <button style={{ ...S.btnSmall, width: "auto" }} onClick={onBack}>← Back</button>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: "1rem", fontWeight: 700, color: C.text, flex: 1 }}>
            Pick {MAX_PICKS} Golfers
          </div>
          <span style={picks.length === MAX_PICKS ? S.badgeGreen : S.badgeGray}>
            {picks.length}/{MAX_PICKS}
          </span>
        </div>

        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "0.8rem", color: C.textDim, marginBottom: 8 }}>
          {tournament?.name} · {entryLabel}
        </div>

        <input
          style={{ ...S.input, marginBottom: 0 }}
          placeholder="Search golfers…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div style={{ padding: "12px 14px 120px" }}>
        {error && <div style={{ ...S.errorBanner, marginBottom: 12 }}>{error}</div>}

        {filtered.length === 0 && (
          <div style={S.empty}>
            {search ? `No golfers matching "${search}"` : "No golfers available yet"}
          </div>
        )}

        {filtered.map(g => {
          const selected = picks.includes(g.id);
          const disabled = !selected && picks.length >= MAX_PICKS;
          return (
            <div
              key={g.id}
              style={{
                ...(selected ? S.golferCardSelected : S.golferCard),
                opacity: disabled ? 0.4 : 1,
              }}
              onClick={() => !disabled && togglePick(g.id)}
            >
              <div style={{
                width: 24, height: 24, borderRadius: 12, flexShrink: 0,
                background: selected ? C.gold : "rgba(255,255,255,0.08)",
                border: selected ? `2px solid ${C.gold}` : `2px solid ${C.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: FONT_DISPLAY, fontSize: "0.7rem", fontWeight: 700,
                color: selected ? "#0a1a08" : C.textDim,
                transition: "all 0.12s",
              }}>
                {selected ? picks.indexOf(g.id) + 1 : ""}
              </div>

              <div style={{ flex: 1 }}>
                <div style={S.golferName}>{g.name}</div>
                {g.status === "cut" && (
                  <div style={{ fontFamily: FONT_DISPLAY, fontSize: "0.7rem", color: C.red }}>CUT</div>
                )}
              </div>

              {g.position && (
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: FONT_DISPLAY, fontSize: "0.85rem", color: C.textDim }}>
                    T{g.position}
                  </div>
                  {g.score && (
                    <div style={{ fontFamily: FONT_DISPLAY, fontSize: "0.8rem", color: scoreColor(g.score) }}>
                      {g.score}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sticky bottom — picks summary + submit */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 110,
        background: "rgba(6,14,6,0.97)", backdropFilter: "blur(12px)",
        borderTop: `1px solid ${C.border}`,
        padding: "10px 14px",
        paddingBottom: "calc(10px + env(safe-area-inset-bottom, 0px))",
      }}>
        {picks.length > 0 && (
          <div style={{
            display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8,
          }}>
            {picks.map((gId, i) => {
              const g = golfers.find(x => x.id === gId);
              return (
                <div key={gId} style={{
                  background: C.goldDim,
                  border: `1px solid ${C.goldBorder}`,
                  borderRadius: 6, padding: "2px 8px",
                  fontFamily: FONT_DISPLAY, fontSize: "0.72rem", color: C.gold,
                  cursor: "pointer",
                }} onClick={() => togglePick(gId)}>
                  {i + 1}. {g?.name?.split(" ").pop() || gId} ×
                </div>
              );
            })}
          </div>
        )}

        <button
          style={{
            ...S.btnPrimary,
            opacity: (picks.length !== MAX_PICKS || saving) ? 0.5 : 1,
          }}
          disabled={picks.length !== MAX_PICKS || saving}
          onClick={handleSubmit}
        >
          {saving ? <span style={S.spinner} /> : `Submit Entry (${picks.length}/${MAX_PICKS} selected)`}
        </button>
      </div>
    </div>
  );
}
