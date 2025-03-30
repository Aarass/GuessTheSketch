import type { ToolType, BroadcastMessage } from "@guessthesketch/common";
import { Tool } from "./Tool";

// -----------------
// --- Decorator ---
// -----------------
export class ConsumableTool extends Tool {
  toolType: ToolType;

  constructor(
    private wrappee: Tool,
    private maxUses: number
  ) {
    super(wrappee.manager);

    this.toolType = this.wrappee.toolType;
  }

  override init() {
    this.wrappee.init();
  }

  override use(param: any) {
    const toolState = this.manager.getToolState(this.toolType);

    if (toolState.timesUsed >= this.maxUses) {
      throw `Tool consumed`;
    }

    return this.wrappee.use(param);
  }

  override getBroadcastMessage(param: any): BroadcastMessage {
    return this.wrappee.getBroadcastMessage(param);
  }
}
