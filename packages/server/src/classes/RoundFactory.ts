import { type RoomId, type ToolConfigs } from "@guessthesketch/common";
import type { AppContext } from "./AppContext";
import type { MessagingCenter } from "./MessagingCenter";
import { Round } from "./Round";
import { ToolStatesBuilder } from "./states/tools/ToolStatesBuilder";
import { ToolBuilder } from "./tools/ToolBuilder";

export class RoundFactory {
  private statesBuilder: ToolStatesBuilder;

  constructor(
    private config: ToolConfigs,
    private ctx: AppContext,
  ) {
    this.statesBuilder = new ToolStatesBuilder(this.config);
  }

  public async createRound(
    roomId: RoomId,
    messagingCenter: MessagingCenter,
  ): Promise<Round> {
    const states = this.statesBuilder.build();

    states.setupNotifications(roomId, messagingCenter);

    const toolBuilder = new ToolBuilder(this.config, states);
    return await Round.create(this.ctx, toolBuilder);
  }
}
