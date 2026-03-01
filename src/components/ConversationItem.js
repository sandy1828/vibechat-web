import React from "react";
import "./ConversationItem.css";

export default function ConversationItem({
  item,
  isOnline,
  onClick,
}) {
  const lastMsg =
    typeof item?.lastMessage === "object"
      ? item?.lastMessage?.message
      : item?.lastMessage;

  const formattedTime = item?.updatedAt
    ? new Date(item.updatedAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div className="conversation-item" onClick={onClick}>
      {/* Avatar */}
      <div className="avatar-wrapper">
        <div className="avatar">
          {item?.user?.fullName?.charAt(0) || "?"}
        </div>
        {isOnline && <span className="online-dot" />}
      </div>

      {/* Info */}
      <div className="info">
        <div className="top-row">
          <span className="name">
            {item?.user?.fullName || "Unknown"}
          </span>

          <span className="time">
            {formattedTime}
          </span>
        </div>

        <p
          className={`message ${
            item?.unreadCount > 0 ? "unread" : ""
          }`}
        >
          {lastMsg || "No messages yet"}
        </p>
      </div>

      {/* Unread Badge */}
      {item?.unreadCount > 0 && (
        <div className="badge">
          {item.unreadCount}
        </div>
      )}
    </div>
  );
}