import React, { useEffect, useRef, useState, useContext } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import socket from "../services/socket";
import { AuthContext } from "../context/AuthContext";
import "./CallScreen.css";

export default function CallScreen() {
  const { id } = useParams(); // other user id
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const { incoming, offer } = location.state || {};

  const peerConnection = useRef(null);
  const localStream = useRef(null);

  const [callStatus, setCallStatus] = useState(
    incoming ? "Incoming Call..." : "Calling..."
  );

  const configuration = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  /* ================= INITIAL SETUP ================= */
  useEffect(() => {
    if (!user?.id) return;

    // IMPORTANT: add user to online list
    socket.emit("addUser", user.id);

    if (!incoming) {
      startOutgoingCall();
    }

    socket.on("callAccepted", async ({ answer }) => {
      if (!peerConnection.current) return;

      await peerConnection.current.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
      setCallStatus("Connected");
    });

    socket.on("iceCandidate", async ({ candidate }) => {
      try {
        if (peerConnection.current && candidate) {
          await peerConnection.current.addIceCandidate(
            new RTCIceCandidate(candidate)
          );
        }
      } catch (err) {
        console.log("ICE Error:", err);
      }
    });

    return () => {
      socket.off("callAccepted");
      socket.off("iceCandidate");
    };
  }, []);

  /* ================= CREATE PEER ================= */
  const createPeerConnection = () => {
    const pc = new RTCPeerConnection(configuration);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("iceCandidate", {
          to: id,
          candidate: event.candidate,
        });
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "disconnected") {
        endCall();
      }
    };

    return pc;
  };

  /* ================= OUTGOING CALL ================= */
  const startOutgoingCall = async () => {
    try {
      localStream.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      peerConnection.current = createPeerConnection();

      localStream.current.getTracks().forEach((track) => {
        peerConnection.current.addTrack(track, localStream.current);
      });

      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);

      socket.emit("callUser", {
        to: id,
        from: user.id,
        offer,
      });
    } catch (err) {
      console.log("Call error:", err);
    }
  };

  /* ================= ACCEPT CALL ================= */
  const acceptCall = async () => {
    try {
      localStream.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      peerConnection.current = createPeerConnection();

      localStream.current.getTracks().forEach((track) => {
        peerConnection.current.addTrack(track, localStream.current);
      });

      await peerConnection.current.setRemoteDescription(
        new RTCSessionDescription(offer)
      );

      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);

      socket.emit("answerCall", {
        to: id,
        answer,
      });

      setCallStatus("Connected");
    } catch (err) {
      console.log("Accept error:", err);
    }
  };

  /* ================= END CALL ================= */
  const endCall = () => {
    peerConnection.current?.close();
    localStream.current?.getTracks().forEach((track) => track.stop());
    navigate(-1);
  };

  const rejectCall = () => {
    navigate(-1);
  };

  return (
    <div className="call-container">
      <div className="call-card">
        <div className="avatar">
          {user?.fullName?.charAt(0)}
        </div>

        <h2>{callStatus}</h2>

        {incoming && callStatus === "Incoming Call..." ? (
          <div className="call-actions">
            <button className="accept-btn" onClick={acceptCall}>
              ✅ Accept
            </button>
            <button className="reject-btn" onClick={rejectCall}>
              ❌ Reject
            </button>
          </div>
        ) : (
          <div className="call-actions">
            <button className="end-btn" onClick={endCall}>
              End Call
            </button>
          </div>
        )}
      </div>
    </div>
  );
}