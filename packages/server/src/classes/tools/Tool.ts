import type {
  Drawing,
  DrawingId,
  ToolType,
  UnvalidatedNewDrawingWithType,
} from "@guessthesketch/common";
import { ok, type Result } from "neverthrow";
import { v4 as uuid } from "uuid";
import type { ToolsManager } from "../ToolsManager";

export abstract class Tool {
  abstract readonly toolType: ToolType;

  constructor(public manager: ToolsManager) {}

  /**
   * Init is called once a tool is attached and ready.
   */
  abstract init(): void;

  // -----------------------
  // --- Template method ---
  // -----------------------
  use(drawing: UnvalidatedNewDrawingWithType): Result<Drawing, string> {
    const toolState = this.manager.getToolState(this.toolType);
    toolState.timesUsed++;

    return ok({
      ...this.getDrawing(drawing),
      id: uuid() as DrawingId,
    });
  }

  checkIfEnoughResources(): boolean {
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

  abstract getDrawing(drawing: UnvalidatedNewDrawingWithType): Drawing;
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
