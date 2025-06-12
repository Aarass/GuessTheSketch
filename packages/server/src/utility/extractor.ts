import type { Socket } from "socket.io";
import type { GuardedSocket } from "./guarding";
import { GlobalState } from "../classes/states/GlobalState";
import type { Room } from "../classes/Room";
import type { Game } from "../classes/Game";
import type { Round } from "../classes/Round";
import type { PlayerId } from "@guessthesketch/common";

export function runWithContextUpToRoom<T extends GuardedSocket<Socket>>(
  socket: T,
  handler: (playerId: PlayerId, room: Room) => void | Promise<void>,
) {
  const context = getSocketContext(socket);

  if (checkUpToRoom(context)) {
    const [playerId, room] = context;
    return handler(playerId, room);
  } else {
    logContextNotOkay(context);
  }
}

export function runWithContextUpToGame<T extends GuardedSocket<Socket>>(
  socket: T,
  handler: (playerId: PlayerId, room: Room, game: Game) => void | Promise<void>,
) {
  const context = getSocketContext(socket);

  if (checkUpToGame(context)) {
    const [playerId, room, game] = context;
    return handler(playerId, room, game);
  } else {
    logContextNotOkay(context);
  }
}

export function runWithContextUpToRound<T extends GuardedSocket<Socket>>(
  socket: T,
  handler: (
    playerId: PlayerId,
    room: Room,
    game: Game,
    round: Round,
  ) => void | Promise<void>,
) {
  const context = getSocketContext(socket);

  if (checkUpToRound(context)) {
    const [playerId, room, game, round] = context;
    return handler(playerId, room, game, round);
  } else {
    logContextNotOkay(context);
  }
}

type SocketContext = readonly [
  PlayerId,
  Room | null,
  Game | null | undefined,
  Round | null | undefined,
];

function getSocketContext(socket: GuardedSocket<Socket>): SocketContext {
  const userId = socket.request.session.userId;
  const roomId = socket.request.session.roomId;

  const state = GlobalState.getInstance();
  const room = state.getRoomById(roomId);

  const game = room?.currentGame;
  const round = game?.round;

  return [userId, room, game, round] as const;
}

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
  return !!context[1] && !!context[2];
}

function checkUpToRound(
  context: SocketContext,
): context is readonly [PlayerId, Room, Game, Round] {
  return !!context[1] && !!context[2] && !!context[3];
}

function logContextNotOkay(context: SocketContext) {
  const stack = new Error().stack;
  if (stack) {
    const lines = stack.split("\n");
    const callerLine = lines[2 + 1]?.trim() ?? "unknown";

    console.error(
      `Context is not okay \n[${callerLine}]\nContext: ${context}\n ----`,
    );
  } else {
    console.error(
      `Context is not okay. Can't read stack.Context: ${context}\n ----`,
    );
  }
}
