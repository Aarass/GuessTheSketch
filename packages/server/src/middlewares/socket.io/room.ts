import type { Socket } from "socket.io";

/**
 * Ensures that user has room id stored in his session object
 */
export function roomMiddleware(socket: Socket, next: () => void) {
  const roomId = socket.request.session.roomId;

  if (roomId) {
    socket.join(roomId);
    next();
  } else {
    console.log("User trying to connect but no room in session data");
    socket.disconnect();
    return;
  }
}
