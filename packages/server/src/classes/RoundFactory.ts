import { type RoomId, type ToolConfigs } from "@guessthesketch/common";
import type { AppContext } from "./AppContext";
import type { MessagingCenter } from "./MessagingCenter";
import { Round } from "./Round";
import { ToolStatesBuilder } from "./states/tools/ToolStatesBuilder";
import { ToolBuilder } from "./tools/ToolBuilder";

export class RoundFactory {
  private cachedToolBuilder;
  private cachedToolStatesBuilder;

  constructor(
    config: ToolConfigs,
    private ctx: AppContext,
    private messagingCenter: MessagingCenter,
  ) {
    this.cachedToolBuilder = new ToolBuilder(config);
    this.cachedToolStatesBuilder = new ToolStatesBuilder(config);
  }

  createRound(roomId: RoomId): Round {
    return new Round(
      roomId,
      this.ctx,
      this.cachedToolBuilder,
      this.cachedToolStatesBuilder,
      this.messagingCenter,
    );
  }
}
