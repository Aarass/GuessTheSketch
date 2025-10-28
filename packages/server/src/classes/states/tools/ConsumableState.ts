import { ToolStateComponent } from "./ToolStateComponent";

interface ConsumableState {
  timesUsed: number;
}

export class ConsumableStateComponent extends ToolStateComponent<ConsumableState> {
  constructor(
    state: ConsumableState = {
      timesUsed: 0,
    },
  ) {
    super(state);
  }
}
