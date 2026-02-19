import React from "react";
import "./MessageBubble.css";

export default function MessageBubble({ message, own }) {

  const getTick = () => {
    if (!own) return null;

    if (message.status === "sent") return "✓";
    if (message.status === "delivered") return "✓✓";
    if (message.status === "seen")
      return <span className="seen">✓✓</span>;
  };

  return (
    <div className={`bubble-container ${own ? "own" : "other"}`}>
      
      <div className="bubble">
        <span className="message-text">
          {message.message}
        </span>

        {own && (
          <span className="tick">
            {getTick()}
          </span>
        )}
      </div>

    </div>
  );
}
