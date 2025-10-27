import { type ToolConfigs } from "@guessthesketch/common";
import type { AppContext } from "./AppContext";
import { Round } from "./Round";
import { ToolStatesBuilder } from "./states/tools/ToolStatesBuilder";
import { ToolBuilder } from "./tools/ToolBuilder";

// type ToolStates = Record<ToolType, ToolState>;

export class RoundFactory {
  private cachedToolBuilder;
  private cachedToolStatesBuilder;

  constructor(
    config: ToolConfigs,
    private ctx: AppContext,
  ) {
    this.cachedToolBuilder = new ToolBuilder(config);
    this.cachedToolStatesBuilder = new ToolStatesBuilder(config);
  }

  createRound(): Round {
    return new Round(
      this.ctx,
      this.cachedToolBuilder,
      this.cachedToolStatesBuilder,
    );
  }
}
