import type {
  Drawing,
  ToolType,
  UnvalidatedNewDrawingWithType,
} from "@guessthesketch/common";
import { err, type Result } from "neverthrow";
import { Tool } from "./Tool";

// -----------------
// --- Decorator ---
// -----------------
export class ConsumableTool extends Tool {
  toolType: ToolType;

  constructor(
    private wrappee: Tool,
    private maxUses: number,
  ) {
    super(wrappee.manager);

    this.toolType = this.wrappee.toolType;
  }

  override init() {
    this.wrappee.init();
  }

  override use(
    drawing: UnvalidatedNewDrawingWithType,
  ): Result<Drawing, string> {
    const toolState = this.manager.getToolState(this.toolType);

    if (toolState.timesUsed >= this.maxUses) {
      return err(`Tool consumed`);
    }

    return this.wrappee.use(drawing);
  }

  override getDrawing(drawing: UnvalidatedNewDrawingWithType): Drawing {
    return this.wrappee.getDrawing(drawing);
  }
}
