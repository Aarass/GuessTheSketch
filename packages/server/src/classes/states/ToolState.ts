import type { ToolConfig } from "@guessthesketch/common";

export class ToolState {
  public timesUsed: number;
  public toolsLeft: number;

  constructor(config: ToolConfig) {
    this.timesUsed = 0;
    this.toolsLeft = config.count;
  }
}
