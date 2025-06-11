import type { ChatNamespace as ChatNamespaceType } from "@guessthesketch/common";
import { NamespaceClass } from "./Base";
import type { ExtractSocketType } from "../../utility/socketioTyping";
import type { GuardedSocket } from "../../utility/guarding";

export class ChatNamespace extends NamespaceClass<ChatNamespaceType> {
  async registerHandlers(
    socket: GuardedSocket<ExtractSocketType<ChatNamespaceType>>,
  ) {
    socket.join(socket.request.session.roomId);
  }
}
