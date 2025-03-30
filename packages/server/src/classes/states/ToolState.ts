import type { ToolConfig } from "@guessthesketch/common";

export class ToolState {
  public timesUsed: number = 0;
  public toolsLeft: number;

  constructor(config: ToolConfig) {
    this.toolsLeft = config.count;
  }
}
