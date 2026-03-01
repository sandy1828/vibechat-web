import React, { useEffect, useState, useContext, useCallback } from "react";

import { useNavigate } from "react-router-dom";
import API from "../services/api";
import socket from "../services/socket";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import ConversationItem from "../components/ConversationItem";
import "./HomeScreen.css";

export default function HomeScreen() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { dark } = useContext(ThemeContext);

  const [conversations, setConversations] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [search, setSearch] = useState("");

  /* ================= FETCH CONVERSATIONS ================= */

  const fetchConversations = useCallback(async () => {
    if (!user?.id) return;

    try {
      const res = await API.get(`/conversations/${user.id}`);

      // ✅ Always ensure array
      const data = Array.isArray(res.data) ? res.data : [];

      // ✅ Sort latest first
      const sorted = data.sort(
        (a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0),
      );

      setConversations(sorted);
    } catch (err) {
      console.log("Fetch Error:", err);
      setConversations([]);
    }
  }, [user]);

  /* ================= INITIAL LOAD ================= */

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);



  // call

  useEffect(() => {
  if (!user?.id) return;

  socket.emit("addUser", user.id);

  socket.on("incomingCall", ({ from, offer }) => {
    navigate(`/call/${from}`, {
      state: {
        incoming: true,
        offer
      }
    });
  });

  return () => {
    socket.off("incomingCall");
  };
}, [user]);


  /* ================= SOCKET ================= */

  useEffect(() => {
    if (!user?.id) return;

    socket.emit("addUser", user.id);

    socket.on("getUsers", setOnlineUsers);
    socket.on("getMessage", fetchConversations);
    socket.on("messageStatusUpdate", fetchConversations);

    return () => {
      socket.off("getUsers");
      socket.off("getMessage");
      socket.off("messageStatusUpdate");
    };
  }, [user, fetchConversations]);

  /* ================= DELETE ================= */

  const deleteConversation = async (id) => {
    try {
      await API.delete(`/conversation/${id}`);
      fetchConversations();
    } catch (err) {
      console.log(err);
    }
  };

  /* ================= OPEN CHAT ================= */
  /* ================= OPEN CHAT ================= */
  const openChat = (conversationId, chatUser) => {
    navigate(`/chat/${conversationId}`, {
      state: {
        receiverId: chatUser.receiverId,
        receiverUser: chatUser,
      },
    });
  };

  /* ================= SEARCH ================= */

  const filtered = conversations.filter((conv) =>
    conv?.user?.fullName?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className={`home-container ${dark ? "dark" : ""}`}>
      {/* HEADER */}
      <div className="home-header">
        <h1>Chats</h1>
      </div>

      {/* SEARCH */}
      <div className="search-box">
        <input
          type="text"
          placeholder="Search conversations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* LIST */}
      <div className="conversation-list">
        {filtered.length === 0 && (
          <p className="empty-text">No Conversations Found</p>
        )}

        {filtered.map((item) => {
          if (!item?.user) return null;

          const isOnline = onlineUsers.some(
            (u) => u.userId === item.user.receiverId,
          );

          return (
            <div key={item.conversationId} className="conversation-card">
              <ConversationItem
                item={item}
                isOnline={isOnline}
                onClick={() => openChat(item.conversationId, item.user)}
              />

              <button
                className="delete-btn"
                onClick={() => deleteConversation(item.conversationId)}
              >
                Delete
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
