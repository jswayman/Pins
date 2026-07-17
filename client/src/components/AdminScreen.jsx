import { useState, useEffect } from "react";
import {
  getTournaments, syncTournaments, updateTournament, refreshTournamentScores
} from "../api";
import S, { C, FONT_DISPLAY } from "./styles";

function fmt$(cents) {
  if (!cents) return "$0";
  return "$" + (cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function statusBadge(status) {
  const map = {
    upcoming:  { style: S.badgeGray,  label: "UPCOMING" },
    active:    { style: S.badgeGreen, label: "LIVE" },
    completed: { style: S.badgeGold,  label: "FINAL" },
  };
  const m = map[status] || map.upcoming;
  return <span style={m.style}>{m.label}</span>;
}

export default function AdminScreen({ onBack }) {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [syncing, setSyncing]         = useState(false);
  const [error, setError]             = useState("");
  const [info, setInfo]               = useState("");
  const [editing, setEditing]         = useState(null); // tournament id
  const [editForm, setEditForm]       = useState({});
  const [refreshing, setRefreshing]   = useState(null);

  async function load() {
    try {
      const data = await getTournaments();
      setTournaments(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleSync() {
    setSyncing(true); setError(""); setInfo("");
    try {
      const r = await syncTournaments();
      setInfo(`Synced: ${r.added} added, ${r.updated} updated (${r.total} total in ESPN schedule)`);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSyncing(false);
    }
  }

  function startEdit(t) {
    setEditing(t.id);
    setEditForm({
      name: t.name,
      venue: t.venue || "",
      prizePurseCents: t.prize_purse_cents || 0,
      startDate: t.start_date || "",
      endDate: t.end_date || "",
    });
  }

  async function saveEdit() {
    setError(""); setInfo("");
    try {
      await updateTournament(editing, {
        name: editForm.name,
        venue: editForm.venue,
        prizePurseCents: parseInt(editForm.prizePurseCents, 10) || 0,
        startDate: editForm.startDate,
        endDate: editForm.endDate,
      });
      setInfo("Tournament updated. Earnings recalculated.");
      setEditing(null);
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleRefresh(tournamentId) {
    setRefreshing(tournamentId); setError(""); setInfo("");
    try {
      const r = await refreshTournamentScores(tournamentId);
      setInfo(`Scores refreshed: ${r.updated} golfers updated (${r.status})`);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setRefreshing(null);
    }
  }

  if (loading) {
    return (
      <div style={{ ...S.page, textAlign: "center", paddingTop: 60 }}>
        <span style={S.spinner} />
      </div>
    );
  }

  return (
    <div style={S.page}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <button style={{ ...S.btnSmall, width: "auto" }} onClick={onBack}>← Back</button>
        <div style={{ ...S.pageTitle, marginBottom: 0, flex: 1 }}>Admin Panel</div>
      </div>

      {error && <div style={S.errorBanner}>{error}</div>}
      {info  && <div style={S.infoBanner}>{info}</div>}

      <div style={{ marginBottom: 20 }}>
        <button
          style={{ ...S.btnPrimary, opacity: syncing ? 0.7 : 1 }}
          onClick={handleSync}
          disabled={syncing}
        >
          {syncing ? "Syncing from ESPN…" : "Sync Tournaments from ESPN"}
        </button>
        <div style={S.inputHint}>Fetches the current PGA Tour season schedule and adds new tournaments.</div>
      </div>

      <div style={S.sectionTitle}>Tournaments ({tournaments.length})</div>

      {tournaments.length === 0 && (
        <div style={S.empty}>
          <div style={S.emptyIcon}>🏌️</div>
          No tournaments yet. Click "Sync Tournaments" to import from ESPN.
        </div>
      )}

      {tournaments.map(t => (
        <div key={t.id} style={S.card}>
          {editing === t.id ? (
            <div>
              <div style={{ ...S.modalTitle, marginBottom: 12 }}>Edit Tournament</div>
              <div style={S.formGroup}>
                <label style={S.label}>Name</label>
                <input style={S.input} value={editForm.name}
                  onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div style={S.formGroup}>
                <label style={S.label}>Venue</label>
                <input style={S.input} value={editForm.venue} placeholder="e.g. Royal Troon"
                  onChange={e => setEditForm(f => ({ ...f, venue: e.target.value }))} />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ ...S.formGroup, flex: 1 }}>
                  <label style={S.label}>Start Date</label>
                  <input style={S.input} type="date" value={editForm.startDate}
                    onChange={e => setEditForm(f => ({ ...f, startDate: e.target.value }))} />
                </div>
                <div style={{ ...S.formGroup, flex: 1 }}>
                  <label style={S.label}>End Date</label>
                  <input style={S.input} type="date" value={editForm.endDate}
                    onChange={e => setEditForm(f => ({ ...f, endDate: e.target.value }))} />
                </div>
              </div>
              <div style={S.formGroup}>
                <label style={S.label}>Prize Purse (cents)</label>
                <input style={S.input} type="number" value={editForm.prizePurseCents}
                  onChange={e => setEditForm(f => ({ ...f, prizePurseCents: e.target.value }))}
                  placeholder="e.g. 900000000 = $9,000,000" />
                <div style={S.inputHint}>
                  Current: {fmt$(editForm.prizePurseCents)} — Changing this will recalculate all pool earnings.
                </div>
              </div>
              <div style={S.btnRow}>
                <button style={S.btnPrimary} onClick={saveEdit}>Save</button>
                <button style={S.btnSecondary} onClick={() => setEditing(null)}>Cancel</button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: FONT_DISPLAY, fontSize: "0.95rem", fontWeight: 700, color: C.text, marginBottom: 2 }}>
                    {t.name}
                  </div>
                  {t.venue && <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "0.8rem", color: C.textDim }}>{t.venue}</div>}
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "0.78rem", color: C.textFaint, marginTop: 2 }}>
                    {t.start_date} → {t.end_date}
                  </div>
                </div>
                {statusBadge(t.status)}
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
                <div>
                  <span style={{ fontFamily: FONT_DISPLAY, fontSize: "1rem", fontWeight: 700, color: C.gold }}>
                    {fmt$(t.prize_purse_cents)}
                  </span>
                  <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "0.75rem", color: C.textFaint, marginLeft: 6 }}>
                    prize purse
                  </span>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    style={{ ...S.btnSmallGreen, opacity: refreshing === t.id ? 0.6 : 1 }}
                    onClick={() => handleRefresh(t.id)}
                    disabled={refreshing === t.id}
                  >
                    {refreshing === t.id ? "…" : "↺ Refresh"}
                  </button>
                  <button style={S.btnSmallGold} onClick={() => startEdit(t)}>Edit</button>
                </div>
              </div>

              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "0.72rem", color: C.textFaint, marginTop: 6 }}>
                ESPN ID: {t.espn_event_id}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
