import { useState, useEffect, useRef } from "react";
import { getChatHistory, markChatRead } from "../api";
import { useAuth } from "../hooks/useAuth";
import { getSocket } from "../hooks/useSocket";
import { getDisplayName } from "../utils/displayName";
import { C, FONT_DISPLAY, FONT_BODY } from "./styles";

export default function PoolChat({ poolId, poolCode, poolName, open: openProp, onToggle, onUnreadChange }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [openInternal, setOpenInternal] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const open = openProp !== undefined ? openProp : openInternal;
  const setOpen = (v) => {
    const next = typeof v === "function" ? v(open) : v;
    if (onToggle) onToggle(next);
    else setOpenInternal(next);
  };

  const openRef = useRef(open);
  openRef.current = open;

  useEffect(() => {
    if (!poolId || !poolCode) return;
    const s = getSocket();
    s.emit("pins:pool:join", { poolId });
    getChatHistory(poolCode).then(setMessages).catch(() => {});

    const handler = (msg) => {
      if (String(msg.poolId) !== String(poolId)) return;
      setMessages(prev => [...prev, msg]);
      if (!openRef.current) {
        setUnread(n => {
          const next = n + 1;
          onUnreadChange?.(next);
          return next;
        });
      }
    };
    s.on("pins:pool:chat", handler);
    return () => s.off("pins:pool:chat", handler);
  }, [poolId, poolCode]);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    if (open && poolCode) {
      setUnread(0);
      onUnreadChange?.(0);
      setTimeout(() => inputRef.current?.focus(), 100);
      markChatRead(poolCode).catch(() => {});
    }
  }, [open, poolCode]);

  function send() {
    const msg = input.trim();
    if (!msg || !user || !poolId) return;
    getSocket().emit("pins:pool:chat", { poolId, userId: user.id, message: msg });
    setInput("");
  }

  function formatTime(ts) {
    return new Date(ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }

  if (!open) return null;

  return (
    <div style={{
      position: "fixed", bottom: 160, right: 16, zIndex: 300,
      width: 320, maxWidth: "calc(100vw - 32px)",
      background: C.bg2, border: `1px solid ${C.border}`,
      borderRadius: 16, boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
      display: "flex", flexDirection: "column", overflow: "hidden",
      fontFamily: FONT_BODY,
    }}>
      <div style={{
        padding: "12px 14px", background: "rgba(0,0,0,0.25)",
        borderBottom: `1px solid ${C.border}`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{
          fontWeight: 700, color: C.text, fontSize: 14, fontFamily: FONT_DISPLAY,
          overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", maxWidth: 220,
        }}>
          💬 {poolName || "Pool Chat"}
        </div>
        <button onClick={() => setOpen(false)} style={{
          background: "none", border: "none", color: C.textDim,
          cursor: "pointer", fontSize: 18, lineHeight: 1, padding: 0,
        }}>×</button>
      </div>

      <div style={{
        height: 280, overflowY: "auto", padding: "10px 12px",
        display: "flex", flexDirection: "column", gap: 8,
      }}>
        {messages.length === 0 && (
          <div style={{ color: C.textDim, fontSize: 13, textAlign: "center", marginTop: 60 }}>
            No messages yet. Say something! ⛳
          </div>
        )}
        {messages.map((m, i) => {
          const isMe = String(m.user_id || m.userId) === String(user?.id);
          return (
            <div key={m.id || i} style={{ display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start" }}>
              {!isMe && (
                <div style={{ fontSize: 10, color: C.textDim, marginBottom: 2, paddingLeft: 4 }}>
                  {getDisplayName(m)}
                </div>
              )}
              <div style={{
                background: isMe ? C.gold : "rgba(255,255,255,0.08)",
                color: isMe ? "#0a1a0a" : C.text,
                padding: "7px 11px",
                borderRadius: isMe ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                fontSize: 13, maxWidth: "80%", wordBreak: "break-word",
              }}>
                {m.message}
              </div>
              <div style={{ fontSize: 9, color: C.textFaint, marginTop: 2, paddingLeft: 4, paddingRight: 4 }}>
                {formatTime(m.created_at)}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div style={{ padding: "10px 12px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 8 }}>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Message..."
          maxLength={500}
          style={{
            flex: 1, background: "rgba(255,255,255,0.06)", border: `1px solid ${C.border}`,
            borderRadius: 20, padding: "8px 14px", fontSize: 13,
            color: C.text, fontFamily: FONT_BODY, outline: "none",
          }}
        />
        <button onClick={send} disabled={!input.trim()} style={{
          background: C.gold, border: "none", borderRadius: "50%",
          width: 36, height: 36, cursor: "pointer", fontSize: 16,
          opacity: input.trim() ? 1 : 0.4, flexShrink: 0,
        }}>↑</button>
      </div>
    </div>
  );
}
