import type { RoomId, Drawing } from "@guessthesketch/common";
import type { GameId, RoundId } from "@guessthesketch/common/types/ids";

export interface PersistanceServiceState {
  notifyNewDrawing(
    room: RoomId,
    game: GameId,
    round: RoundId,
    drawing: Drawing,
  ): void;
  getGameReplay(roomId: string, gameId: string): Promise<any>;
  getRoundReplay(
    roomId: string,
    gameId: string,
    roundId: string,
  ): Promise<Drawing[]>;
}
