import type {
  Drawing,
  ToolType,
  UnvalidatedNewDrawingWithType,
} from "@guessthesketch/common";
import { err, type Result } from "neverthrow";
import { assert } from "../../utility/dbg";
import { ConsumableStateComponent } from "../states/tools/ConsumableState";
import { Tool } from "./Tool";

// -----------------
// --- Decorator ---
// -----------------
export class ConsumableTool extends Tool {
  toolType: ToolType;

  constructor(private wrappee: Tool) {
    super(wrappee.state, wrappee.id);

    this.toolType = this.wrappee.toolType;
  }

  override init() {
    this.wrappee.init();
  }

  override use(
    drawing: UnvalidatedNewDrawingWithType,
  ): Result<Drawing, string> {
    const comp = this.state.findComponent(ConsumableStateComponent);
    assert(comp);

    if (comp.getState().usesLeft === 0) {
      return err(`Tool consumed`);
    }

    comp.set((state) => ({
      usesLeft: state.usesLeft - 1,
    }));

    return this.wrappee.use(drawing);
  }

  override getDrawing(drawing: UnvalidatedNewDrawingWithType): Drawing {
    return this.wrappee.getDrawing(drawing);
  }
}
