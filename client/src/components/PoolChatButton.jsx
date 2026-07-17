import { C, FONT_DISPLAY } from "./styles";

export default function PoolChatButton({ unread = 0, onClick, title = "Pool chat", style = {} }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={unread > 0 ? `Pool chat, ${unread} unread` : "Pool chat"}
      style={{
        position: "relative",
        background: unread > 0 ? C.goldDim : "rgba(255,255,255,0.06)",
        border: `1px solid ${unread > 0 ? C.goldBorder : C.border}`,
        borderRadius: 20,
        padding: "6px 12px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 6,
        transition: "all 0.15s",
        flexShrink: 0,
        fontFamily: FONT_DISPLAY,
        ...style,
      }}
    >
      <span style={{ fontSize: 15 }}>💬</span>
      {unread > 0 && (
        <span style={{ fontSize: 11, fontWeight: 800, color: C.gold }}>
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </button>
  );
}
