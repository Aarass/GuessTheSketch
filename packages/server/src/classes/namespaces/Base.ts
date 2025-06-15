import type { Namespace, Server } from "socket.io";
import { guarded, type GuardedSocket } from "../../utility/guarding";
import type { ExtractSocketType } from "../../utility/socketioTyping";
import type { MessagingCenter } from "../MessagingCenter";
import type { AppContext } from "../AppContext";

// type ReplaceReturnType<T extends (...a: any) => any, TNewReturn> = (
//   ...a: Parameters<T>
// ) => TNewReturn;

export abstract class NamespaceClass<T extends Namespace> {
  protected namespace;
  // : {
  //   to: ReplaceReturnType<
  //     T["to"],
  //     {
  //       emit: T["emit"];
  //     }
  //   >;
  // };

  constructor(
    name: string,
    io: Server,
    protected messagingCenter: MessagingCenter,
    protected ctx: AppContext,
  ) {
    const namespace = guarded(io.of(`/${name}`) as T);
    namespace.on("connection", (socket) => {
      this.registerHandlers(socket as GuardedSocket<typeof socket>);
    });

    this.namespace = namespace;
  }

  protected abstract registerHandlers(
    socket: GuardedSocket<ExtractSocketType<T>>,
  ): void;
}
