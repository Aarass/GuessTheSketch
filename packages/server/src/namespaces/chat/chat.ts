import type { ChatSocket } from "@guessthesketch/common";
import type { GuardedSocket } from "../../utility/guarding";
import type { MyNamespaces } from "../..";

export function registerHandlersForChat(
  namespaces: MyNamespaces,
  socket: GuardedSocket<ChatSocket>
) {
  socket.join(socket.request.session.roomId);
}
