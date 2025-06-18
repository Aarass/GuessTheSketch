import type { ExtendedError, Socket } from "socket.io";

/**
 * Ensures that user has room id stored in his session object
 */
export function roomMiddleware(
  socket: Socket,
  next: (err?: ExtendedError) => void,
) {
  const roomId = socket.request.session.roomId;

  if (roomId) {
    void socket.join(roomId);
    next();
  } else {
    const err = new Error(`User trying to connect but no room in session data`);
    console.error(err);
    next(err);
  }
}
