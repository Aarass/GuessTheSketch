import type { ToolConfigs, ToolType } from "@guessthesketch/common";
import type { ToolsManager } from "../ToolsManager";
import { ToolRegistry } from "../ToolRegistry";
import { ConsumableTool } from "./Consumable";
import { TimeoutableTool } from "./Timeoutable";
import { Tool } from "./Tool";

export class ToolBuilder {
  constructor(private toolConfigs: ToolConfigs) {}

  build(type: ToolType, manager: ToolsManager): Tool {
    let tool = ToolBuilder.getBaseTool(type, manager);

    const config = this.toolConfigs[type];

    if (config.consumable !== undefined) {
      tool = new ConsumableTool(tool, config.consumable.maxUses);
    }

    if (config.timeoutable !== undefined) {
      tool = new TimeoutableTool(
        tool,
        config.timeoutable.useTime,
        config.timeoutable.cooldownTime,
      );
    }

    return tool;
  }

  private static getBaseTool(type: ToolType, manager: ToolsManager) {
    const constructor = ToolRegistry.getInstance().getToolConstructor(type);
    return new constructor(manager);
  }
}
