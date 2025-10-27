import {
  toolTypes,
  type ToolConfigs,
  type ToolType,
} from "@guessthesketch/common";
import { Round } from "./Round";
import { ToolBuilder } from "./tools/ToolBuilder";
import type { AppContext } from "./AppContext";
import { createToolState, ToolState } from "./states/ToolState";

type ToolStates = Record<ToolType, ToolState>;

export class RoundFactory {
  private cachedToolBuilder;
  constructor(
    private config: ToolConfigs,
    private ctx: AppContext,
  ) {
    this.cachedToolBuilder = new ToolBuilder(config);
  }

  createRound(): Round {
    const toolStates: Partial<ToolStates> = {};
    for (const type of toolTypes) {
      toolStates[type] = createToolState(this.config[type]);
    }

    return new Round(
      this.ctx,
      this.cachedToolBuilder,
      toolStates as ToolStates,
    );
  }
}
