import React, {
  useEffect,
  useState,
  useContext
} from "react";

import { useNavigate } from "react-router-dom";
import API from "../services/api";
import socket from "../services/socket";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import ConversationItem from "../components/ConversationItem";
import "./HomeScreen.css";

export default function HomeScreen() {

  const navigate = useNavigate(); // ✅ CORRECT WAY

  const { user } = useContext(AuthContext);
  const { dark, toggleTheme } = useContext(ThemeContext);

  const [conversations, setConversations] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {

    if (!user) return;

    socket.emit("addUser", user.id);

    socket.on("getMessage", fetchConversations);
    socket.on("messageStatusUpdate", fetchConversations);

    return () => {
      socket.off("getMessage");
      socket.off("messageStatusUpdate");
    };

  }, [user]);

  const fetchConversations = async () => {
    try {
      const res = await API.get(`/conversations/${user.id}`);
      setConversations(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const deleteConversation = async (id) => {
    try {
      await API.delete(`/conversation/${id}`);
      fetchConversations();
    } catch (err) {
      console.log(err);
    }
  };

  const openChat = (conversationId, receiverId) => {
    navigate(`/chat/${conversationId}`, {
      state: { receiverId }
    });
  };

  const filtered = conversations.filter((conv) =>
    conv.user.fullName
      .toLowerCase()
      .includes(search.toLowerCase())
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
        {filtered.map((item) => (
          <div key={item.conversationId} className="conversation-card">

            <ConversationItem
              item={item}
              onClick={() =>
                openChat(
                  item.conversationId,
                  item.user.receiverId
                )
              }
            />

            <button
              className="delete-btn"
              onClick={() =>
                deleteConversation(item.conversationId)
              }
            >
              Delete
            </button>

          </div>
        ))}
      </div>

    </div>
  );
}
