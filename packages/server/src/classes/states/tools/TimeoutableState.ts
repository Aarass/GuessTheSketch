import { ToolStateComponent } from "./ToolStateComponent";

interface TimeoutableState {
  cooldowns: number[];
}

export class TimeoutableStateComponent extends ToolStateComponent<TimeoutableState> {
  constructor(
    state: TimeoutableState = {
      cooldowns: [],
    },
  ) {
    super(state);
  }
}
