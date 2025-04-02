import type { BroadcastMessage, ToolType } from "@guessthesketch/common";
import { Tool } from "../Tool";

export class Eraser extends Tool {
  toolType: ToolType = "eraser";

  init() {}

  getBroadcastMessage(param: any): BroadcastMessage {
    return {
      message: `Player used eraser tool`,
      drawing: param,
    };
  }
}
