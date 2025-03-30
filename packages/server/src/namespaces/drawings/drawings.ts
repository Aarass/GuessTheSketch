import type { DrawingsSocket } from "@guessthesketch/common";
import type { GuardedSocket } from "../../utility/guarding";
import type { MyNamespaces } from "../..";

export function registerHandlersForDrawings(
  namespaces: MyNamespaces,
  socket: GuardedSocket<DrawingsSocket>
) {
  socket.join(socket.request.session.roomId);
}
