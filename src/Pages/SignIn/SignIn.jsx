// src/Pages/SignIn/SignIn.js (or .jsx)
import "./SignIn.css";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, signInWithGoogle } from "../../services/firebase";
import { useAuthState } from "react-firebase-hooks/auth";

import google from "../../images/google.png";
import logo from "../../images/logo.png";
import openai from "../../images/openAI.png";

export default function SignIn() {
  const [user, loading, authError] = useAuthState(auth);
  const [btnBusy, setBtnBusy] = useState(false);
  const [localError, setLocalError] = useState("");
  const navigate = useNavigate();

  // If already logged in, send to /home
  useEffect(() => {
    if (loading) return; // still resolving auth
    if (user) navigate("/home", { replace: true });
  }, [user, loading, navigate]);

  async function handleGoogle() {
    try {
      setLocalError("");
      setBtnBusy(true);
      await signInWithGoogle();           // your firebase helper
      navigate("/home", { replace: true }); // safety redirect
    } catch (e) {
      console.error(e);
      setLocalError(e?.message || "Sign-in failed. Try again.");
    } finally {
      setBtnBusy(false);
    }
  }

  if (loading) {
    return <div className="p-6">Loading…</div>;
  }

  return (
    <div style={{ paddingTop: "30px" }}>
      <h1 style={{ color: "#31444e" }}>Welcome</h1>
      <img src={logo} alt="logo" className="signin-logo" />

      <div className="ai">
        <h3>Powered by</h3>
        <img src={openai} alt="OpenAI" style={{ height: 25, paddingLeft: 5 }} />
      </div>

      <div className="sign-in-form-container">
        <button className="google-button" onClick={handleGoogle} disabled={btnBusy}>
          <img src={google} alt="Google" className="google-logo" style={{ height: 25 }} />
          {btnBusy ? "Signing in…" : "Continue with Google"}
        </button>

        {(authError || localError) && (
          <div className="error" style={{ marginTop: 12, color: "#b00020" }}>
            {authError?.message || localError}
          </div>
        )}
      </div>
    </div>
  );
}
