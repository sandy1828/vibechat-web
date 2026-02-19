import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import "./Navbar.css";

export default function Navbar() {

  const { user } = useContext(AuthContext);
  const { dark, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  return (
    <div className={`navbar ${dark ? "dark" : ""}`}>

      <div className="navbar-logo" onClick={() => navigate("/")}>
        💬 VibeChat
      </div>

      <div className="navbar-right">

        <button className="theme-btn" onClick={toggleTheme}>
          {dark ? "🌙" : "☀️"}
        </button>

        <div
          className="profile-circle"
          onClick={() => navigate("/profile")}
        >
          {user?.fullName?.charAt(0)?.toUpperCase()}
        </div>

      </div>

    </div>
  );
}
