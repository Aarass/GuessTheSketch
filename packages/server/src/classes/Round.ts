import type { RoundId } from "@guessthesketch/common/types/ids";
import { v4 as uuid } from "uuid";
import type { AppContext } from "./AppContext";
import { GuessingManager } from "./GuessingManager";
import { ToolBuilder } from "./tools/ToolBuilder";
import { ToolsManager } from "./ToolsManager";

export class Round {
  public readonly id: RoundId = uuid() as RoundId;

  public readonly guessingManager;
  public readonly toolsManager;
  public readonly toolBuilder;

  constructor(ctx: AppContext, toolBuilder: ToolBuilder) {
    this.guessingManager = new GuessingManager(ctx);
    this.toolsManager = new ToolsManager();
    this.toolBuilder = toolBuilder;
  }

  public async start() {
    await this.guessingManager.init();
  }
}
