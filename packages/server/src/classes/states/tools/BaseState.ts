import { ToolStateComponent } from "./ToolStateComponent";

interface BaseState {
  toolsLeft: number;
}

export class BaseStateComponent extends ToolStateComponent<BaseState> {
  constructor(state: BaseState) {
    super(state);
  }
}
