import type { RoomId, Drawing } from "@guessthesketch/common";
import type { PersistanceServiceState } from "./stateInterface";
import type { GameId, RoundId } from "@guessthesketch/common/types/ids";

export class NotConnectedState implements PersistanceServiceState {
  notifyNewDrawing(
    _room: RoomId,
    _game: GameId,
    _round: RoundId,
    _drawing: Drawing,
  ) {}

  public getGameReplay(_roomId: string, _gameId: string): Promise<any> {
    return Promise.resolve({});
  }

  public getRoundReplay(
    _roomId: string,
    _gameId: string,
    _roundId: string,
  ): Promise<Drawing[]> {
    return Promise.resolve([]);
  }
}
