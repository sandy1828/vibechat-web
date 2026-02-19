import React, { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { AuthContext } from "../context/AuthContext";
import "./ProfileScreen.css";

export default function ProfileScreen() {
  const { user, logout } = useContext(AuthContext);
  const { dark } = useContext(ThemeContext);

  return (
    <div className={`profile-container ${dark ? "dark" : ""}`}>

      {/* Avatar */}
      <div className="avatar-wrapper">
        <div className={`avatar ${dark ? "glow" : ""}`}>
          {user?.fullName?.charAt(0)}
        </div>
      </div>

      {/* Full Name Card */}
      <div className="profile-card">
        <p className="label">Full Name</p>
        <h3 className="value">{user?.fullName}</h3>
      </div>

      {/* Email Card */}
      <div className="profile-card">
        <p className="label">Email</p>
        <h3 className="value">{user?.email}</h3>
      </div>

      {/* Logout */}
      <button className="logout-btn" onClick={logout}>
        🚪 Logout
      </button>

    </div>
  );
}
