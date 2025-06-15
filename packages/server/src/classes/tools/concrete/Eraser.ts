import type { BroadcastMessage, ToolType } from "@guessthesketch/common";
import { Tool } from "../Tool";

export class Eraser extends Tool {
  static readonly toolType: ToolType = "eraser";
  readonly toolType = Eraser.toolType;

  init() {}

  getBroadcastMessage(param: any): BroadcastMessage {
    return {
      message: `Player used eraser tool`,
      drawing: param,
    };
  }
}
