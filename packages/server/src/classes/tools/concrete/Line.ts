import type {
  Drawing,
  ToolType,
  UnvalidatedNewDrawingWithType,
} from "@guessthesketch/common";
import { Tool } from "../Tool";

export class Line extends Tool {
  static readonly toolType: ToolType = "line";
  readonly toolType = Line.toolType;

  override init() {}

  override getDrawing(drawing: UnvalidatedNewDrawingWithType): Drawing {
    return {
      ...drawing,
    } as Drawing;
  }
}
