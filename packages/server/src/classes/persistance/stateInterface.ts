import type {
  Drawing,
  GetRoundReplayDto,
  RoomId,
  RoundReplay,
} from "@guessthesketch/common";
import type { GameId, RoundId } from "@guessthesketch/common/types/ids";

export interface PersistanceServiceState {
  notifyNewDrawing(
    room: RoomId,
    game: GameId,
    round: RoundId,
    drawing: Drawing,
  ): void;
  getRoundReplay(dto: GetRoundReplayDto): Promise<RoundReplay>;
}
