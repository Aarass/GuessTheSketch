import type {
  Drawing,
  DrawingId,
  ToolType,
  UnvalidatedNewDrawingWithType,
} from "@guessthesketch/common";
import { Tool } from "../Tool";

export class Pen extends Tool {
  static readonly toolType: ToolType = "pen";
  readonly toolType = Pen.toolType;

  override init() {}

  override getDrawing(drawing: UnvalidatedNewDrawingWithType): Drawing {
    return {
      id: "" as DrawingId,
      ...drawing,
    } as Drawing;
  }
}
