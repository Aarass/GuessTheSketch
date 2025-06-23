import type { Drawing } from "../types/drawings";
import type { GameId, RoomId, RoundId } from "../types/ids";

export interface QueuedDrawing {
  roomId: RoomId;
  gameId: GameId;
  roundId: RoundId;
  drawing: Drawing;
}

export type StringifiedDrawing = string & { __brand: "StringifiedDrawing" };
export interface PersistedDrawing {
  roomId: RoomId;
  gameId: GameId;
  roundId: RoundId;
  drawing: StringifiedDrawing;
}

export interface GetRoundReplayDto {
  roomId: RoomId;
  gameId: GameId;
  roundId: RoundId;
}

export interface GetGameReplayDto {
  roomId: RoomId;
  gameId: GameId;
}

export type RoundReplay = Drawing[];
export type GameReplay = RoundReplay[];
