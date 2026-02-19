import React, { useEffect, useState, useContext, useRef, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import API from "../services/api";
import socket from "../services/socket";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import MessageBubble from "../components/MessageBubble";
import "./ChatScreen.css";

export default function ChatScreen() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { user } = useContext(AuthContext);
  const { dark } = useContext(ThemeContext);

  const receiverId = location.state?.receiverId;

  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [receiverUser, setReceiverUser] = useState(null);

  /* ================= Redirect if no receiver ================= */
  useEffect(() => {
    if (!receiverId) {
      navigate("/");
    }
  }, [receiverId, navigate]);

  /* ================= Fetch Receiver User ================= */
  useEffect(() => {
    if (!receiverId) return;

    const fetchUser = async () => {
      try {
        const res = await API.get(`/user/${receiverId}`);
        setReceiverUser(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchUser();
  }, [receiverId]);

  const isOnline = onlineUsers.some(
    (u) => u.userId === receiverId
  );

  /* ================= Load Messages + Socket ================= */
  useEffect(() => {
    if (!receiverId) return;

    loadMessages();

    socket.emit("markAsSeen", {
      conversationId: id,
      viewerId: user?.id,
    });

    socket.on("getUsers", setOnlineUsers);

    socket.on("typing", ({ from }) => {
      if (from === receiverId) {
        setTyping(true);
        setTimeout(() => setTyping(false), 2000);
      }
    });

    socket.on("getMessage", (data) => {
      setMessages((prev) => [...prev, data]);
      scrollToBottom();
    });

    return () => {
      socket.off("getUsers");
      socket.off("typing");
      socket.off("getMessage");
    };

  }, [id, receiverId, user?.id, loadMessages]);

  /* ================= Scroll ================= */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  /* ================= Load Messages ================= */
  const loadMessages = useCallback(async () => {
  try {
    const res = await API.get(`/message/${id}`);
    setMessages(res.data);
    setTimeout(scrollToBottom, 100);
  } catch (err) {
    console.log(err);
  }
}, [id]);


  /* ================= Send Message ================= */
  const sendMessage = async () => {
    if (!text.trim() || !receiverId) return;

    try {
      const res = await API.post("/message", {
        conversationId: id,
        senderId: user.id,
        receiverId: receiverId,
        message: text,
      });

      socket.emit("sendMessage", {
        messageId: res.data.messageId,
        conversationId: id,
        senderId: user.id,
        receiverId: receiverId,
        message: text,
      });

      setText("");
    } catch (err) {
      console.log(err);
    }
  };

  if (!receiverId) return null;

  return (
    <div className={`chat-container ${dark ? "dark" : ""}`}>

      {/* ================= HEADER ================= */}
      <div className="chat-header">
        <div className="header-left">
          <button
            className="back-btn"
            onClick={() => navigate(-1)}
          >
            ←
          </button>

          <div className="user-info">
            <div
              className="online-dot"
              style={{
                backgroundColor: isOnline ? "#25D366" : "gray",
              }}
            />

            <div>
              <div className="user-name">
                {receiverUser?.fullName || "Loading..."}
              </div>

              <div className="user-status">
                {isOnline ? "Online" : "Last seen recently"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MESSAGES ================= */}
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <MessageBubble
            key={index}
            message={msg}
            own={msg.senderId === user?.id}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* ================= Typing ================= */}
      {typing && (
        <div className="typing-text">
          Typing...
        </div>
      )}

      {/* ================= INPUT ================= */}
      <div className="chat-input">
        <input
          type="text"
          value={text}
          placeholder="Type a message..."
          onChange={(e) => {
            setText(e.target.value);

            socket.emit("typing", {
              to: receiverId,
              from: user?.id,
            });
          }}
        />

        <button onClick={sendMessage}>
          ➤
        </button>
      </div>

    </div>
  );
}
