import type { BroadcastMessage, ToolType } from "../../../types/types";
import { Tool } from "../Tool";

export class Pen extends Tool {
  toolType: ToolType = "pen";

  init() {}

  getBroadcastMessage(param: any): BroadcastMessage {
    // TODO ovo ne radi zbog dekoratora
    // tool map cuva samo spoljni
    // const playerHoldingThisTool = GlobalState.getInstance()
    //   .getRoomStateByTool(this)
    //   .toolMap.getPlayerId(this);

    return {
      message: `Player used pen tool`,
      drawing: param,
    };
  }
}
