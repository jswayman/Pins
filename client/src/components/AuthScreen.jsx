import { useState } from "react";
import { signup, login, forgotPw } from "../api";
import { useAuth } from "../hooks/useAuth";
import S, { C } from "./styles";

const MODES = { login: "login", signup: "signup", forgot: "forgot" };

const optInLabel = {
  display: "flex",
  alignItems: "flex-start",
  gap: 10,
  cursor: "pointer",
  padding: "12px 14px",
  background: "rgba(255,255,255,0.04)",
  border: `1px solid ${C.borderMid}`,
  borderRadius: 10,
  marginBottom: 10,
};

export default function AuthScreen() {
  const { login: authLogin } = useAuth();
  const [mode, setMode]       = useState(MODES.login);
  const [form, setForm]       = useState({ username: "", email: "", phone: "", password: "", firstName: "", lastName: "" });
  const [smsOptIn, setSmsOptIn]     = useState(false);
  const [emailOptIn, setEmailOptIn] = useState(false);
  const [error, setError]     = useState("");
  const [info, setInfo]       = useState("");
  const [loading, setLoading] = useState(false);

  function set(k) { return e => setForm(f => ({ ...f, [k]: e.target.value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setInfo("");
    setLoading(true);
    try {
      if (mode === MODES.login) {
        const { user, token } = await login({ username: form.username, password: form.password });
        authLogin(user, token);
      } else if (mode === MODES.signup) {
        const { user, token } = await signup({
          username: form.username, email: form.email,
          phone: form.phone || undefined,
          password: form.password,
          first_name: form.firstName, last_name: form.lastName,
          smsOptIn,
          emailOptIn,
        });
        authLogin(user, token);
      } else {
        await forgotPw({ email: form.email });
        setInfo("Check your email for a reset link.");
        setMode(MODES.login);
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={S.authWrap}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={S.authCard}>
        <div style={S.authLogo}>
          <div style={S.authLogoText}>PINS</div>
          <div style={S.authLogoSub}>Golf Pool — yourgamespot.com</div>
        </div>

        {error && <div style={S.errorBanner}>{error}</div>}
        {info  && <div style={S.infoBanner}>{info}</div>}

        <div style={S.authTitle}>
          {mode === MODES.login ? "Sign In" : mode === MODES.signup ? "Create Account" : "Reset Password"}
        </div>

        <form onSubmit={handleSubmit}>
          {mode === MODES.signup && (
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              <div style={{ flex: 1 }}>
                <label style={S.label}>First Name</label>
                <input style={S.input} value={form.firstName} onChange={set("firstName")} required autoComplete="given-name" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={S.label}>Last Name</label>
                <input style={S.input} value={form.lastName} onChange={set("lastName")} required autoComplete="family-name" />
              </div>
            </div>
          )}

          {mode !== MODES.forgot && (
            <div style={S.formGroup}>
              <label style={S.label}>Username</label>
              <input style={S.input} value={form.username} onChange={set("username")} required autoComplete="username" />
            </div>
          )}

          {(mode === MODES.signup || mode === MODES.forgot) && (
            <div style={S.formGroup}>
              <label style={S.label}>Email</label>
              <input style={S.input} type="email" value={form.email} onChange={set("email")} required autoComplete="email" />
            </div>
          )}

          {mode === MODES.signup && (
            <div style={S.formGroup}>
              <label style={S.label}>Phone</label>
              <input style={S.input} type="tel" value={form.phone} onChange={set("phone")} placeholder="(555) 555-5555" autoComplete="tel" />
            </div>
          )}

          {/* Opt-ins immediately after contact fields so they stay on-screen */}
          {mode === MODES.signup && (
            <>
              <label style={optInLabel}>
                <input
                  type="checkbox"
                  checked={smsOptIn}
                  onChange={e => setSmsOptIn(e.target.checked)}
                  style={{ marginTop: 2, width: 16, height: 16, flexShrink: 0, accentColor: C.gold, cursor: "pointer" }}
                />
                <span style={{ fontSize: 11, color: C.textDim, lineHeight: 1.6 }}>
                  I agree to receive text messages from Interlock Solutions, LLC (YourGameSpot) for account
                  notifications, including password recovery codes. Message and data rates may apply.
                  Up to 4 msgs/month. Reply STOP to opt out.{" "}
                  <a href="https://yourgamespot.com/sms-policy.html" target="_blank" rel="noreferrer"
                    style={{ color: C.text, textDecoration: "underline" }}>SMS Policy</a>
                </span>
              </label>
              <label style={optInLabel}>
                <input
                  type="checkbox"
                  checked={emailOptIn}
                  onChange={e => setEmailOptIn(e.target.checked)}
                  style={{ marginTop: 2, width: 16, height: 16, flexShrink: 0, accentColor: C.gold, cursor: "pointer" }}
                />
                <span style={{ fontSize: 11, color: C.textDim, lineHeight: 1.6 }}>
                  I agree to receive email notifications from YourGameSpot about my account, pools, and game
                  updates. You can unsubscribe anytime.
                </span>
              </label>
            </>
          )}

          {mode !== MODES.forgot && (
            <div style={S.formGroup}>
              <label style={S.label}>Password</label>
              <input style={S.input} type="password" value={form.password} onChange={set("password")} required autoComplete={mode === MODES.login ? "current-password" : "new-password"} />
            </div>
          )}

          <div style={{ marginTop: 4 }}>
            <button type="submit" style={{ ...S.btnPrimary, opacity: loading ? 0.7 : 1 }} disabled={loading}>
              {loading
                ? <span style={S.spinner} />
                : mode === MODES.login ? "Sign In"
                  : mode === MODES.signup ? "Create Account"
                  : "Send Reset Email"}
            </button>
          </div>
        </form>

        <div style={S.authToggle}>
          {mode === MODES.login && <>
            <button style={S.authToggleLink} onClick={() => setMode(MODES.signup)}>Create account</button>
            {" · "}
            <button style={S.authToggleLink} onClick={() => setMode(MODES.forgot)}>Forgot password?</button>
          </>}
          {mode === MODES.signup && (
            <button style={S.authToggleLink} onClick={() => setMode(MODES.login)}>Already have an account?</button>
          )}
          {mode === MODES.forgot && (
            <button style={S.authToggleLink} onClick={() => setMode(MODES.login)}>Back to sign in</button>
          )}
        </div>
      </div>
    </div>
  );
}
