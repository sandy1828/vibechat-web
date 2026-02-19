import { io } from "socket.io-client";

const socket = io("https://vibechat-backend-m9a9.onrender.com/api");

export default socket;
