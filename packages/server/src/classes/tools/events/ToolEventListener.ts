import type { MessagingCenter } from "../../MessagingCenter";
import type { ToolsManager } from "../../ToolsManager";
import type { Tool } from "../Tool";
import { ToolEventType, type ToolEvent } from "./ToolEvent";

export interface IToolEventListener {
  on(event: ToolEvent): void;
}

export class ToolEventListener implements IToolEventListener {
  constructor(
    private tool: WeakRef<Tool>,
    private toolsManager: ToolsManager,
    private messagingCenter: MessagingCenter,
  ) {}

  on(event: ToolEvent): void {
    const tool = this.tool.deref();
    if (tool === undefined) throw "This should not be possible";

    if (event.type === ToolEventType.ToolDeactivated) {
      const owner = this.toolsManager.getToolsOwner(tool);

      if (owner) {
        this.toolsManager.detachTool(tool);
        this.messagingCenter.notifyToolDeactivated(owner);
      } else {
        console.error("no owner when trying to detach the tool");
      }
    }
  }
}
