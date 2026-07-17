import { useState, useRef } from "react";
import { updateProfile, deleteAccount, checkAvailability } from "../api";
import { getToken } from "../api";
import AvatarPicker from "./AvatarPicker";
import PwInput from "./PwInput";
import { formatPhone } from "../utils/formatPhone";
import S from "./styles";

export default function ProfileModal({ currentUser, onClose, onUpdated, onSignOut }) {
  const token = getToken();

  const [firstName,       setFirstName]       = useState(currentUser.first_name  || "");
  const [lastName,        setLastName]        = useState(currentUser.last_name   || "");
  const [username,        setUsername]        = useState(currentUser.username);
  const [email,           setEmail]           = useState(currentUser.email);
  const [phone,           setPhone]           = useState(currentUser.phone || "");
  const [avatar,          setAvatar]          = useState(currentUser.avatar || "");
  const [fieldErr,        setFieldErr]        = useState({ username: "", email: "" });
  const [showPwSection,   setShowPwSection]   = useState(false);
  const [showPwText,      setShowPwText]      = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword,     setNewPassword]     = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error,           setError]           = useState("");
  const [success,         setSuccess]         = useState("");
  const [loading,         setLoading]         = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading,   setDeleteLoading]   = useState(false);
  const debounceRef = useRef({});

  function checkField(field, value) {
    clearTimeout(debounceRef.current[field]);
    setFieldErr(fe => ({ ...fe, [field]: "" }));
    const original = field === "username" ? currentUser.username : currentUser.email;
    if (!value.trim() || value.trim() === original) return;
    if (field === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return;
    debounceRef.current[field] = setTimeout(async () => {
      try {
        const res = await checkAvailability({ [field]: value.trim() });
        if (res.usernameTaken) setFieldErr(fe => ({ ...fe, username: "Username already taken" }));
        if (res.emailTaken)    setFieldErr(fe => ({ ...fe, email: "Email already has an account" }));
      } catch { /* ignore network errors */ }
    }, 500);
  }

  const save = async () => {
    setError(""); setSuccess("");
    if (!username.trim()) { setError("Username is required."); return; }
    if (!email.trim())    { setError("Email is required."); return; }
    if (!phone.trim())    { setError("Phone number is required."); return; }
    if (!/^\+?[\d\s\-().]{7,}$/.test(phone.trim())) { setError("Enter a valid phone number."); return; }
    if (fieldErr.username || fieldErr.email) { setError("Please fix the errors above before continuing."); return; }
    if (showPwSection) {
      if (!currentPassword)              { setError("Enter your current password."); return; }
      if (newPassword.length < 4)        { setError("New password must be at least 4 characters."); return; }
      if (newPassword !== confirmPassword) { setError("New passwords don't match."); return; }
    }

    setLoading(true);
    try {
      const payload = {
        token,
        firstName, lastName, username, email, phone, avatar,
        ...(showPwSection ? { currentPassword, newPassword } : {}),
      };
      const data = await updateProfile(payload);
      onUpdated(data.user, data.token);
      setSuccess("Profile updated!");
      setShowPwSection(false);
      setShowPwText(false);
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={{ ...S.modal, maxWidth: 480, width: "95%", maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h3 style={{ ...S.modalTitle, margin: 0, color: "#FFB612" }}>My Profile</h3>
          <button style={S.microBtn} onClick={onClose}>✕ Close</button>
        </div>

        {error   && <div style={S.errorBanner}>{error}</div>}
        {success && <div style={S.infoBanner}>{success}</div>}

        <div style={S.row}>
          <div style={{ flex: 1 }}>
            <label style={S.label}>First Name</label>
            <input style={S.input} value={firstName} onChange={e => { setFirstName(e.target.value); setError(""); }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={S.label}>Last Name</label>
            <input style={S.input} value={lastName} onChange={e => { setLastName(e.target.value); setError(""); }} />
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <label style={S.label}>Username</label>
          <input
            style={{ ...S.input, borderColor: fieldErr.username ? "#e05555" : undefined }}
            value={username}
            onChange={e => { setUsername(e.target.value); setError(""); checkField("username", e.target.value); }}
            autoComplete="username"
          />
          {fieldErr.username && <div style={{ color: "#e05555", fontSize: 12, marginTop: 4, paddingLeft: 4 }}>{fieldErr.username}</div>}
        </div>

        <div style={{ marginTop: 12 }}>
          <label style={S.label}>Email</label>
          <input
            style={{ ...S.input, borderColor: fieldErr.email ? "#e05555" : undefined }}
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setError(""); checkField("email", e.target.value); }}
            autoComplete="email"
          />
          {fieldErr.email && <div style={{ color: "#e05555", fontSize: 12, marginTop: 4, paddingLeft: 4 }}>{fieldErr.email}</div>}
        </div>

        <div style={{ marginTop: 12 }}>
          <label style={S.label}>Phone <span style={{ color: "#e05555" }}>*</span></label>
          <input
            style={S.input}
            type="tel"
            placeholder="(555) 555-5555"
            value={phone}
            onChange={e => { setPhone(formatPhone(e.target.value)); setError(""); }}
            autoComplete="tel"
          />
        </div>

        <div style={{ marginTop: 12 }}>
          <label style={S.label}>Avatar</label>
          <AvatarPicker value={avatar} onChange={(v) => { setAvatar(v); setError(""); }} />
        </div>

        {/* Password section */}
        <div style={S.profileDivider} />
        <button style={S.profilePwToggle} onClick={() => { setShowPwSection(v => !v); setError(""); setShowPwText(false); }}>
          {showPwSection ? "▾ Cancel password change" : "▸ Change password"}
        </button>
        {showPwSection && (
          <>
            <div style={{ marginTop: 8 }}>
              <label style={S.label}>Current Password</label>
              <PwInput style={S.input} value={currentPassword}
                onChange={e => { setCurrentPassword(e.target.value); setError(""); }}
                placeholder="Enter current password…" autoComplete="current-password"
                showPw={showPwText} onToggle={() => setShowPwText(v => !v)} />
            </div>
            <div style={{ marginTop: 10 }}>
              <label style={S.label}>New Password</label>
              <PwInput style={S.input} value={newPassword}
                onChange={e => { setNewPassword(e.target.value); setError(""); }}
                placeholder="Min 4 characters…" autoComplete="new-password"
                showPw={showPwText} onToggle={() => setShowPwText(v => !v)} />
            </div>
            <div style={{ marginTop: 10 }}>
              <label style={S.label}>Confirm New Password</label>
              <PwInput style={S.input} value={confirmPassword}
                onChange={e => { setConfirmPassword(e.target.value); setError(""); }}
                placeholder="Re-enter new password…" autoComplete="new-password"
                showPw={showPwText} onToggle={() => setShowPwText(v => !v)} />
              {confirmPassword && newPassword !== confirmPassword && (
                <div style={{ color: "#e05555", fontSize: 12, marginTop: 4, paddingLeft: 4 }}>Passwords don't match</div>
              )}
              {confirmPassword && newPassword === confirmPassword && (
                <div style={{ color: "#7dbb7d", fontSize: 12, marginTop: 4, paddingLeft: 4 }}>✓ Passwords match</div>
              )}
            </div>
          </>
        )}

        <button
          style={{ ...S.primaryBtn, opacity: loading ? 0.6 : 1 }}
          onClick={save}
          disabled={loading}
        >
          {loading ? "Saving…" : "Save Changes"}
        </button>

        {/* Delete Account */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: 20, paddingTop: 16 }}>
          {!showDeleteConfirm ? (
            <button
              style={{ ...S.ghostBtn, color: "#e74c3c", borderColor: "rgba(231,76,60,0.3)", marginTop: 0 }}
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete My Account
            </button>
          ) : (
            <div style={{ background: "rgba(231,76,60,0.08)", border: "1px solid rgba(231,76,60,0.3)", borderRadius: 10, padding: 16 }}>
              <p style={{ color: "#e74c3c", fontWeight: 600, margin: "0 0 6px", fontFamily: "'Oswald',sans-serif" }}>
                Delete your account?
              </p>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.82rem", margin: "0 0 14px" }}>
                This is permanent. Your account and all pool data will be removed. This cannot be undone.
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  style={{ ...S.primaryBtn, background: "#e74c3c", flex: 1, marginTop: 0, opacity: deleteLoading ? 0.6 : 1 }}
                  disabled={deleteLoading}
                  onClick={async () => {
                    setDeleteLoading(true);
                    try {
                      const result = await deleteAccount(token);
                      if (result.error) {
                        setError(result.error);
                        setDeleteLoading(false);
                        setShowDeleteConfirm(false);
                      } else {
                        onSignOut();
                      }
                    } catch {
                      setError("Failed to delete account. Please try again.");
                      setDeleteLoading(false);
                      setShowDeleteConfirm(false);
                    }
                  }}
                >
                  {deleteLoading ? "Deleting…" : "Yes, Delete My Account"}
                </button>
                <button style={{ ...S.ghostBtn, flex: 1, marginTop: 0 }} onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
