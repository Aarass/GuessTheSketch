import type {
  Drawing,
  ToolType,
  UnvalidatedNewDrawingWithType,
} from "@guessthesketch/common";
import { err, type Result } from "neverthrow";
import { Tool } from "./Tool";
import { assert } from "../../utility/dbg";
import { ConsumableStateComponent } from "../states/tools/ConsumableState";

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
    const comp = toolState.findComponent(ConsumableStateComponent);

    assert(comp);

    if (comp.state.timesUsed >= this.maxUses) {
      return err(`Tool consumed`);
    }

    comp.set((state) => ({
      timesUsed: state.timesUsed + 1,
    }));

    return this.wrappee.use(drawing);
  }

  override getDrawing(drawing: UnvalidatedNewDrawingWithType): Drawing {
    return this.wrappee.getDrawing(drawing);
  }
}
