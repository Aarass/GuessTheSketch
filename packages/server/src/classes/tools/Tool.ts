import type { BroadcastMessage, ToolType } from "@guessthesketch/common";
import type { Round } from "../Round";
import type { ToolState } from "../states/ToolState";

export abstract class Tool {
  abstract toolType: ToolType;

  id: symbol = Symbol();

  constructor(public manager: Round) {}

  /**
   * Init is called once a tool is attached and ready.
   */
  abstract init(): void;

  // -----------------------
  // --- Template method ---
  // -----------------------
  use(param: any) {
    const toolState = this.manager.getToolState(this.toolType);
    toolState.timesUsed++;

    return this.getBroadcastMessage(param);
  }

  canBeAssigned(): boolean {
    const toolState = this.manager.getToolState(this.toolType);
    return toolState.toolsLeft > 0;
  }

  takeResources() {
    const toolState = this.manager.getToolState(this.toolType);
    toolState.toolsLeft--;
  }

  releaseResources() {
    const toolState = this.manager.getToolState(this.toolType);
    toolState.toolsLeft++;
  }

  abstract getBroadcastMessage(param: any): BroadcastMessage;
}

// /**
//  * This class is made because of the Decorator pattern, so that it
//  * forces the Decorator class to implement all of the methods required,
//  * and hopefully reduce the chance of introducing bugs.
//  */
// export abstract class DecoratorTool {
//   id: symbol = Symbol();

//   abstract toolType: ToolType;

//   abstract canBeAssigned(): boolean;
//   abstract init(): void;
//   abstract use(param: any): any;
//   abstract releaseTool(): void;
//   abstract releaseResources(): void;
//   abstract getBroadcastMessage(param: any): BroadcastMessage;

//   constructor(public manager: ToolManager) {}
// }
