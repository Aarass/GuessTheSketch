import { ToolType, BroadcastMessage } from "../../types/types";
import { GlobalState } from "../states/GlobalState";
import { Tool } from "./Tool";

// -----------------
// --- Decorator ---
// -----------------
export class TimeoutableTool extends Tool {
  toolType: ToolType;

  constructor(
    private wrappee: Tool,
    private useTime: number,
    private cooldownTime: number
  ) {
    super(wrappee.roomId, wrappee.playerId);
    this.toolType = this.wrappee.toolType;
  }

  init() {
    this.wrappee.init();
    setTimeout(() => {
      this.releaseTool();
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

  deselect(): void {
    this.releaseTool();
  }
}
