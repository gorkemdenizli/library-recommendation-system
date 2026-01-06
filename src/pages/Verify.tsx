import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { confirmSignUp, resendSignUpCode } from "aws-amplify/auth";

type LocationState = { email?: string };

export default function Verify() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LocationState) || {};

  const [email, setEmail] = useState(state.email ?? "");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const onConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!email.trim() || !code.trim()) {
      setError("Email and verification code are required.");
      return;
    }

    setLoading(true);
    try {
      await confirmSignUp({
        username: email.trim(),
        confirmationCode: code.trim(),
      });

      setInfo("Verified successfully. You can now log in.");
      // Login sayfasına yönlendir (email’i state ile taşı)
      navigate("/login", { state: { email: email.trim() } });
    } catch (err: any) {
      setError(err?.message ?? "Failed to verify account.");
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    setError(null);
    setInfo(null);

    if (!email.trim()) {
      setError("Email is required to resend the code.");
      return;
    }

    setResendLoading(true);
    try {
      await resendSignUpCode({ username: email.trim() });
      setInfo("Verification code resent. Please check your email.");
    } catch (err: any) {
      setError(err?.message ?? "Failed to resend code.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "40px auto" }}>
      <h1>Verify your account</h1>
      <p>Enter the code sent to your email.</p>

      <form onSubmit={onConfirm}>
        <label>Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="you@example.com"
          style={{ width: "100%", marginBottom: 12 }}
        />

        <label>Verification code</label>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          inputMode="numeric"
          placeholder="123456"
          style={{ width: "100%", marginBottom: 12 }}
        />

        {error && <div style={{ color: "crimson", marginBottom: 12 }}>{error}</div>}
        {info && <div style={{ color: "green", marginBottom: 12 }}>{info}</div>}

        <button type="submit" disabled={loading} style={{ width: "100%" }}>
          {loading ? "Verifying..." : "Verify"}
        </button>
      </form>

      <button
        onClick={onResend}
        disabled={resendLoading}
        style={{ width: "100%", marginTop: 12 }}
      >
        {resendLoading ? "Resending..." : "Resend code"}
      </button>
    </div>
  );
}
