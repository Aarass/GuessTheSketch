import type { Socket } from "socket.io";

export function authenticate(socket: Socket, next: () => void) {
  const session = socket.request.session;
  if (session && session.userId) {
    next();
  } else {
    socket.disconnect();
  }
}
