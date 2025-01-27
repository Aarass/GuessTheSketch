import { ToolType, BroadcastMessage } from "../../types/types";
import { GlobalState } from "../states/GlobalState";
import { DecoratorTool, Tool } from "./Tool";

// -----------------
// --- Decorator ---
// -----------------
export class ConsumableTool extends Tool {
  toolType: ToolType;

  constructor(
    private wrappee: Tool,
    private maxUses: number
  ) {
    super(wrappee.roomId, wrappee.playerId);
    this.toolType = this.wrappee.toolType;
  }

  override init() {
    this.wrappee.init();
  }

  override use(param: any) {
    const roomState = GlobalState.getInstance().getRoomById(this.roomId);
    const toolState = roomState.getToolState(this.toolType);

    if (toolState.timesUsed >= this.maxUses) {
      throw `Tool consumed`;
    }

    return this.wrappee.use(param);
  }

  override getBroadcastMessage(param: any): BroadcastMessage {
    return this.wrappee.getBroadcastMessage(param);
  }
}
