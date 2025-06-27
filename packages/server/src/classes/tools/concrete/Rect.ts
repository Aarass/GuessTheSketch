import type {
  Drawing,
  ToolType,
  UnvalidatedNewDrawingWithType,
} from "@guessthesketch/common";
import { Tool } from "../Tool";

export class Rect extends Tool {
  static readonly toolType: ToolType = "rect";
  readonly toolType = Rect.toolType;

  override init() {}

  override getDrawing(drawing: UnvalidatedNewDrawingWithType): Drawing {
    return {
      ...drawing,
    } as Drawing;
  }
}
