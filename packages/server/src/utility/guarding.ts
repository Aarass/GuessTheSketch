import type { Namespace, Socket } from "socket.io";
import { authenticate as socketAuth } from "../middlewares/socket.io/authenticate";
import { roomMiddleware } from "../middlewares/socket.io/room";
import type { RoomId } from "@guessthesketch/common";

export function guarded<T extends Namespace>(namespace: T) {
  return namespace
    .use(socketAuth)
    .use(roomMiddleware)
    .on("connection", (socket) => {
      console.log(`User connected to ${namespace.name}`);

      socket.use((_, next) => {
        socketAuth(socket, next);
      });

      socket.use((_, next) => {
        roomMiddleware(socket, next);
      });
    });
}

export type GuardedSocket<U extends Socket> = U & {
  request: { session: { roomId: RoomId } };
};
