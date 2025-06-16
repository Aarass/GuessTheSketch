import type {
  Drawing,
  DrawingsNamespace as DrawingsNamespaceType,
  RoomId,
} from "@guessthesketch/common";
import type { GuardedSocket } from "../../utility/guarding";
import type { ExtractSocketType } from "../../utility/socketioTyping";
import { NamespaceClass } from "./Base";

export class DrawingsNamespace extends NamespaceClass<DrawingsNamespaceType> {
  registerHandlers(
    _socket: GuardedSocket<ExtractSocketType<DrawingsNamespaceType>>,
  ) {}

  public notifyNewDrawing(room: RoomId, drawing: Drawing) {
    this.namespace.to(room).emit("drawing", drawing);
  }
}
