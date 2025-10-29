import { ToolStateComponent } from "./ToolStateComponent";

interface ConsumableState {
  usesLeft: number;
}

export class ConsumableStateComponent extends ToolStateComponent<ConsumableState> {
  constructor(state: ConsumableState) {
    super(state);
  }
}
