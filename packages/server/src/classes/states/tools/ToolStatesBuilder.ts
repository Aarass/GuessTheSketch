import {
  toolTypes,
  type ToolConfigs,
  type ToolType,
} from "@guessthesketch/common";
import { ToolState } from "../ToolState";
import { ConsumableStateComponent } from "./ConsumableState";
import { TimeoutableStateComponent } from "./TimeoutableState";

type ToolStates = Record<ToolType, ToolState>;

export class ToolStatesBuilder {
  constructor(private config: ToolConfigs) {}

  build(): ToolStates {
    const toolStates: Partial<ToolStates> = {};

    for (const type of toolTypes) {
      const components = [];
      const config = this.config[type];

      if (config.consumable) {
        components.push(new ConsumableStateComponent());
      }

      if (config.timeoutable) {
        components.push(new TimeoutableStateComponent());
      }

      toolStates[type] = new ToolState(config.count, components);
    }

    return toolStates as ToolStates;
  }
}
