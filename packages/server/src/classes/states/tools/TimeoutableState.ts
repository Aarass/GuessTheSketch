import { ToolStateComponent } from "./ToolStateComponent";

interface TimeoutableState {
  cooldowns: number[];
}

export class TimeoutableStateComponent extends ToolStateComponent {
  constructor(
    public state: TimeoutableState = {
      cooldowns: [],
    },
  ) {
    super();
  }

  set(cb: (_: TimeoutableState) => TimeoutableState): void {
    this.state = cb(this.state);
  }

  getState(): object {
    return this.state;
  }
}
