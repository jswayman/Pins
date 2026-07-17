import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.PROD
    ? "https://gamegrid-production-3067.up.railway.app"
    : "http://localhost:3001");

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, { transports: ["websocket", "polling"] });
  }
  return socket;
}
