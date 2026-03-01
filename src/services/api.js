import axios from "axios";

const API = axios.create({
  baseURL: "http://10.107.233.248:8000/api"
});

export default API;