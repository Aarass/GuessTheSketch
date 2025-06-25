import {
  ChatClientSocket,
  ControlsClientSocket,
  DrawingsClientSocket,
  GlobalClientSocket,
} from "@guessthesketch/common"

export const backend = "localhost:8080"
// export const backend = "178.149.108.197:8080"

export const sockets = {
  global: null as GlobalClientSocket | null,
  controls: null as ControlsClientSocket | null,
  drawings: null as DrawingsClientSocket | null,
  chat: null as ChatClientSocket | null,
}
