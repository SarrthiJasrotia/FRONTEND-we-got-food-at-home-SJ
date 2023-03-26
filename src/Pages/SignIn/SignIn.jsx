import "./SignIn.css";
import { useEffect } from "react";
import React from "react";
import google from "../../images/google.png";
import logo from "../../images/logo.png";
import { Link, useNavigate, Outlet } from "react-router-dom";
import { auth, signInWithGoogle } from "../../services/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import openai from "../../images/openAI.png";

function SignIn() {
  const [user, loading, error] = useAuthState(auth);
  const navigate = useNavigate();
  useEffect(() => {
    if (loading) {
      // loading screen
      return;
    }
    if (user) navigate("/home");
    console.log(user);
  }, [user, loading]);
  return (
    <div style={{ paddingTop: "30px" }}>
      <h1 style={{ color: "#31444e" }}>Welcome</h1>
      <img src={logo} alt="logo" className="signin-logo" />
      <div className="ai">
        <h3>Powered by</h3>{" "}
        <img src={openai} style={{ height: "25px", paddingLeft: "5px" }} />
      </div>
      <div className="sign-in-form-container">
        {/* sign in using the google pop up */}

        <button className="google-button" onClick={signInWithGoogle}>
          <img
            src={google}
            className="google-logo"
            style={{ height: "25px" }}
          />
          Continue with Google
        </button>
      </div>
    </div>
  );
}

export default SignIn;