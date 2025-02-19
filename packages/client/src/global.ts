import { Socket } from "socket.io-client"

export const backend = "localhost:8080"

export const sockets = {
  global: null as Socket | null,
  controls: null as Socket | null,
  drawings: null as Socket | null,
  chat: null as Socket | null,
}
