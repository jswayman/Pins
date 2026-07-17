import { useState, useRef, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { setToken } from "../api";
import ProfileModal from "./ProfileModal";
import { getDisplayName } from "../utils/displayName";
import S, { C, FONT_DISPLAY } from "./styles";

/**
 * Shared app header for all Pins screens.
 * Shows the PINS logo on the left, optional back button, and the user pill
 * with a full dropdown menu on the right — same pattern as GameGrid.
 *
 * Props:
 *   onBack      — if provided, renders a Back button before the title
 *   title       — optional title text shown in the centre/left
 *   subtitle    — optional grey subtitle below the title
 *   right       — optional extra node rendered before the user pill
 */
export default function PinsHeader({ onBack, title, subtitle, right }) {
  const { user, logout, setUser } = useAuth();
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  if (!user) return null;

  const displayName = getDisplayName(user);

  const isCustomAvatar = user.avatar?.startsWith("data:") || user.avatar?.startsWith("https://");
  const avatarContent  = isCustomAvatar
    ? <img src={user.avatar} alt="" style={S.headerAvatarImg} />
    : (user.avatar || "⛳");

  return (
    <>
      <div style={S.appHeader}>
        <div style={S.appHeaderRow}>

          {/* Left: back button + logo / title */}
          {onBack ? (
            <>
              <button style={{ ...S.btnSmall, width: "auto", flexShrink: 0 }} onClick={onBack}>← Back</button>
              {title && (
                <div style={{ flex: 1, marginLeft: 10, minWidth: 0 }}>
                  <div style={{ fontFamily: FONT_DISPLAY, fontSize: "1rem", fontWeight: 700, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {title}
                  </div>
                  {subtitle && (
                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "0.72rem", color: C.textDim }}>{subtitle}</div>
                  )}
                </div>
              )}
            </>
          ) : (
            <button style={S.headerLogo} onClick={() => window.location.href = "/"}>
              <span style={S.headerLogoText}>PINS</span>
              <span style={{ fontFamily: FONT_DISPLAY, fontSize: "0.62rem", color: C.textDim, letterSpacing: "0.06em", marginLeft: 6 }}>
                golf pool
              </span>
            </button>
          )}

          <div style={{ flex: 1 }} />

          {/* Optional extra right-side content */}
          {right}

          {/* User pill + dropdown */}
          <div style={{ position: "relative", flexShrink: 0 }} ref={menuRef}>
            <button
              style={{ ...S.headerUser, ...(menuOpen ? S.headerUserActive : {}) }}
              onClick={() => setMenuOpen(v => !v)}
              title="Account menu"
            >
              <span style={S.headerAvatar}>{avatarContent}</span>
              <span style={S.headerUserName}>{displayName}</span>
              <span style={S.headerGear}>⚙️</span>
            </button>

            {menuOpen && (
              <div style={S.userMenu}>

                {/* Username / greeting */}
                <div style={{ ...S.userMenuItem, cursor: "default", color: C.textDim, fontSize: "0.78rem" }}>
                  <span style={S.userMenuIcon}>👤</span>
                  {user.username}
                </div>
                <div style={S.userMenuDivider} />

                {/* Admin */}
                {user.is_admin && (
                  <>
                    <button
                      style={{ ...S.userMenuItem, color: C.gold }}
                      onClick={() => { setMenuOpen(false); window.location.href = "/admin"; }}
                    >
                      <span style={S.userMenuIcon}>🛡️</span> Admin Panel
                    </button>
                    <div style={S.userMenuDivider} />
                  </>
                )}

                {/* Profile */}
                <button style={S.userMenuItem} onClick={() => { setMenuOpen(false); setShowProfile(true); }}>
                  <span style={S.userMenuIcon}>✏️</span> Update Profile
                </button>

                {/* Navigation */}
                <button style={S.userMenuItem} onClick={() => { setMenuOpen(false); window.location.href = "/"; }}>
                  <span style={S.userMenuIcon}>🏠</span> Home
                </button>

                <div style={S.userMenuDivider} />

                {/* External links */}
                <button style={S.userMenuItem} onClick={() => { setMenuOpen(false); window.open("https://yourgamespot.com", "_blank"); }}>
                  <span style={S.gamespotPill}>
                    <span style={{ color: "#fff" }}>YOUR</span>
                    <span style={{ color: C.gold }}>GAMESPOT</span>
                  </span>
                </button>

                <button style={S.userMenuItem} onClick={() => {
                  setMenuOpen(false);
                  window.location.href = "mailto:admin@yourgamespot.com?subject=Pins Support";
                }}>
                  <span style={S.userMenuIcon}>✉️</span> Contact Us
                </button>

                <div style={S.userMenuDivider} />

                {/* Sign out */}
                <button
                  style={{ ...S.userMenuItem, color: C.red }}
                  onClick={() => { setMenuOpen(false); logout(); }}
                >
                  <span style={S.userMenuIcon}>🚪</span> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showProfile && (
        <ProfileModal
          currentUser={user}
          onClose={() => setShowProfile(false)}
          onUpdated={(updatedUser, newToken) => {
            if (newToken) setToken(newToken);
            setUser(updatedUser);
            setShowProfile(false);
          }}
          onSignOut={() => { setShowProfile(false); logout(); }}
        />
      )}
    </>
  );
}
