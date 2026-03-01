import { io } from "socket.io-client";

const socket = io("http://10.107.233.248:8000", {
  transports: ["websocket"],
  autoConnect: true,
});

export default socket;