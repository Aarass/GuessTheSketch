import type { RoundId } from "@guessthesketch/common/types/ids";
import { v4 as uuid } from "uuid";
import type { AppContext } from "./AppContext";
import { GuessingManager } from "./GuessingManager";
import type { ToolStatesBuilder } from "./states/tools/ToolStatesBuilder";
import { ToolBuilder } from "./tools/ToolBuilder";
import { ToolsManager } from "./ToolsManager";

export class Round {
  public id: RoundId = uuid() as RoundId;

  public guessingManager;
  public toolsManager;

  constructor(
    ctx: AppContext,
    public toolBuilder: ToolBuilder,
  ) {
    this.guessingManager = new GuessingManager(ctx);
    this.toolsManager = new ToolsManager();
  }

  public async start() {
    await this.guessingManager.init();
  }
}
