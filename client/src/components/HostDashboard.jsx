import { useState, useEffect, useCallback } from "react";
import {
  getPool, lockPool, deletePool, updatePool,
  getRoster, markPaid, markUnpaid, getPayoutReport, getChatUnread,
} from "../api";
import { getDisplayName } from "../utils/displayName";
import S, { C, FONT_DISPLAY, FONT_BODY } from "./styles";
import PinsHeader from "./PinsHeader";
import PoolChat from "./PoolChat";
import PoolChatButton from "./PoolChatButton";

const TABS = { overview: "overview", players: "players", payouts: "payouts", settings: "settings" };

function fmt$(cents) {
  if (!cents) return "$0";
  return "$" + (cents / 100).toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function fmtDec$(cents) {
  return "$" + (cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function placeLabel(n) {
  return ["1st", "2nd", "3rd", "4th", "5th"][Number(n) - 1] || `${n}th`;
}

function copyText(text) {
  navigator.clipboard?.writeText(text).catch(() => {});
}

function copyInvite(code) {
  copyText(`${window.location.origin}?join=${code}`);
}

export default function HostDashboard({ poolCode, onBack, onDeleted }) {
  const [pool, setPool]           = useState(null);
  const [roster, setRoster]       = useState([]);
  const [report, setReport]       = useState(null);
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState(TABS.players);
  const [error, setError]         = useState("");
  const [info, setInfo]           = useState("");
  const [locking, setLocking]     = useState(false);
  const [deleting, setDeleting]   = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [chatOpen, setChatOpen]   = useState(false);
  const [chatUnread, setChatUnread] = useState(0);
  const [payingKey, setPayingKey] = useState(null);

  const [nameDraft, setNameDraft]         = useState("");
  const [publicDraft, setPublicDraft]     = useState(false);
  const [feeDraft, setFeeDraft]           = useState("");
  const [payLink, setPayLink]             = useState("");
  const [zelleEmail, setZelleEmail]       = useState("");
  const [zellePhone, setZellePhone]       = useState("");

  const loadAll = useCallback(async () => {
    try {
      const poolData = await getPool(poolCode);
      setPool(poolData);
      setNameDraft(poolData.name || "");
      setPublicDraft(!!poolData.is_public);
      setFeeDraft(((poolData.entry_fee_cents || 0) / 100).toString());
      setPayLink(poolData.payment_link || "");
      setZelleEmail(poolData.zelle_email || "");
      setZellePhone(poolData.zelle_phone || "");
      const [rosterData, reportData] = await Promise.all([
        getRoster(poolCode).catch(e => { setError(e.message); return { members: [] }; }),
        getPayoutReport(poolCode).catch(() => null),
      ]);
      setRoster(rosterData.members || []);
      if (reportData) setReport(reportData);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [poolCode]);

  useEffect(() => { loadAll(); }, [loadAll]);

  useEffect(() => {
    if (!poolCode) return;
    getChatUnread(poolCode).then(r => setChatUnread(r.unread || 0)).catch(() => {});
  }, [poolCode]);

  async function handleLock() {
    setError(""); setInfo(""); setLocking(true);
    try {
      await lockPool(poolCode);
      setInfo("Pool locked — no new entries can be submitted.");
      await loadAll();
    } catch (e) {
      setError(e.message);
    } finally {
      setLocking(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deletePool(poolCode);
      if (onDeleted) onDeleted();
      else onBack();
    } catch (e) {
      setError(e.message);
      setDeleting(false);
    }
  }

  async function togglePayment({ entryId, userId, currentStatus }) {
    const next = currentStatus === "paid" ? "pending" : "paid";
    const key = entryId ? `e-${entryId}` : `u-${userId}`;
    setError("");
    setPayingKey(key);
    try {
      const result = next === "paid"
        ? await markPaid(poolCode, { entryId, userId })
        : await markUnpaid(poolCode, { entryId, userId });
      if (result.prize) {
        setPool(p => p ? { ...p, prize: result.prize } : p);
        setReport(r => r ? { ...r, ...result.prize } : result.prize);
      }
      await loadAll();
    } catch (e) {
      setError(e.message);
    } finally {
      setPayingKey(null);
    }
  }

  async function saveSettings(fields) {
    setError(""); setInfo(""); setSaving(true);
    try {
      await updatePool(poolCode, fields);
      setInfo("Saved.");
      await loadAll();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
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

  const isLocked = pool.status === "locked" || pool.status === "completed";
  const fee = parseInt(pool.entry_fee_cents || 0, 10);
  const memberCount = roster.length;
  const pickedCount = roster.filter(m => m.hasPicks).length;
  const noPicksCount = memberCount - pickedCount;
  const prize = pool.prize || report;

  return (
    <div style={S.root}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={S.fieldBg} />

      <PinsHeader
        onBack={onBack}
        title="Manage Pool"
        subtitle={pool.name}
        right={
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginRight: 6 }}>
            <PoolChatButton unread={chatUnread} onClick={() => setChatOpen(v => !v)} />
            <span style={isLocked ? S.badgeGold : S.badgeGreen}>{pool.status?.toUpperCase()}</span>
          </div>
        }
      />

      <div style={{
        position: "sticky", top: 52, zIndex: 90,
        background: "rgba(6,16,6,0.98)",
        borderBottom: `1px solid ${C.border}`,
        padding: "8px 10px 10px",
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 6,
        }}>
          {[
            { id: TABS.players,  label: "Mark Paid", hint: "Players" },
            { id: TABS.overview, label: "Overview",  hint: "Invite" },
            { id: TABS.payouts,  label: "Payouts",   hint: "Prizes" },
            { id: TABS.settings, label: "Settings",  hint: "Pool" },
          ].map(t => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                style={{
                  background: active ? C.gold : "rgba(255,255,255,0.05)",
                  color: active ? "#0a1a0a" : C.text,
                  border: `1px solid ${active ? C.gold : C.border}`,
                  borderRadius: 10,
                  padding: "9px 4px 8px",
                  cursor: "pointer",
                  fontFamily: FONT_DISPLAY,
                }}
              >
                <div style={{ fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.03em" }}>{t.label}</div>
                <div style={{ fontSize: "0.62rem", fontWeight: 600, opacity: 0.7, marginTop: 2 }}>{t.hint}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ ...S.page, paddingBottom: 120 }}>
        {error && <div style={S.errorBanner}>{error}</div>}
        {info  && <div style={S.infoBanner}>{info}</div>}

        {tab === TABS.overview && (
          <OverviewTab
            pool={pool}
            poolCode={poolCode}
            prize={prize}
            memberCount={memberCount}
            pickedCount={pickedCount}
            noPicksCount={noPicksCount}
            isLocked={isLocked}
            locking={locking}
            confirmDelete={confirmDelete}
            deleting={deleting}
            onCopyInvite={() => { copyInvite(poolCode); setInfo("Invite link copied."); }}
            onLock={handleLock}
            onOpenPlayers={() => setTab(TABS.players)}
            onAskDelete={() => setConfirmDelete(true)}
            onCancelDelete={() => setConfirmDelete(false)}
            onDelete={handleDelete}
          />
        )}

        {tab === TABS.players && (
          <PlayersTab
            roster={roster}
            fee={fee}
            prize={prize}
            payingKey={payingKey}
            onToggle={togglePayment}
          />
        )}

        {tab === TABS.payouts && report && (
          <PayoutsTab report={report} />
        )}

        {tab === TABS.settings && (
          <SettingsTab
            pool={pool}
            isLocked={isLocked}
            nameDraft={nameDraft}
            setNameDraft={setNameDraft}
            publicDraft={publicDraft}
            setPublicDraft={setPublicDraft}
            feeDraft={feeDraft}
            setFeeDraft={setFeeDraft}
            payLink={payLink}
            setPayLink={setPayLink}
            zelleEmail={zelleEmail}
            setZelleEmail={setZelleEmail}
            zellePhone={zellePhone}
            setZellePhone={setZellePhone}
            saving={saving}
            confirmDelete={confirmDelete}
            deleting={deleting}
            onSaveName={() => saveSettings({ name: nameDraft })}
            onSavePublic={() => saveSettings({ isPublic: publicDraft })}
            onSaveFee={() => saveSettings({ entryFeeCents: Math.round(parseFloat(feeDraft || "0") * 100) })}
            onSavePay={() => saveSettings({ paymentLink: payLink, zelleEmail, zellePhone })}
            onAskDelete={() => setConfirmDelete(true)}
            onCancelDelete={() => setConfirmDelete(false)}
            onDelete={handleDelete}
          />
        )}
      </div>

      <PoolChat
        poolId={pool.id}
        poolCode={poolCode}
        poolName={pool.name}
        open={chatOpen}
        onToggle={setChatOpen}
        onUnreadChange={setChatUnread}
      />
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={{ ...S.card, flex: 1, textAlign: "center", marginBottom: 0 }}>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: "0.68rem", color: C.textDim, letterSpacing: "0.1em" }}>{label}</div>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: "1.35rem", fontWeight: 700, color: color || C.text }}>{value}</div>
    </div>
  );
}

function OverviewTab({
  pool, poolCode, prize, memberCount, pickedCount, noPicksCount,
  isLocked, locking, confirmDelete, deleting,
  onCopyInvite, onLock, onOpenPlayers, onAskDelete, onCancelDelete, onDelete,
}) {
  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <StatCard label="MEMBERS" value={memberCount} />
        <StatCard label="PICKS IN" value={pickedCount} color={C.gold} />
        <StatCard label="NO PICKS" value={noPicksCount} color={noPicksCount ? C.red : C.green} />
      </div>

      {pool.entry_fee_cents > 0 && (
        <button
          type="button"
          onClick={onOpenPlayers}
          style={{
            ...S.card, width: "100%", textAlign: "left", cursor: "pointer",
            borderColor: C.goldBorder, background: C.goldDim, marginBottom: 12,
          }}
        >
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: "0.95rem", fontWeight: 700, color: C.gold, marginBottom: 4 }}>
            Mark players paid →
          </div>
          <div style={{ fontFamily: FONT_BODY, fontSize: "0.8rem", color: C.textDim }}>
            Prize pot stays $0 until you tap Mark Paid next to each person.
            {prize?.pendingCount > 0 ? ` ${prize.pendingCount} still unpaid.` : ""}
          </div>
        </button>
      )}

      {prize && pool.entry_fee_cents > 0 && (
        <div style={S.card}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: "0.72rem", color: C.textDim, letterSpacing: "0.1em", marginBottom: 10 }}>
            LIVE PRIZE POT · PAID ONLY
          </div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: "1.8rem", fontWeight: 700, color: C.gold, marginBottom: 4 }}>
            {fmt$(prize.collectedCents)}
          </div>
          <div style={{ fontFamily: FONT_BODY, fontSize: "0.8rem", color: C.textDim }}>
            {prize.paidCount} paid × {fmt$(pool.entry_fee_cents)}
            {prize.pendingCount > 0 && ` · ${prize.pendingCount} unpaid not included`}
          </div>
        </div>
      )}

      <div style={S.card}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: "0.85rem", fontWeight: 700, color: C.text, marginBottom: 8 }}>
          Invite players
        </div>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: "2rem", fontWeight: 700, color: C.gold, letterSpacing: "0.2em", textAlign: "center", marginBottom: 6 }}>
          {poolCode}
        </div>
        <div style={{ fontFamily: FONT_BODY, fontSize: "0.78rem", color: C.textFaint, textAlign: "center", marginBottom: 12 }}>
          Joining adds them to the pool — they can chat before they pick.
        </div>
        <button style={S.btnSecondary} onClick={onCopyInvite}>Copy Invite Link</button>
      </div>

      {(pool.payment_link || pool.zelle_email || pool.zelle_phone) && (
        <div style={S.card}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: "0.85rem", fontWeight: 700, color: C.text, marginBottom: 8 }}>
            How players pay you
          </div>
          {pool.payment_link && (
            <div style={{ fontFamily: FONT_BODY, fontSize: "0.82rem", color: C.textDim, marginBottom: 4 }}>
              Link: <span style={{ color: C.gold }}>{pool.payment_link}</span>
            </div>
          )}
          {pool.zelle_email && (
            <div style={{ fontFamily: FONT_BODY, fontSize: "0.82rem", color: C.textDim, marginBottom: 4 }}>
              Zelle email: {pool.zelle_email}
            </div>
          )}
          {pool.zelle_phone && (
            <div style={{ fontFamily: FONT_BODY, fontSize: "0.82rem", color: C.textDim }}>
              Zelle phone: {pool.zelle_phone}
            </div>
          )}
        </div>
      )}

      {!isLocked && (
        <div style={{ ...S.card, borderColor: "rgba(212,175,55,0.2)" }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: "0.85rem", fontWeight: 700, color: C.gold, marginBottom: 4 }}>
            Lock picks
          </div>
          <div style={{ fontFamily: FONT_BODY, fontSize: "0.8rem", color: C.textDim, marginBottom: 12 }}>
            Stop new entries before the first tee time. Players already in can still chat and watch the board.
          </div>
          <button style={{ ...S.btnPrimary, opacity: locking ? 0.6 : 1 }} onClick={onLock} disabled={locking}>
            {locking ? "Locking…" : "Lock Pool Now"}
          </button>
        </div>
      )}

      {isLocked && (
        <div style={S.warnBanner}>This pool is locked — no new entries can be submitted.</div>
      )}

      <DangerZone
        memberCount={memberCount}
        confirmDelete={confirmDelete}
        deleting={deleting}
        onAskDelete={onAskDelete}
        onCancelDelete={onCancelDelete}
        onDelete={onDelete}
      />
    </div>
  );
}

function PayToggle({ paid, busy, onClick }) {
  return (
    <button
      style={{
        ...(paid ? S.btnSmallGreen : S.btnSmallGold),
        minWidth: 108,
        opacity: busy ? 0.6 : 1,
      }}
      disabled={busy}
      onClick={onClick}
    >
      {busy ? "Saving…" : paid ? "✓ Paid" : "Mark Paid"}
    </button>
  );
}

function PlayersTab({ roster, fee, prize, payingKey, onToggle }) {
  if (!roster.length) {
    return (
      <div style={S.empty}>
        <div style={S.emptyIcon}>👥</div>
        No one has joined yet. Share the invite code.
      </div>
    );
  }

  const unpaidMembers = roster.filter(m => {
    if (!fee) return false;
    if (!m.entries.length) return m.paymentStatus !== "paid";
    return m.entries.some(e => e.paymentStatus !== "paid");
  }).length;

  return (
    <div>
      {fee > 0 && (
        <div style={{ ...S.card, borderColor: C.goldBorder, background: C.goldDim }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: "0.72rem", color: C.textDim, letterSpacing: "0.1em" }}>
            PRIZE POT · UPDATES WHEN YOU MARK PAID
          </div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: "1.8rem", fontWeight: 700, color: C.gold, margin: "4px 0 2px" }}>
            {fmt$(prize?.collectedCents)}
          </div>
          <div style={{ fontFamily: FONT_BODY, fontSize: "0.8rem", color: C.textDim }}>
            {prize?.paidCount || 0} paid {prize?.paidCount === 1 ? "entry" : "entries"} × {fmt$(fee)}
            {unpaidMembers > 0 && ` · ${unpaidMembers} still unpaid`}
          </div>
          <div style={{ fontFamily: FONT_BODY, fontSize: "0.72rem", color: C.textFaint, marginTop: 6 }}>
            Pot = paid entries only. You can still mark someone paid before they pick.
          </div>
        </div>
      )}

      <div style={{ fontFamily: FONT_BODY, fontSize: "0.78rem", color: C.textDim, marginBottom: 12 }}>
        Tap the gold <strong style={{ color: C.gold }}>Mark Paid</strong> button when you have their money —
        even if they have not picked yet. Unpaid players stay on the leaderboard but cannot win the pot.
      </div>
      {roster.map(m => {
        const noPicks = !m.entries.length;
        const memberPaid = m.paymentStatus === "paid";
        return (
          <div key={m.userId} style={S.card}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
              marginBottom: m.entries.length ? 10 : 0,
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: "0.95rem", fontWeight: 700, color: C.text }}>
                  {getDisplayName(m)}
                  {m.isHost && (
                    <span style={{ marginLeft: 6, fontSize: "0.62rem", color: C.gold, letterSpacing: "0.06em" }}>HOST</span>
                  )}
                </div>
                <div style={{ fontFamily: FONT_BODY, fontSize: "0.75rem", color: m.hasPicks ? C.textDim : C.gold }}>
                  {m.hasPicks
                    ? `${m.entries.length} ${m.entries.length === 1 ? "entry" : "entries"}`
                    : memberPaid
                      ? "Paid · pot updates when they pick"
                      : `Joined · no picks yet · ${fee > 0 ? `${fmtDec$(fee)} due` : "free"}`}
                </div>
              </div>
              {fee > 0 && noPicks && (
                <PayToggle
                  paid={memberPaid}
                  busy={payingKey === `u-${m.userId}`}
                  onClick={() => onToggle({ userId: m.userId, currentStatus: m.paymentStatus })}
                />
              )}
              {fee === 0 && noPicks && <span style={S.badgeGray}>FREE</span>}
            </div>
            {m.entries.map(e => (
              <div key={e.entryId} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 0 0",
                borderTop: "1px solid rgba(255,255,255,0.06)",
                marginTop: 8,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: FONT_DISPLAY, fontSize: "0.82rem", color: C.text }}>
                    Entry {e.entryNumber > 1 ? `#${e.entryNumber}` : ""}
                    <span style={{ color: C.textDim, marginLeft: 6 }}>{fmt$(e.earningsCents)} earnings</span>
                  </div>
                  {fee > 0 && (
                    <div style={{ fontFamily: FONT_DISPLAY, fontSize: "0.75rem", color: e.paymentStatus === "paid" ? C.green : C.gold }}>
                      {e.paymentStatus === "paid" ? "In the pot" : `${fmtDec$(fee)} due`}
                    </div>
                  )}
                </div>
                {fee > 0 ? (
                  <PayToggle
                    paid={e.paymentStatus === "paid"}
                    busy={payingKey === `e-${e.entryId}`}
                    onClick={() => onToggle({ entryId: e.entryId, currentStatus: e.paymentStatus })}
                  />
                ) : (
                  <span style={S.badgeGray}>FREE</span>
                )}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function PayoutsTab({ report }) {
  return (
    <div>
      <div style={S.card}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: "0.72rem", color: C.textDim, letterSpacing: "0.1em", marginBottom: 10 }}>
          PRIZE POOL · PAID PLAYERS ONLY
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ color: C.textDim, fontFamily: FONT_BODY, fontSize: "0.85rem" }}>If everyone paid</span>
          <span style={{ color: C.textFaint, fontFamily: FONT_DISPLAY, fontWeight: 700 }}>{fmt$(report.totalPotCents)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ color: C.textDim, fontFamily: FONT_BODY, fontSize: "0.85rem" }}>
            Actual pot ({report.paidCount}/{report.totalEntries} paid)
          </span>
          <span style={{ color: C.green, fontFamily: FONT_DISPLAY, fontWeight: 700 }}>{fmt$(report.collectedCents)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: C.textDim, fontFamily: FONT_BODY, fontSize: "0.85rem" }}>Still owed ({report.pendingCount})</span>
          <span style={{ color: C.red, fontFamily: FONT_DISPLAY, fontWeight: 700 }}>
            {fmt$((report.totalPotCents || 0) - (report.collectedCents || 0))}
          </span>
        </div>
      </div>

      <div style={S.sectionTitle}>WHO GETS PAID</div>
      {(report.payoutPlaces || []).length === 0 && (
        <div style={S.empty}>
          <div style={S.emptyIcon}>🏆</div>
          Mark players paid to build the pot. Winners come from paid entries only.
        </div>
      )}
      {(report.payoutPlaces || []).map(place => (
        <div key={`${place.place}-${place.combinedPct}`} style={{ ...S.card, marginBottom: 8 }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: "0.95rem", fontWeight: 700, color: C.gold, marginBottom: 8 }}>
            {placeLabel(place.place)} · {place.combinedPct}%
            {place.tied ? " · tied, split" : ""}
          </div>
          {(place.winners || []).map(w => (
            <div key={w.entryId || w.username} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontFamily: FONT_DISPLAY, fontSize: "0.9rem", color: C.text }}>
                {getDisplayName(w)}
                {w.entryNumber > 1 && <span style={{ color: C.textDim, fontSize: "0.75rem", marginLeft: 4 }}>#{w.entryNumber}</span>}
              </span>
              <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, color: C.text }}>
                {fmt$(w.shareCents ?? place.amountCentsEach)}
              </span>
            </div>
          ))}
        </div>
      ))}

      <div style={S.sectionTitle}>ALL ENTRIES</div>
      {(report.entries || []).map(e => (
        <div key={e.entryId} style={{
          ...S.card, marginBottom: 6,
          display: "flex", alignItems: "center", gap: 10,
          opacity: e.prizeEligible === false ? 0.7 : 1,
        }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: "1rem", fontWeight: 700, color: C.textDim, width: 26, textAlign: "center" }}>
            {e.rank}
          </div>
          <div style={{ flex: 1 }}>
            <span style={{ fontFamily: FONT_DISPLAY, fontSize: "0.9rem", color: C.text }}>{getDisplayName(e)}</span>
            {e.entryNumber > 1 && (
              <span style={{ fontFamily: FONT_DISPLAY, fontSize: "0.72rem", color: C.textDim, marginLeft: 6 }}>#{e.entryNumber}</span>
            )}
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: "0.9rem", fontWeight: 700, color: C.gold }}>
              {fmt$(e.earningsCents)}
            </div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: "0.68rem", color: e.prizeEligible === false ? C.red : C.green }}>
              {e.prizeEligible === false ? "UNPAID · INELIGIBLE" : "✓ PAID"}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SettingsTab({
  pool, isLocked,
  nameDraft, setNameDraft, onSaveName,
  publicDraft, setPublicDraft, onSavePublic,
  feeDraft, setFeeDraft, onSaveFee,
  payLink, setPayLink, zelleEmail, setZelleEmail, zellePhone, setZellePhone, onSavePay,
  saving, confirmDelete, deleting, onAskDelete, onCancelDelete, onDelete,
}) {
  return (
    <div>
      <div style={S.card}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: "0.85rem", fontWeight: 700, color: C.text, marginBottom: 8 }}>
          Pool name
        </div>
        <input style={S.input} value={nameDraft} onChange={e => setNameDraft(e.target.value)} />
        <button style={{ ...S.btnSecondary, marginTop: 10 }} disabled={saving || nameDraft.trim() === pool.name} onClick={onSaveName}>
          Save name
        </button>
      </div>

      <div style={S.card}>
        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
          <input type="checkbox" checked={publicDraft} onChange={e => setPublicDraft(e.target.checked)} />
          <span style={{ fontFamily: FONT_DISPLAY, fontSize: "0.9rem", color: C.text }}>Public pool (listed in Browse)</span>
        </label>
        <button style={{ ...S.btnSecondary, marginTop: 10 }} disabled={saving || publicDraft === !!pool.is_public} onClick={onSavePublic}>
          Save visibility
        </button>
      </div>

      {!isLocked && (
        <div style={S.card}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: "0.85rem", fontWeight: 700, color: C.text, marginBottom: 8 }}>
            Entry fee
          </div>
          <input
            style={S.input}
            type="number"
            min="0"
            step="0.01"
            value={feeDraft}
            onChange={e => setFeeDraft(e.target.value)}
          />
          <div style={{ fontFamily: FONT_BODY, fontSize: "0.75rem", color: C.textFaint, marginTop: 6 }}>
            Pending dues update to the new amount. Already-paid entries stay as recorded.
          </div>
          <button style={{ ...S.btnSecondary, marginTop: 10 }} disabled={saving} onClick={onSaveFee}>
            Save fee
          </button>
        </div>
      )}

      <div style={S.card}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: "0.85rem", fontWeight: 700, color: C.text, marginBottom: 4 }}>
          How players pay you
        </div>
        <div style={{ fontFamily: FONT_BODY, fontSize: "0.75rem", color: C.textDim, marginBottom: 10 }}>
          Shown to unpaid players on the leaderboard.
        </div>
        <input
          style={{ ...S.input, marginBottom: 8 }}
          placeholder="Venmo / Cash App / PayPal link"
          value={payLink}
          onChange={e => setPayLink(e.target.value)}
        />
        <input
          style={{ ...S.input, marginBottom: 8 }}
          placeholder="Zelle email"
          value={zelleEmail}
          onChange={e => setZelleEmail(e.target.value)}
        />
        <input
          style={S.input}
          placeholder="Zelle phone"
          value={zellePhone}
          onChange={e => setZellePhone(e.target.value)}
        />
        <button style={{ ...S.btnSecondary, marginTop: 10 }} disabled={saving} onClick={onSavePay}>
          Save pay info
        </button>
      </div>

      <DangerZone
        memberCount={null}
        confirmDelete={confirmDelete}
        deleting={deleting}
        onAskDelete={onAskDelete}
        onCancelDelete={onCancelDelete}
        onDelete={onDelete}
      />
    </div>
  );
}

function DangerZone({ memberCount, confirmDelete, deleting, onAskDelete, onCancelDelete, onDelete }) {
  return (
    <div style={{ ...S.card, borderColor: "rgba(231,76,60,0.2)", marginTop: 8 }}>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: "0.85rem", fontWeight: 700, color: C.red, marginBottom: 4 }}>
        Danger zone
      </div>
      <div style={{ fontFamily: FONT_BODY, fontSize: "0.8rem", color: C.textDim, marginBottom: 12 }}>
        Permanently deletes this pool, all entries, chat, and payment records.
        {memberCount != null && memberCount > 1 && ` ${memberCount} members will lose access.`}
        {" "}This cannot be undone.
      </div>
      {!confirmDelete ? (
        <button style={S.btnDanger} onClick={onAskDelete}>Delete Pool</button>
      ) : (
        <div>
          <div style={{ ...S.warnBanner, marginBottom: 10 }}>
            Delete this pool{memberCount > 1 ? ` and remove ${memberCount} members` : ""}? This cannot be undone.
          </div>
          <div style={S.btnRow}>
            <button style={{ ...S.btnDanger, opacity: deleting ? 0.6 : 1 }} onClick={onDelete} disabled={deleting}>
              {deleting ? "Deleting…" : "Yes, Delete"}
            </button>
            <button style={S.btnSecondary} onClick={onCancelDelete}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
