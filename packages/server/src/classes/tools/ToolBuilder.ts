import type { ToolConfigs, ToolType } from "@guessthesketch/common";
import { v4 as uuid } from "uuid";
import type { ToolStates } from "../states/tools/ToolStatesBuilder";
import type { ToolState } from "../states/ToolState";
import { ToolRegistry } from "../ToolRegistry";
import { ConsumableTool } from "./Consumable";
import { TimeoutableTool } from "./Timeoutable";
import { Tool } from "./Tool";
import type { ToolId } from "@guessthesketch/common/types/ids";

export class ToolBuilder {
  private states?: ToolStates;

  constructor(private toolConfigs: ToolConfigs) {}

  setStates(states: ToolStates) {
    this.states = states;
  }

  build(type: ToolType): Tool {
    if (this.states === undefined) throw "Internal error";
    let tool = ToolBuilder.getBaseTool(type, this.states.states[type]);

    const config = this.toolConfigs[type];
    console.log(config);

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

  private static getBaseTool(type: ToolType, state: ToolState) {
    const constructor = ToolRegistry.getInstance().getToolConstructor(type);
    return new constructor(state, uuid() as ToolId);
  }
}
