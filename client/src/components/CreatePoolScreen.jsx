import { useState, useEffect } from "react";
import { getTournaments, createPool } from "../api";
import S, { C, FONT_DISPLAY, FONT_BODY } from "./styles";

function fmt$(cents) {
  if (!cents) return "$0";
  return "$" + (cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function statusBadge(status) {
  if (status === "active") return <span style={S.badgeGreen}>LIVE NOW</span>;
  if (status === "upcoming") return <span style={S.badgeGray}>UPCOMING</span>;
  return <span style={S.badgeGold}>COMPLETED</span>;
}

function TournamentCard({ t, selected, onSelect }) {
  return (
    <div
      onClick={() => onSelect(t.id)}
      style={{
        background: selected ? C.goldDim : C.bgCard,
        border: `1px solid ${selected ? C.goldBorder : C.border}`,
        borderRadius: 12, padding: "12px 14px", marginBottom: 8,
        cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: "0.95rem", fontWeight: 700, color: C.text, marginBottom: 2 }}>
            {t.name}
          </div>
          {t.venue && <div style={{ fontFamily: FONT_BODY, fontSize: "0.78rem", color: C.textDim }}>{t.venue}</div>}
          <div style={{ fontFamily: FONT_BODY, fontSize: "0.75rem", color: C.textFaint, marginTop: 2 }}>
            {t.start_date} – {t.end_date}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
          {statusBadge(t.status)}
          {t.prize_purse_cents > 0 && (
            <span style={{ fontFamily: FONT_DISPLAY, fontSize: "0.8rem", color: C.gold }}>
              {fmt$(t.prize_purse_cents)} purse
            </span>
          )}
        </div>
      </div>
      {selected && (
        <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ color: C.gold, fontSize: "0.85rem" }}>✓</span>
          <span style={{ fontFamily: FONT_DISPLAY, fontSize: "0.78rem", color: C.gold }}>Selected</span>
        </div>
      )}
    </div>
  );
}

const DEFAULT_PAYOUT = { "1": 70, "2": 20, "3": 10 };

export default function CreatePoolScreen({ onBack, onCreated }) {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState("");

  const [selectedTournamentId, setSelectedTournamentId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    entryFeeDollars: "30",
    maxEntriesPerPlayer: "1",
    isPublic: false,
    payoutPlaces: "3",
    payout1: "70", payout2: "20", payout3: "10", payout4: "", payout5: "",
  });

  useEffect(() => {
    getTournaments()
      .then(data => {
        setTournaments(data);
        if (data.length) setSelectedTournamentId(data[0].id);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function set(k) { return e => setForm(f => ({ ...f, [k]: e.target.value })); }
  function setCheck(k) { return e => setForm(f => ({ ...f, [k]: e.target.checked })); }

  const places = parseInt(form.payoutPlaces, 10);
  const payoutKeys = ["payout1","payout2","payout3","payout4","payout5"].slice(0, places);
  const payoutTotal = payoutKeys.map(k => parseFloat(form[k]) || 0).reduce((s, v) => s + v, 0);
  const payoutTotalOk = Math.abs(payoutTotal - 100) < 0.1;
  const entryFeeCents = Math.round(parseFloat(form.entryFeeDollars || "0") * 100);

  function buildPayoutStructure() {
    if (!payoutTotalOk) return null;
    const obj = {};
    payoutKeys.forEach((k, i) => { obj[String(i + 1)] = parseFloat(form[k]) || 0; });
    return obj;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!selectedTournamentId) { setError("Please select a tournament"); return; }
    const payout = buildPayoutStructure();
    if (!payout) { setError("Payout percentages must sum to 100%"); return; }
    setSaving(true);
    try {
      const pool = await createPool({
        tournamentId: selectedTournamentId,
        name: form.name.trim(),
        entryFeeCents,
        maxEntriesPerPlayer: parseInt(form.maxEntriesPerPlayer, 10),
        isPublic: form.isPublic,
        payoutStructure: payout,
      });
      onCreated(pool.code);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <div style={S.root}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={S.fieldBg} />

      {/* Header */}
      <div style={S.appHeader}>
        <div style={S.appHeaderRow}>
          <button style={{ ...S.btnSmall, width: "auto" }} onClick={onBack}>← Back</button>
          <div style={{ ...S.pageTitle, marginBottom: 0, marginLeft: 8, flex: 1 }}>Create Pool</div>
        </div>
      </div>

      <div style={S.page}>
        {error && <div style={S.errorBanner}>{error}</div>}

        <form onSubmit={handleSubmit}>

          {/* ── Tournament Selection ── */}
          <div style={{ ...S.container, marginBottom: 12 }}>
            <div style={S.sectionTitle}>Select Tournament</div>

            {loading ? (
              <div style={{ textAlign: "center", padding: "24px 0" }}><span style={S.spinner} /></div>
            ) : tournaments.length === 0 ? (
              <div style={{ ...S.warnBanner, marginBottom: 0 }}>
                No upcoming tournaments found. Check back soon or contact the admin.
              </div>
            ) : (
              tournaments.map(t => (
                <TournamentCard
                  key={t.id}
                  t={t}
                  selected={selectedTournamentId === t.id}
                  onSelect={setSelectedTournamentId}
                />
              ))
            )}
          </div>

          {/* ── Pool Details ── */}
          <div style={{ ...S.container, marginBottom: 12 }}>
            <div style={S.sectionTitle}>Pool Details</div>

            <div style={S.formGroup}>
              <label style={S.label}>Pool Name</label>
              <input
                style={S.input}
                value={form.name}
                onChange={set("name")}
                placeholder='e.g. "Office Pool 2026"'
                required maxLength={60}
              />
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ ...S.formGroup, flex: 1 }}>
                <label style={S.label}>Entry Fee</label>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontFamily: FONT_DISPLAY, color: C.gold, fontSize: "1.1rem", paddingBottom: 1 }}>$</span>
                  <input
                    style={{ ...S.input, flex: 1 }}
                    type="number" min="0" step="0.01"
                    value={form.entryFeeDollars}
                    onChange={set("entryFeeDollars")}
                    placeholder="30.00"
                  />
                </div>
                <div style={S.inputHint}>Per entry sheet</div>
              </div>
              <div style={{ ...S.formGroup, flex: 1 }}>
                <label style={S.label}>Max Entries / Player</label>
                <select style={S.select} value={form.maxEntriesPerPlayer} onChange={set("maxEntriesPerPlayer")}>
                  {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                <div style={S.inputHint}>Like multiple paper sheets</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input
                type="checkbox" id="isPublic"
                checked={form.isPublic} onChange={setCheck("isPublic")}
                style={{ width: 18, height: 18, cursor: "pointer", accentColor: C.gold }}
              />
              <label htmlFor="isPublic" style={{ ...S.label, marginBottom: 0, cursor: "pointer", textTransform: "none", fontSize: "0.85rem", color: C.textDim }}>
                Public pool — anyone can browse and join
              </label>
            </div>
          </div>

          {/* ── Payout Structure ── */}
          <div style={{ ...S.container, marginBottom: 16 }}>
            <div style={S.sectionTitle}>Payout Structure</div>

            <div style={S.formGroup}>
              <label style={S.label}>Number of Paid Places</label>
              <select style={S.select} value={form.payoutPlaces} onChange={set("payoutPlaces")}>
                <option value="1">1 — Winner takes all</option>
                <option value="2">2 places</option>
                <option value="3">3 places</option>
                <option value="4">4 places</option>
                <option value="5">5 places</option>
              </select>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 }}>
              {["1st","2nd","3rd","4th","5th"].slice(0, places).map((label, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontFamily: FONT_DISPLAY, fontSize: "0.8rem", color: C.textDim, width: 36, textAlign: "right" }}>
                    {label}
                  </span>
                  <input
                    style={{ ...S.input, flex: 1, textAlign: "right" }}
                    type="number" min="0" max="100" step="0.1"
                    value={form[payoutKeys[i]]}
                    onChange={set(payoutKeys[i])}
                    placeholder="0"
                  />
                  <span style={{ fontFamily: FONT_DISPLAY, fontSize: "0.9rem", color: C.textDim, width: 16 }}>%</span>
                </div>
              ))}
            </div>

            {/* Total + example */}
            <div style={{ padding: "10px 12px", background: "rgba(255,255,255,0.03)", borderRadius: 8 }}>
              <div style={{
                fontFamily: FONT_DISPLAY, fontSize: "0.85rem",
                color: payoutTotalOk ? C.green : C.red,
                marginBottom: payoutTotalOk && entryFeeCents > 0 ? 6 : 0,
              }}>
                Total: {payoutTotal.toFixed(1)}%
                {payoutTotalOk ? " ✓" : " — must equal 100%"}
              </div>
              {payoutTotalOk && entryFeeCents > 0 && (
                <div style={{ fontFamily: FONT_BODY, fontSize: "0.75rem", color: C.textFaint }}>
                  Example with 10 entries (${(entryFeeCents * 10 / 100).toFixed(0)} pot):{" "}
                  {payoutKeys.map((k, i) => {
                    const pct = parseFloat(form[k]) || 0;
                    const amt = (pct / 100 * entryFeeCents * 10 / 100).toFixed(0);
                    return `${["1st","2nd","3rd","4th","5th"][i]} $${amt}`;
                  }).join(" · ")}
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            style={{ ...S.btnPrimary, opacity: (saving || !selectedTournamentId || !form.name.trim() || !payoutTotalOk) ? 0.5 : 1 }}
            disabled={saving || !selectedTournamentId || !form.name.trim() || !payoutTotalOk}
          >
            {saving ? <span style={S.spinner} /> : "Create Pool"}
          </button>
        </form>
      </div>
    </div>
  );
}
