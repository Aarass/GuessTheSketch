import type {
  Drawing,
  ToolType,
  UnvalidatedNewDrawingWithType,
} from "@guessthesketch/common";
import { Tool } from "../Tool";

export class Bucket extends Tool {
  static readonly toolType: ToolType = "bucket";
  readonly toolType = Bucket.toolType;

  override init() {}

  override getDrawing(drawing: UnvalidatedNewDrawingWithType): Drawing {
    return {
      ...drawing,
    } as Drawing;
  }
}
