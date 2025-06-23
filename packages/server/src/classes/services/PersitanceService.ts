import type { RoomId, Drawing } from "@guessthesketch/common";
import { getChannel } from "../../drivers/rabbit";
import { ConnectedState } from "../persistance/connectedState";
import { NotConnectedState } from "../persistance/notConnectedState";
import type { PersistanceServiceState } from "../persistance/stateInterface";
import type { GameId, RoundId } from "@guessthesketch/common/types/ids";

export class PersistanceService {
  // -------------
  // --- State ---
  // -------------
  private state: PersistanceServiceState = new NotConnectedState();

  constructor() {
    void this.init();
  }

  async init() {
    const result = await getChannel();

    if (result.isOk()) {
      const channel = result.value;

      const newState = new ConnectedState(channel);
      await newState.init();

      this.state = newState;
    }
  }

  public notifyNewDrawing(
    room: RoomId,
    game: GameId,
    round: RoundId,
    drawing: Drawing,
  ) {
    this.state.notifyNewDrawing(room, game, round, drawing);
  }

  public getGameReplay(roomId: string, gameId: string) {
    return this.state.getGameReplay(roomId, gameId);
  }
  public getRoundReplay(roomId: string, gameId: string, roundId: string) {
    return this.state.getRoundReplay(roomId, gameId, roundId);
  }
}
