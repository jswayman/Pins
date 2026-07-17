import { useState, useEffect } from "react";
import { getTournaments, createPool } from "../api";
import S, { C, FONT_DISPLAY } from "./styles";

function fmt$(cents) {
  if (!cents) return "$0";
  return "$" + (cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const DEFAULT_PAYOUT = { "1": 70, "2": 20, "3": 10 };

export default function CreatePoolScreen({ onBack, onCreated }) {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState("");

  const [form, setForm] = useState({
    tournamentId: "",
    name: "",
    entryFeeDollars: "30",
    maxEntriesPerPlayer: "1",
    isPublic: false,
    payoutPlaces: "3",
    payout1: "70",
    payout2: "20",
    payout3: "10",
    payout4: "",
    payout5: "",
  });

  useEffect(() => {
    getTournaments()
      .then(data => {
        // Show upcoming and active only for pool creation
        const eligible = data.filter(t => t.status !== "completed");
        setTournaments(eligible);
        if (eligible.length) setForm(f => ({ ...f, tournamentId: String(eligible[0].id) }));
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function set(k) { return e => setForm(f => ({ ...f, [k]: e.target.value })); }
  function setCheck(k) { return e => setForm(f => ({ ...f, [k]: e.target.checked })); }

  function buildPayoutStructure() {
    const places = parseInt(form.payoutPlaces, 10);
    const vals = [form.payout1, form.payout2, form.payout3, form.payout4, form.payout5].slice(0, places);
    const pct = vals.map(v => parseFloat(v) || 0);
    const total = pct.reduce((s, v) => s + v, 0);
    if (Math.abs(total - 100) > 0.1) return null;
    const obj = {};
    pct.forEach((v, i) => { obj[String(i + 1)] = v; });
    return obj;
  }

  const payoutTotal = [form.payout1, form.payout2, form.payout3, form.payout4, form.payout5]
    .slice(0, parseInt(form.payoutPlaces, 10))
    .map(v => parseFloat(v) || 0)
    .reduce((s, v) => s + v, 0);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const payout = buildPayoutStructure();
    if (!payout) { setError("Payout percentages must sum to exactly 100%"); return; }
    setSaving(true);
    try {
      const pool = await createPool({
        tournamentId: parseInt(form.tournamentId, 10),
        name: form.name.trim(),
        entryFeeCents: Math.round(parseFloat(form.entryFeeDollars || "0") * 100),
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

  if (loading) {
    return <div style={{ ...S.page, textAlign: "center", paddingTop: 60 }}><span style={S.spinner} /></div>;
  }

  const places = parseInt(form.payoutPlaces, 10);
  const payoutTotalOk = Math.abs(payoutTotal - 100) < 0.1;
  const entryFeeDollars = parseFloat(form.entryFeeDollars || "0");
  const entryFeeCents = Math.round(entryFeeDollars * 100);

  return (
    <div style={S.page}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <button style={{ ...S.btnSmall, width: "auto" }} onClick={onBack}>← Back</button>
        <div style={{ ...S.pageTitle, marginBottom: 0 }}>Create Pool</div>
      </div>

      {error && <div style={S.errorBanner}>{error}</div>}

      {tournaments.length === 0 && (
        <div style={S.warnBanner}>
          No upcoming tournaments found. Ask the site admin to sync tournaments first.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Tournament */}
        <div style={S.formGroup}>
          <label style={S.label}>Tournament</label>
          {tournaments.length ? (
            <select style={S.select} value={form.tournamentId} onChange={set("tournamentId")} required>
              {tournaments.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.start_date} – {t.end_date})
                </option>
              ))}
            </select>
          ) : (
            <div style={{ ...S.input, color: C.textDim, cursor: "default" }}>No tournaments available</div>
          )}
        </div>

        {/* Pool name */}
        <div style={S.formGroup}>
          <label style={S.label}>Pool Name</label>
          <input
            style={S.input}
            value={form.name}
            onChange={set("name")}
            placeholder="e.g. Office Pool 2026"
            required
            maxLength={60}
          />
        </div>

        {/* Entry fee */}
        <div style={S.formGroup}>
          <label style={S.label}>Entry Fee</label>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontFamily: FONT_DISPLAY, color: C.gold, fontSize: "1.1rem" }}>$</span>
            <input
              style={{ ...S.input, flex: 1 }}
              type="number"
              min="0"
              step="0.01"
              value={form.entryFeeDollars}
              onChange={set("entryFeeDollars")}
              placeholder="30.00"
            />
          </div>
          <div style={S.inputHint}>Per entry sheet. Set to $0 for a free pool.</div>
        </div>

        {/* Max entries per player */}
        <div style={S.formGroup}>
          <label style={S.label}>Max Entries Per Player</label>
          <select style={S.select} value={form.maxEntriesPerPlayer} onChange={set("maxEntriesPerPlayer")}>
            {[1,2,3,4,5,6,7,8,9,10].map(n => (
              <option key={n} value={n}>{n} {n === 1 ? "entry" : "entries"}</option>
            ))}
          </select>
          <div style={S.inputHint}>Like the paper version — players can buy multiple sheets.</div>
        </div>

        {/* Public / private */}
        <div style={{ ...S.formGroup, display: "flex", alignItems: "center", gap: 12 }}>
          <label style={{ ...S.label, marginBottom: 0, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
            <input type="checkbox" checked={form.isPublic} onChange={setCheck("isPublic")}
              style={{ width: 18, height: 18, cursor: "pointer" }} />
            <span>Public Pool — anyone can find and join</span>
          </label>
        </div>
        {!form.isPublic && (
          <div style={{ ...S.inputHint, marginTop: -8, marginBottom: 14 }}>
            Private pools are join-by-code only. Share your pool code after creating.
          </div>
        )}

        {/* Payout structure */}
        <div style={{ ...S.card, marginBottom: 14 }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: "0.85rem", fontWeight: 700, color: C.text, marginBottom: 12, letterSpacing: "0.06em" }}>
            PAYOUT STRUCTURE
          </div>

          <div style={S.formGroup}>
            <label style={S.label}>Number of Paid Places</label>
            <select style={S.select} value={form.payoutPlaces} onChange={set("payoutPlaces")}>
              <option value="1">1 place (winner takes all)</option>
              <option value="2">2 places</option>
              <option value="3">3 places</option>
              <option value="4">4 places</option>
              <option value="5">5 places</option>
            </select>
          </div>

          {[1,2,3,4,5].slice(0, places).map(i => {
            const keys = ["payout1","payout2","payout3","payout4","payout5"];
            const labels = ["1st Place","2nd Place","3rd Place","4th Place","5th Place"];
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontFamily: FONT_DISPLAY, fontSize: "0.8rem", color: C.textDim, width: 64 }}>{labels[i-1]}</span>
                <input
                  style={{ ...S.input, flex: 1 }}
                  type="number" min="0" max="100" step="0.1"
                  value={form[keys[i-1]]}
                  onChange={set(keys[i-1])}
                  placeholder="0"
                />
                <span style={{ fontFamily: FONT_DISPLAY, fontSize: "0.9rem", color: C.textDim }}>%</span>
              </div>
            );
          })}

          <div style={{
            fontFamily: FONT_DISPLAY, fontSize: "0.85rem",
            color: payoutTotalOk ? C.green : C.red,
            marginTop: 4,
          }}>
            Total: {payoutTotal.toFixed(1)}% {payoutTotalOk ? "✓" : "(must equal 100%)"}
          </div>

          {entryFeeCents > 0 && payoutTotalOk && (
            <div style={{ marginTop: 8, fontSize: "0.78rem", color: C.textFaint, fontFamily: "'Inter',sans-serif" }}>
              Example with 10 entries ({fmt$(entryFeeCents * 10)} pot):{" "}
              {[1,2,3,4,5].slice(0, places).map((i) => {
                const keys = ["payout1","payout2","payout3","payout4","payout5"];
                const labels = ["1st","2nd","3rd","4th","5th"];
                const pct = parseFloat(form[keys[i-1]]) || 0;
                const amt = Math.round((pct / 100) * entryFeeCents * 10);
                return `${labels[i-1]} ${fmt$(amt)}`;
              }).join(" · ")}
            </div>
          )}
        </div>

        <button
          type="submit"
          style={{ ...S.btnPrimary, opacity: (saving || !form.tournamentId || !payoutTotalOk) ? 0.6 : 1 }}
          disabled={saving || !form.tournamentId || !payoutTotalOk}
        >
          {saving ? <span style={S.spinner} /> : "Create Pool"}
        </button>
      </form>
    </div>
  );
}
