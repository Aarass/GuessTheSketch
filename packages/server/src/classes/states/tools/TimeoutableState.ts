import type { ToolId } from "@guessthesketch/common/types/ids";
import { ToolStateComponent } from "./ToolStateComponent";

interface TimeoutableState {
  timers: {
    toolId: ToolId;
    leftUseTime: number;
    leftCooldownTime: number;
  }[];
}

export class TimeoutableStateComponent extends ToolStateComponent<TimeoutableState> {
  constructor(state: TimeoutableState = { timers: [] }) {
    super(state);
  }

  public override getUserReadyState(): object {
    throw "Not implemented yet";
  }
}
