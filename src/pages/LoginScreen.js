import React, { useState, useContext, useEffect } from "react";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import "./LoginScreen.css";

export default function LoginScreen() {
  const { login } = useContext(AuthContext);
  const { dark } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secure, setSecure] = useState(true);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimate(true), 100);
  }, []);

  const handleLogin = async () => {
    try {
      const res = await API.post("/login", { email, password });
      login(res.data.user);
    } catch {
      alert("Invalid Credentials");
    }
  };

  return (
    <div className={`login-container ${dark ? "dark" : ""}`}>
      
      <div className={`login-card ${animate ? "show" : ""}`}>
        
        <h1 className="login-title"> Welcome to the 
             VibeChat</h1>

        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="password-wrapper">
          <input
            type={secure ? "password" : "text"}
            placeholder="Password" 
            onChange={(e) => setPassword(e.target.value)}
          />

          <span
            className="eye-icon"
            onClick={() => setSecure(!secure)}
          >
            {secure ? "👁" : "🙈"}
          </span>
        </div>

        <button onClick={handleLogin}>
          Login
        </button>

        <p
          className="create-account"
          onClick={() => navigate("/register")}
        >
          Create Account
        </p>

      </div>
    </div>
  );
}
