import type { DrawingsNamespace, DrawingsSocket } from "@guessthesketch/common";
import type { GuardedSocket } from "../../utility/guarding";
import type { MyNamespaces } from "../..";

export function registerHandlersForDrawings(
  io: MyNamespaces,
  socket: GuardedSocket<DrawingsSocket>
) {
  socket.join(socket.request.session.roomId);
}
