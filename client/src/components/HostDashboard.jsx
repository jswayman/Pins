import { useState, useEffect, useCallback } from "react";
import { getPool, lockPool, deletePool, getPayments, markPaid, markUnpaid, getPayoutReport } from "../api";
import S, { C, FONT_DISPLAY, FONT_BODY } from "./styles";
import PinsHeader from "./PinsHeader";

const TABS = { payments: "payments", report: "report", settings: "settings" };

function fmt$(cents) {
  if (!cents) return "$0";
  return "$" + (cents / 100).toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function fmtDec$(cents) {
  return "$" + (cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function copyCode(code) {
  const url = `${window.location.origin}?join=${code}`;
  navigator.clipboard?.writeText(url).catch(() => {});
}

export default function HostDashboard({ poolCode, onBack }) {
  const [pool, setPool]           = useState(null);
  const [payments, setPayments]   = useState([]);
  const [report, setReport]       = useState(null);
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState(TABS.payments);
  const [error, setError]         = useState("");
  const [info, setInfo]           = useState("");
  const [locking, setLocking]     = useState(false);
  const [deleting, setDeleting]   = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const loadAll = useCallback(async () => {
    try {
      const [poolData, paymentsData, reportData] = await Promise.all([
        getPool(poolCode),
        getPayments(poolCode),
        getPayoutReport(poolCode),
      ]);
      setPool(poolData);
      setPayments(paymentsData);
      setReport(reportData);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [poolCode]);

  useEffect(() => { loadAll(); }, [loadAll]);

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
      onBack();
    } catch (e) {
      setError(e.message);
      setDeleting(false);
    }
  }

  async function togglePayment(payment) {
    const newStatus = payment.status === "paid" ? "pending" : "paid";
    try {
      if (newStatus === "paid") await markPaid(poolCode, payment.entry_id);
      else await markUnpaid(poolCode, payment.entry_id);
      await loadAll();
    } catch (e) {
      setError(e.message);
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

  return (
    <div style={S.root}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={S.fieldBg} />

      <PinsHeader
        onBack={onBack}
        title="Host Dashboard"
        subtitle={pool.name}
        right={<span style={{ ...(isLocked ? S.badgeGold : S.badgeGreen), marginRight: 6 }}>{pool.status?.toUpperCase()}</span>}
      />

      {/* Tabs */}
      <div style={{ background: "rgba(6,16,6,0.97)", borderBottom: `1px solid rgba(255,255,255,0.07)` }}>
        <div style={{ display: "flex" }}>
          {[
            { id: TABS.payments, label: "Payments" },
            { id: TABS.report,   label: "Payout Report" },
            { id: TABS.settings, label: "Settings" },
          ].map(t => (
            <button
              key={t.id}
              style={{
                flex: 1, padding: "10px 4px", background: "transparent", border: "none",
                borderBottom: tab === t.id ? `2px solid ${C.gold}` : "2px solid transparent",
                fontFamily: FONT_DISPLAY, fontSize: "0.8rem", fontWeight: 600,
                color: tab === t.id ? C.gold : C.textDim,
                letterSpacing: "0.06em", cursor: "pointer",
              }}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ ...S.page, paddingBottom: 120 }}>
        {error && <div style={S.errorBanner}>{error}</div>}
        {info  && <div style={S.infoBanner}>{info}</div>}

        {/* ── PAYMENTS TAB ── */}
        {tab === TABS.payments && (
          <div>
            {report && (
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <div style={{ ...S.card, flex: 1, textAlign: "center", marginBottom: 0 }}>
                  <div style={{ fontFamily: FONT_DISPLAY, fontSize: "0.72rem", color: C.textDim, letterSpacing: "0.1em" }}>ENTRIES</div>
                  <div style={{ fontFamily: FONT_DISPLAY, fontSize: "1.6rem", fontWeight: 700, color: C.text }}>{report.totalEntries}</div>
                </div>
                <div style={{ ...S.card, flex: 1, textAlign: "center", marginBottom: 0 }}>
                  <div style={{ fontFamily: FONT_DISPLAY, fontSize: "0.72rem", color: C.textDim, letterSpacing: "0.1em" }}>COLLECTED</div>
                  <div style={{ fontFamily: FONT_DISPLAY, fontSize: "1.6rem", fontWeight: 700, color: C.green }}>{fmt$(report.collectedCents)}</div>
                </div>
                <div style={{ ...S.card, flex: 1, textAlign: "center", marginBottom: 0 }}>
                  <div style={{ fontFamily: FONT_DISPLAY, fontSize: "0.72rem", color: C.textDim, letterSpacing: "0.1em" }}>OWED</div>
                  <div style={{ fontFamily: FONT_DISPLAY, fontSize: "1.6rem", fontWeight: 700, color: C.red }}>
                    {fmt$((report.totalPotCents || 0) - (report.collectedCents || 0))}
                  </div>
                </div>
              </div>
            )}

            {payments.length === 0 ? (
              <div style={S.empty}>
                <div style={S.emptyIcon}>💳</div>
                No entries yet.
              </div>
            ) : (
              payments.map(p => (
                <div key={p.id} style={{ ...S.card, display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: FONT_DISPLAY, fontSize: "0.9rem", fontWeight: 700, color: C.text }}>
                      {p.username || `${p.first_name} ${p.last_name}`.trim()}
                      {p.entry_number > 1 && (
                        <span style={{ color: C.textDim, fontSize: "0.75rem", marginLeft: 6 }}>#{p.entry_number}</span>
                      )}
                    </div>
                    <div style={{ fontFamily: FONT_DISPLAY, fontSize: "0.8rem", color: C.gold }}>
                      {fmtDec$(p.amount_cents || pool.entry_fee_cents || 0)}
                    </div>
                    {p.total_earnings_cents != null && (
                      <div style={{ fontFamily: FONT_BODY, fontSize: "0.75rem", color: C.textDim }}>
                        Pool earnings: {fmt$(p.total_earnings_cents)}
                      </div>
                    )}
                  </div>
                  <button
                    style={p.status === "paid" ? S.btnSmallGreen : S.btnSmall}
                    onClick={() => togglePayment(p)}
                  >
                    {p.status === "paid" ? "✓ Paid" : "Mark Paid"}
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── PAYOUT REPORT TAB ── */}
        {tab === TABS.report && report && (
          <div>
            <div style={{ ...S.card, marginBottom: 16 }}>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: "0.72rem", color: C.textDim, letterSpacing: "0.1em", marginBottom: 10 }}>
                PRIZE POOL SUMMARY
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ color: C.textDim, fontFamily: FONT_BODY, fontSize: "0.85rem" }}>Total pot</span>
                <span style={{ color: C.text, fontFamily: FONT_DISPLAY, fontWeight: 700 }}>{fmt$(report.totalPotCents)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ color: C.textDim, fontFamily: FONT_BODY, fontSize: "0.85rem" }}>Collected ({report.paidCount}/{report.totalEntries} paid)</span>
                <span style={{ color: C.green, fontFamily: FONT_DISPLAY, fontWeight: 700 }}>{fmt$(report.collectedCents)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: C.textDim, fontFamily: FONT_BODY, fontSize: "0.85rem" }}>Still owed ({report.pendingCount} pending)</span>
                <span style={{ color: C.red, fontFamily: FONT_DISPLAY, fontWeight: 700 }}>
                  {fmt$(report.totalPotCents - report.collectedCents)}
                </span>
              </div>
            </div>

            <div style={S.sectionTitle}>PAYOUTS</div>
            {(report.payoutPlaces || []).map(place => (
              <div key={place.place} style={{ ...S.card, marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontFamily: FONT_DISPLAY, fontSize: "0.95rem", fontWeight: 700, color: C.gold }}>
                      {["1st","2nd","3rd","4th","5th"][Number(place.place)-1]} Place · {place.pct}%
                    </div>
                    <div style={{ fontFamily: FONT_DISPLAY, fontSize: "1.3rem", fontWeight: 700, color: C.text }}>
                      {fmt$(place.amountCents)}
                    </div>
                  </div>
                  {place.winner ? (
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: FONT_DISPLAY, fontSize: "0.9rem", fontWeight: 700, color: C.text }}>
                        {place.winner.username}
                        {place.winner.entryNumber > 1 && (
                          <span style={{ color: C.textDim, fontSize: "0.75rem", marginLeft: 4 }}>#{place.winner.entryNumber}</span>
                        )}
                      </div>
                      <div style={{ fontFamily: FONT_DISPLAY, fontSize: "0.8rem", color: C.gold }}>
                        {fmt$(place.winner.earningsCents)} in pool earnings
                      </div>
                    </div>
                  ) : (
                    <span style={S.badgeGray}>TBD</span>
                  )}
                </div>
              </div>
            ))}

            <div style={S.sectionTitle}>ALL ENTRIES (by earnings)</div>
            {(report.entries || []).map(e => (
              <div key={e.entryId} style={{
                ...S.card, marginBottom: 6,
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: "1rem", fontWeight: 700, color: C.textDim, width: 26, textAlign: "center" }}>
                  {e.rank}
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontFamily: FONT_DISPLAY, fontSize: "0.9rem", color: C.text }}>{e.username}</span>
                  {e.entryNumber > 1 && (
                    <span style={{ fontFamily: FONT_DISPLAY, fontSize: "0.72rem", color: C.textDim, marginLeft: 6 }}>#{e.entryNumber}</span>
                  )}
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: FONT_DISPLAY, fontSize: "0.9rem", fontWeight: 700, color: C.gold }}>
                    {fmt$(e.earningsCents)}
                  </div>
                  <div style={{ fontFamily: FONT_DISPLAY, fontSize: "0.68rem", color: e.paymentStatus === "paid" ? C.green : C.red }}>
                    {e.paymentStatus === "paid" ? "✓ PAID" : "UNPAID"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── SETTINGS TAB ── */}
        {tab === TABS.settings && (
          <div>
            {/* Share */}
            <div style={S.card}>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: "0.85rem", fontWeight: 700, color: C.text, marginBottom: 8 }}>
                Share Pool
              </div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: "1.8rem", fontWeight: 700, color: C.gold, letterSpacing: "0.2em", textAlign: "center", marginBottom: 10 }}>
                {poolCode}
              </div>
              <button style={S.btnSecondary} onClick={() => { copyCode(poolCode); setInfo("Link copied!"); }}>
                Copy Invite Link
              </button>
            </div>

            {/* Lock pool */}
            {!isLocked && (
              <div style={{ ...S.card, borderColor: "rgba(212,175,55,0.2)" }}>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: "0.85rem", fontWeight: 700, color: C.gold, marginBottom: 4 }}>
                  Lock Picks
                </div>
                <div style={{ fontFamily: FONT_BODY, fontSize: "0.8rem", color: C.textDim, marginBottom: 12 }}>
                  Prevent any new entries from being submitted. Do this before the tournament starts.
                </div>
                <button
                  style={{ ...S.btnPrimary, opacity: locking ? 0.6 : 1 }}
                  onClick={handleLock}
                  disabled={locking}
                >
                  {locking ? "Locking…" : "Lock Pool Now"}
                </button>
              </div>
            )}

            {isLocked && (
              <div style={S.warnBanner}>
                This pool is locked — no new entries can be submitted.
              </div>
            )}

            {/* Delete */}
            <div style={{ ...S.card, borderColor: "rgba(231,76,60,0.2)", marginTop: 8 }}>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: "0.85rem", fontWeight: 700, color: C.red, marginBottom: 4 }}>
                Delete Pool
              </div>
              <div style={{ fontFamily: FONT_BODY, fontSize: "0.8rem", color: C.textDim, marginBottom: 12 }}>
                Permanently deletes this pool and all entries. This cannot be undone.
              </div>
              {!confirmDelete ? (
                <button style={S.btnDanger} onClick={() => setConfirmDelete(true)}>Delete Pool</button>
              ) : (
                <div>
                  <div style={{ ...S.warnBanner, marginBottom: 10 }}>Are you sure? This cannot be undone.</div>
                  <div style={S.btnRow}>
                    <button style={{ ...S.btnDanger, opacity: deleting ? 0.6 : 1 }} onClick={handleDelete} disabled={deleting}>
                      {deleting ? "Deleting…" : "Yes, Delete"}
                    </button>
                    <button style={S.btnSecondary} onClick={() => setConfirmDelete(false)}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
