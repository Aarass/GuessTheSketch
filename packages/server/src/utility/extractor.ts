import type { Socket } from "socket.io";
import type { GuardedSocket } from "./guarding";
import { GlobalState } from "../classes/states/GlobalState";
import type { Room } from "../classes/Room";
import type { Game } from "../classes/Game";
import type { Round } from "../classes/Round";
import type { PlayerId } from "@guessthesketch/common";

const state = GlobalState.getInstance();

type SocketContext = readonly [
  PlayerId,
  Room | null,
  Game | null | undefined,
  Round | null | undefined,
];

export function getSocketContext(socket: GuardedSocket<Socket>): SocketContext {
  const userId = socket.request.session.userId;
  const roomId = socket.request.session.roomId;

  const room = state.getRoomById(roomId);
  const game = room?.currentGame;
  const round = game?.round;

  return [userId, room, game, round] as const;
}

export function checkUpToRoom(
  context: SocketContext
): context is readonly [
  PlayerId,
  Room,
  Game | null | undefined,
  Round | null | undefined,
] {
  return !!context[1];
}

export function checkUpToGame(
  context: SocketContext
): context is readonly [PlayerId, Room, Game, Round | null | undefined] {
  return !!context[1] && !!context[2];
}

export function checkUpToRound(
  context: SocketContext
): context is readonly [PlayerId, Room, Game, Round] {
  return !!context[1] && !!context[2] && !!context[3];
}
