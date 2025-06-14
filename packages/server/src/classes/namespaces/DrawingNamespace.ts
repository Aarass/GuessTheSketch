import type {
  BroadcastMessage,
  DrawingsNamespace as DrawingsNamespaceType,
  RoomId,
} from "@guessthesketch/common";
import type { GuardedSocket } from "../../utility/guarding";
import type { ExtractSocketType } from "../../utility/socketioTyping";
import { NamespaceClass } from "./Base";

export class DrawingsNamespace extends NamespaceClass<DrawingsNamespaceType> {
  registerHandlers(
    socket: GuardedSocket<ExtractSocketType<DrawingsNamespaceType>>,
  ) {}

  public notifyNewDrawing(room: RoomId, bm: BroadcastMessage) {
    this.namespace.to(room).emit("drawing", bm);
  }
}
