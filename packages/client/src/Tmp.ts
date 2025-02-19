import { io, Socket } from "socket.io-client"

export const sockets = {
  main: null as Socket | null,
  controlsSocket: null as Socket | null,
  drawingsSocket: null as Socket | null,
  chatSocket: null as Socket | null,
}

// headers: new Headers({ "content-type": "application/json" }),
// body: JSON.stringify({
//   pen: {
//     count: 2,
//   },
//   global: {},
// }),
