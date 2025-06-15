import {
  toolTypes,
  type ToolConfigs,
  type ToolType,
} from "@guessthesketch/common";
import { Round } from "./Round";
import { ToolBuilder } from "./tools/ToolBuilder";
import type { AppContext } from "./AppContext";
import { ToolState } from "./states/ToolState";

export class RoundFactory {
  private cachedToolBuilder;
  constructor(
    private config: ToolConfigs,
    private ctx: AppContext,
  ) {
    this.cachedToolBuilder = new ToolBuilder(config);
  }

  createRound(): Round {
    const toolStates: Record<ToolType, ToolState> = {} as any;
    for (const type of toolTypes) {
      toolStates[type] = new ToolState(this.config[type]);
    }
    return new Round(this.ctx, this.cachedToolBuilder, toolStates);
  }
}
