import type {
  Drawing,
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
      ...drawing,
    } as Drawing;
  }
}
