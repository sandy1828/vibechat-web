import React, { useState, useRef } from "react";
import "./MessageBubble.css";

export default function MessageBubble({
  message,
  own,
  messages,
  onReply,
  onReact,
}) {
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const lastTapRef = useRef(null);

  /* ================= REPLY MESSAGE FIND ================= */

  const repliedMessage = message.replyTo
    ? messages?.find(
        (m) => String(m._id) === String(message.replyTo)
      )
    : null;

  /* ================= DRAG TO REPLY ================= */

  const handleMouseDown = (e) => {
    setIsDragging(true);
    const startX = e.clientX;

    const handleMouseMove = (moveEvent) => {
      const diff = moveEvent.clientX - startX;
      if (diff > 0) setDragX(diff);
    };

    const handleMouseUp = () => {
      if (dragX > 80) {
        onReply && onReply(message);
      }
      setDragX(0);
      setIsDragging(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  /* ================= DOUBLE CLICK ❤️ ================= */

  const handleClick = () => {
    const now = Date.now();
    if (lastTapRef.current && now - lastTapRef.current < 300) {
      onReact && onReact(message, "❤️");
    }
    lastTapRef.current = now;
  };

  /* ================= TICK STATUS ================= */

  const getTick = () => {
    if (!own) return null;
    if (message.status === "sent") return "✓";
    if (message.status === "delivered") return "✓✓";
    if (message.status === "seen")
      return <span className="seen">✓✓</span>;
  };

  /* ================= GROUP REACTIONS ================= */

  const groupedReactions =
    message.reactions?.reduce((acc, r) => {
      acc[r.emoji] = acc[r.emoji] ? acc[r.emoji] + 1 : 1;
      return acc;
    }, {}) || {};

  return (
    <div
      className={`bubble ${own ? "own" : "other"}`}
      style={{ transform: `translateX(${dragX}px)` }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      onContextMenu={(e) => {
        e.preventDefault();
        onReact && onReact(message);
      }}
    >
      {/* Reply Arrow */}
      {dragX > 40 && <div className="reply-arrow">↩</div>}

      {/* Reply Preview */}
      {repliedMessage && (
        <div className="reply-box">
          <div className="reply-sender">
            {repliedMessage.senderId === message.senderId
              ? "You"
              : "Replied"}
          </div>
          <div className="reply-text">
            {repliedMessage.message}
          </div>
        </div>
      )}

      {/* Main Message */}
      <div className="message-text">
        {message.message}
      </div>

      {/* Emoji Reactions */}
      {Object.keys(groupedReactions).length > 0 && (
        <div className="reaction-container">
          {Object.entries(groupedReactions).map(
            ([emoji, count]) => (
              <div key={emoji} className="reaction-bubble">
                {emoji} {count > 1 ? count : ""}
              </div>
            )
          )}
        </div>
      )}

      {/* Tick */}
      {own && (
        <div className="tick">
          {getTick()}
        </div>
      )}
    </div>
  );
}