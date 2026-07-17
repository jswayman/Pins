import { C, FONT_DISPLAY } from "./styles";

/**
 * Fixed bottom navigation bar — shown on all main screens.
 *
 * Props:
 *   screen        — current app screen string
 *   homeTab       — "mine" | "public" (current home sub-tab)
 *   onHome        — go to home, My Pools tab
 *   onBrowse      — go to home, Browse tab
 *   onCreate      — open Create Pool screen
 *   onManage      — open Host Dashboard (only passed when user is host of active pool)
 */
export default function PinsTabBar({ screen, homeTab, onHome, onBrowse, onCreate, onManage }) {
  const isHome    = screen === "home";
  const isCreate  = screen === "create";
  const isManage  = screen === "host";
  const isMine    = isHome && homeTab !== "public";
  const isBrowse  = isHome && homeTab === "public";

  const tabs = [
    {
      key:    "mine",
      icon:   "🏠",
      label:  "My Pools",
      active: isMine,
      onClick: onHome,
    },
    {
      key:    "browse",
      icon:   "🔍",
      label:  "Browse",
      active: isBrowse,
      onClick: onBrowse,
    },
    {
      key:    "create",
      icon:   "＋",
      label:  "New Pool",
      active: isCreate,
      onClick: onCreate,
    },
    // Manage tab only appears when the user is the host of the current pool
    ...(onManage ? [{
      key:    "manage",
      icon:   "⚙️",
      label:  "Manage",
      active: isManage,
      onClick: onManage,
    }] : []),
  ];

  return (
    <nav style={{
      position:       "fixed",
      bottom:         0,
      left:           0,
      right:          0,
      zIndex:         200,
      background:     "rgba(6,16,6,0.97)",
      backdropFilter: "blur(20px)",
      borderTop:      "1px solid rgba(255,255,255,0.07)",
      paddingBottom:  "env(safe-area-inset-bottom)",
      display:        "flex",
      justifyContent: "space-around",
      height:         64,
      alignItems:     "flex-start",
      paddingTop:     8,
    }}>
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={tab.onClick}
          style={{
            background:    "none",
            border:        "none",
            cursor:        "pointer",
            display:       "flex",
            flexDirection: "column",
            alignItems:    "center",
            gap:           3,
            minWidth:      44,
            padding:       "4px 12px",
            fontFamily:    FONT_DISPLAY,
            opacity:       tab.onClick ? 1 : 0.3,
          }}
        >
          <span style={{ fontSize: tab.key === "create" ? 22 : 18, lineHeight: 1 }}>{tab.icon}</span>
          <span style={{
            fontSize:      10,
            fontWeight:    600,
            letterSpacing: "0.05em",
            color:         tab.active ? C.gold : "rgba(255,255,255,0.4)",
            fontFamily:    FONT_DISPLAY,
          }}>
            {tab.label}
          </span>
          {tab.active && (
            <span style={{
              width: 4, height: 4, borderRadius: "50%",
              background: C.gold, marginTop: 1,
            }} />
          )}
        </button>
      ))}
    </nav>
  );
}
