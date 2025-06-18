import type { RoomId } from "@guessthesketch/common";
import type { Namespace } from "socket.io";
import { authenticate } from "../middlewares/socket.io/authenticate";
import { roomMiddleware } from "../middlewares/socket.io/room";

export function guarded<T extends Namespace>(namespace: T) {
  return namespace
    .use(authenticate)
    .use(roomMiddleware)
    .on("connection", (socket) => {
      console.log(`User connected to ${namespace.name}`);

      socket.use((_, next) => {
        authenticate(socket, next);
      });

      socket.use((_, next) => {
        roomMiddleware(socket, next);
      });
    });
}

export type GuardedSocket<U> = U & {
  request: { session: { roomId: RoomId } };
};
