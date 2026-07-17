import { useState } from "react";
import { signup, login, forgotPw } from "../api";
import { useAuth } from "../hooks/useAuth";
import S, { C } from "./styles";

const MODES = { login: "login", signup: "signup", forgot: "forgot" };

export default function AuthScreen() {
  const { login: authLogin } = useAuth();
  const [mode, setMode]       = useState(MODES.login);
  const [form, setForm]       = useState({ username: "", email: "", password: "", firstName: "", lastName: "" });
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
          password: form.password,
          first_name: form.firstName, last_name: form.lastName,
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
