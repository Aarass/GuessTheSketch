import type {
  RoomId,
  Drawing,
  GetRoundReplayDto,
} from "@guessthesketch/common";
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

  public async init() {
    const result = await getChannel();

    if (result.isOk()) {
      this.state = await ConnectedState.create(result.value);
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

  public getRoundReplay(roomId: RoomId, gameId: GameId, roundId: RoundId) {
    const dto: GetRoundReplayDto = {
      roomId,
      gameId,
      roundId,
    };
    return this.state.getRoundReplay(dto);
  }
}
