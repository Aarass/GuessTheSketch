import { ToolStateComponent } from "./ToolStateComponent";

interface ConsumableState {
  timesUsed: number;
}

export class ConsumableStateComponent extends ToolStateComponent {
  constructor(
    public state: ConsumableState = {
      timesUsed: 0,
    },
  ) {
    super();
  }

  set(cb: (_: ConsumableState) => ConsumableState): void {
    this.state = cb(this.state);
  }

  getState(): object {
    return this.state;
  }
}
