import type { RoundId } from "@guessthesketch/common/types/ids";
import { v4 as uuid } from "uuid";
import type { AppContext } from "./AppContext";
import { GuessingManager } from "./GuessingManager";
import type { ToolStatesBuilder } from "./states/tools/ToolStatesBuilder";
import { ToolBuilder } from "./tools/ToolBuilder";
import { ToolsManager } from "./ToolsManager";
import type { MessagingCenter } from "./MessagingCenter";

export class Round {
  public id: RoundId = uuid() as RoundId;

  public guessingManager;
  public toolsManager;

  constructor(
    ctx: AppContext,
    toolBuilder: ToolBuilder,
    toolStatesBuilder: ToolStatesBuilder,
    messagingCenter: MessagingCenter,
  ) {
    this.guessingManager = new GuessingManager(ctx);
    this.toolsManager = new ToolsManager(
      toolBuilder,
      toolStatesBuilder,
      messagingCenter,
    );
  }

  public async start() {
    await this.guessingManager.init();
  }
}
