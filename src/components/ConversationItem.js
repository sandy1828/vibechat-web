import React from "react";
import "./ConversationItem.css";

export default function ConversationItem({ item, onClick }) {

  const { user, lastMessage, unreadCount } = item;

  return (
    <div className="conversation-item" onClick={onClick}>

      <div className="avatar">
        {user.fullName.charAt(0)}
      </div>

      <div className="info">
        <div className="top-row">
          <span className="name">
            {user.fullName}
          </span>
        </div>

        <p className="message">
          {lastMessage || "No messages yet"}
        </p>
      </div>

      {unreadCount > 0 && (
        <div className="badge">
          {unreadCount}
        </div>
      )}

    </div>
  );
}
