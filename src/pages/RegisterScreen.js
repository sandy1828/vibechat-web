import React, { useState, useEffect, useContext } from "react";
import API from "../services/api";
import { ThemeContext } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import "./RegisterScreen.css";

export default function RegisterScreen() {
  const { dark } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secure, setSecure] = useState(true);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimate(true), 100);
  }, []);

  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      alert("All fields are required");
      return;
    }

    try {
      await API.post("/register", {
        fullName,
        email,
        password
      });

      alert("Registered Successfully ✅");
      navigate("/login");

    } catch {
      alert("User already exists or error occurred");
    }
  };

  return (
    <div className={`register-container ${dark ? "dark" : ""}`}>
      
      <div className={`register-card ${animate ? "show" : ""}`}>

        <h1 className="register-title">
          ✨ Create Account
        </h1>

        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="password-wrapper">
          <input
            type={secure ? "password" : "text"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <span
            className="eye-icon"
            onClick={() => setSecure(!secure)}
          >
            {secure ? "👁" : "🙈"}
          </span>
        </div>

        <button onClick={handleRegister}>
          Register
        </button>

        <p
          className="login-link"
          onClick={() => navigate("/login")}
        >
          Already have an account? Login
        </p>

      </div>
    </div>
  );
}
