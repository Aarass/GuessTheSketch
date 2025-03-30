// -----------------
// --- Decorator ---

import type { BroadcastMessage, ToolType } from "@guessthesketch/common";
import { Tool } from "./Tool";

// -----------------
export class TimeoutableTool extends Tool {
  toolType: ToolType;

  constructor(
    private wrappee: Tool,
    private useTime: number,
    private cooldownTime: number
  ) {
    super(wrappee.manager);

    this.toolType = this.wrappee.toolType;
  }

  init() {
    this.wrappee.init();
    setTimeout(() => {
      const manager = this.manager;
      manager.detachTool(this);

      console.log("Released timeoutable tool");

      setTimeout(() => {
        this.releaseResources();
      }, this.cooldownTime);
    }, this.useTime);
  }

  getBroadcastMessage(param: any): BroadcastMessage {
    return this.wrappee.getBroadcastMessage(param);
  }

  use(param: any) {
    return this.wrappee.use(param);
  }

  releaseResources() {
    this.wrappee.releaseResources();
    console.log("Released resources of timeoutable tool");
  }
}
