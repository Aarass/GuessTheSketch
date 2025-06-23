import type { Drawing } from "../types/drawings";
import type { GameId, RoomId, RoundId } from "../types/ids";

export interface QueuedDrawing {
  roomId: RoomId;
  gameId: GameId;
  roundId: RoundId;
  drawing: Drawing;
}

export type RoundReplay = Drawing[];
export type GameReplay = RoundReplay[];
