import axios from "axios";

const API = axios.create({
  baseURL: "https://vibechat-backend-m9a9.onrender.com/api"
});

export default API;
