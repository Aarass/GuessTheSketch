import type {
  Drawing,
  DrawingId,
  ToolType,
  UnvalidatedNewDrawingWithType,
} from "@guessthesketch/common";
import { Tool } from "../Tool";

export class Eraser extends Tool {
  static readonly toolType: ToolType = "eraser";
  readonly toolType = Eraser.toolType;

  override init() {}

  override getDrawing(drawing: UnvalidatedNewDrawingWithType): Drawing {
    return {
      id: "" as DrawingId,
      ...drawing,
    } as Drawing;
  }
}
