import type { ToolEvent } from "./ToolEvent";
import type { IToolEventListener } from "./ToolEventListener";

export class ToolEventEmmiter {
  private listeners: IToolEventListener[] = [];

  public registerListener(listener: IToolEventListener) {
    this.listeners.push(listener);
  }

  protected emit(event: ToolEvent) {
    for (const listener of this.listeners) {
      listener.on(event);
    }
  }
}
