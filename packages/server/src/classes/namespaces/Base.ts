import type { Namespace, Server, Socket } from "socket.io";
import { guarded, type GuardedSocket } from "../../utility/guarding";
import type { ExtractSocketType } from "../../utility/socketioTyping";
import type { MessagingCenter } from "../MessagingCenter";
import type { AppContext } from "../AppContext";
import type { PlayerId } from "@guessthesketch/common";
import type { Game } from "../Game";
import type { Room } from "../Room";
import type { Round } from "../Round";

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

  protected runWithContextUpToRoom<U>(
    socket: GuardedSocket<Socket>,
    handler: (playerId: PlayerId, room: Room) => U,
  ) {
    const context = this.getSocketContext(socket);

    if (checkUpToRoom(context)) {
      const [playerId, room] = context;
      return handler(playerId, room);
    } else {
      logContextNotOkay(context);
    }
  }

  protected runWithContextUpToGame<U>(
    socket: GuardedSocket<Socket>,
    handler: (playerId: PlayerId, room: Room, game: Game) => U,
  ) {
    const context = this.getSocketContext(socket);

    if (checkUpToGame(context)) {
      const [playerId, room, game] = context;
      return handler(playerId, room, game);
    } else {
      logContextNotOkay(context);
    }
  }

  protected runWithContextUpToRound<U>(
    socket: GuardedSocket<Socket>,
    handler: (playerId: PlayerId, room: Room, game: Game, round: Round) => U,
  ) {
    const context = this.getSocketContext(socket);

    if (checkUpToRound(context)) {
      const [playerId, room, game, round] = context;
      return handler(playerId, room, game, round);
    } else {
      logContextNotOkay(context);
    }
  }

  private getSocketContext(socket: GuardedSocket<Socket>): SocketContext {
    const userId = socket.request.session.userId;
    const roomId = socket.request.session.roomId;

    const room = this.ctx.roomsService.getRoomById(roomId);

    const game = room?.currentGame;
    const round = game?.currentRound;

    return [userId, room, game, round] as const;
  }
}

type SocketContext = readonly [
  PlayerId,
  Room | null,
  Game | null | undefined,
  Round | null | undefined,
];

function checkUpToRoom(
  context: SocketContext,
): context is readonly [
  PlayerId,
  Room,
  Game | null | undefined,
  Round | null | undefined,
] {
  return !!context[1];
}

function checkUpToGame(
  context: SocketContext,
): context is readonly [PlayerId, Room, Game, Round | null | undefined] {
  return !!context[1] && !!context[2] && context[2].isActive();
}

function checkUpToRound(
  context: SocketContext,
): context is readonly [PlayerId, Room, Game, Round] {
  return !!context[1] && !!context[2] && context[2].isActive() && !!context[3];
}

function logContextNotOkay(context: SocketContext) {
  const stack = new Error().stack;
  if (stack) {
    const lines = stack.split("\n");
    const callerLine = lines[2 + 1]?.trim() ?? "unknown";

    console.error(
      `Context is not okay \n[${callerLine}]\nContext: ${printContext(context)}\n ----`,
    );
  } else {
    console.error(
      `Context is not okay. Can't read stack.Context: ${printContext(context)}\n ----`,
    );
  }
}

function printContext(context: SocketContext): string {
  return `[${context[0]}, ${context[1]?.id ?? "null"}, ${context[2] ? "game ok" : "null"}, ${context[3] ? "room ok" : "null"}, ]`;
}
