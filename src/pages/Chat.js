import React, {
  useEffect,
  useState,
  useContext,
  useRef,
  useCallback,
} from "react";
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
  const receiverUser = location.state?.receiverUser;

  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);

  /* ========== Safety ========== */
  useEffect(() => {
    if (!receiverId || !receiverUser) navigate("/");
  }, [receiverId, receiverUser, navigate]);

  /* ========== Scroll ========== */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  /* ========== Add User Online ========== */
  useEffect(() => {
    if (user?.id) socket.emit("addUser", user.id);
  }, [user]);

  /* ========== Load Messages ========== */
  const loadMessages = useCallback(async () => {
    try {
      const res = await API.get(`/message/${id}`);
      setMessages(res.data);
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.log(err);
    }
  }, [id]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  /* ========== Socket Events ========== */
 useEffect(() => {
  if (!receiverId) return;

  socket.emit("markAsSeen", {
    conversationId: id,
    viewerId: user?.id,
  });

  socket.on("getUsers", (users) => {
    setOnlineUsers(users);
  });

  socket.on("typing", ({ from }) => {
    if (from === receiverId) {
      setTyping(true);
      setTimeout(() => setTyping(false), 2000);
    }
  });

  socket.on("getMessage", (data) => {
    setMessages((prev) => {
      const exists = prev.some((msg) => msg._id === data._id);
      if (exists) return prev;
      return [...prev, data];
    });

    scrollToBottom();
  });

  // ✅ FIXED: status update listener inside useEffect
  socket.on("messageStatusUpdate", ({ messageId, status }) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg._id === messageId ? { ...msg, status } : msg
      )
    );
  });

  socket.on("messagesSeen", ({ conversationId }) => {
    if (conversationId !== id) return;

    setMessages((prev) =>
      prev.map((msg) =>
        msg.senderId === user.id
          ? { ...msg, status: "seen" }
          : msg
      )
    );
  });

  return () => {
    socket.off("getUsers");
    socket.off("typing");
    socket.off("getMessage");
    socket.off("messageStatusUpdate");
    socket.off("messagesSeen");
  };
}, [id, receiverId, user?.id]);

  /* ========== Send Message ========== */
  const sendMessage = async () => {
    if (!text.trim()) return;

    const tempId = Date.now().toString();

    const tempMessage = {
      _id: tempId,
      conversationId: id,
      senderId: user.id,
      receiverId,
      message: text,
      createdAt: new Date(),
      status: "sent",
      temp: true,
    };

    setMessages((prev) => [...prev, tempMessage]);
    scrollToBottom();
    setText("");

    try {
      const res = await API.post("/message", {
        conversationId: id,
        senderId: user.id,
        receiverId,
        message: tempMessage.message,
      });

      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === tempId ? { ...res.data, status: "delivered" } : msg,
        ),
      );

      socket.emit("sendMessage", {
        ...res.data,
        receiverId,
      });
    } catch (err) {
      console.log(err);
    }
  };

  const isOnline = onlineUsers.some((u) =>
    typeof u === "string" ? u === receiverId : u.userId === receiverId,
  );

  if (!receiverId) return null;

  return (
    <div className={`chat-container ${dark ? "dark" : ""}`}>
      {/* HEADER */}
      <div className="chat-header">
        <div className="header-left">
          <button onClick={() => navigate(-1)}>←</button>

          <div className="avatar">{receiverUser?.fullName?.charAt(0)}</div>

          <div>
            <div>{receiverUser?.fullName}</div>
            <div className="status">{isOnline ? "Online" : "Offline"}</div>
          </div>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="chat-messages">
        {messages.map((msg) => (
          <MessageBubble
            key={msg._id}
            message={msg}
            own={msg.senderId === user?.id}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {typing && <div className="typing">Typing...</div>}

      {/* INPUT */}
      <div className="chat-input">
        <input
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            socket.emit("typing", {
              to: receiverId,
              from: user?.id,
            });
          }}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type message..."
        />
        <button onClick={sendMessage}>➤</button>
      </div>
    </div>
  );
}
