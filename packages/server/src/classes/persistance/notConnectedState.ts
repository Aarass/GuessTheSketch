import type {
  RoomId,
  Drawing,
  GetRoundReplayDto,
  RoundReplay,
} from "@guessthesketch/common";
import type { PersistanceServiceState } from "./stateInterface";
import type { GameId, RoundId } from "@guessthesketch/common/types/ids";

export class NotConnectedState implements PersistanceServiceState {
  notifyNewDrawing(
    _room: RoomId,
    _game: GameId,
    _round: RoundId,
    _drawing: Drawing,
  ) {}

  getRoundReplay(_dto: GetRoundReplayDto): Promise<RoundReplay> {
    return Promise.resolve([]);
  }
}
