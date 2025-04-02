import type {
  PlayerId,
  RoomId,
  ToolType,
  ToolConfig,
} from "@guessthesketch/common";
import { Pen } from "./concrete/Pen";
import { ConsumableTool } from "./Consumable";
import { TimeoutableTool } from "./Timeoutable";
import type { Tool } from "./Tool";
import type { Round } from "../Round";
import { Eraser } from "./concrete/Eraser";

export class ToolBuilder {
  private static map: {
    [key in ToolType]: new (round: Round) => Tool;
  } = {
    pen: Pen,
    eraser: Eraser,
  };

  static build(type: ToolType, round: Round, config: ToolConfig): Tool {
    let tool = this.getBaseTool(type, round);

    if (config.consumable !== undefined) {
      tool = new ConsumableTool(tool, config.consumable.maxUses);
    }

    if (config.timeoutable !== undefined) {
      tool = new TimeoutableTool(
        tool,
        config.timeoutable.useTime,
        config.timeoutable.cooldownTime
      );
    }

    return tool;
  }

  private static getBaseTool(type: ToolType, round: Round) {
    return new this.map[type](round);
  }
}
