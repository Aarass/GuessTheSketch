import type {
  Drawing,
  ToolType,
  UnvalidatedNewDrawingWithType,
} from "@guessthesketch/common";
import { Tool } from "../Tool";

export class Circle extends Tool {
  static readonly toolType: ToolType = "circle";
  readonly toolType = Circle.toolType;

  override init() {}

  override getDrawing(drawing: UnvalidatedNewDrawingWithType): Drawing {
    return {
      ...drawing,
    } as Drawing;
  }
}
