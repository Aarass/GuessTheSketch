import { type ToolType } from "@guessthesketch/common";
import { v4 as uuid } from "uuid";
import type { AppContext } from "./AppContext";
import { GuessingManager } from "./GuessingManager";
import { ToolState } from "./states/ToolState";
import { ToolBuilder } from "./tools/ToolBuilder";
import { ToolsManager } from "./ToolsManager";
import type { RoundId } from "@guessthesketch/common/types/ids";

export class Round {
  public id: RoundId = uuid() as RoundId;

  public guessingManager;
  public toolsManager;

  constructor(
    ctx: AppContext,
    toolBuilder: ToolBuilder,
    toolStates: Record<ToolType, ToolState>,
  ) {
    this.guessingManager = new GuessingManager(ctx);
    this.toolsManager = new ToolsManager(toolBuilder, toolStates);
  }

  public async start() {
    await this.guessingManager.init();
  }
}
