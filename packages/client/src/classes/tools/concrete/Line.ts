import {
  DrawingInFly,
  NewDrawing,
  Point,
  ToolType,
} from "@guessthesketch/common"
import { DrawingAutoFillIn } from "../../../utils/autoFillin"
import { Tool } from "../Tool"

export class LineTool extends Tool {
  public type: ToolType = "line"

  startingPoint: Point = {
    x: Infinity,
    y: Infinity,
  }

  onMousePressed(_: MouseEvent): void {
    this.startingPoint = {
      x: this.sketch.mouseX,
      y: this.sketch.mouseY,
    }
  }

  onMouseDragged(_: MouseEvent): void {
    const tmp: DrawingInFly = {
      ...DrawingAutoFillIn(),
      type: "line",
      p1: {
        x: this.startingPoint.x,
        y: this.startingPoint.y,
      },
      p2: {
        x: this.sketch.mouseX,
        y: this.sketch.mouseY,
      },
    }

    this.showTmpDrawing(tmp)
  }

  onMouseReleased(_: MouseEvent): void {
    const drawing: NewDrawing = {
      ...DrawingAutoFillIn(),
      type: "line",
      p1: {
        x: this.startingPoint.x,
        y: this.startingPoint.y,
      },
      p2: {
        x: this.sketch.mouseX,
        y: this.sketch.mouseY,
      },
    }

    this.commit(drawing)
  }

  onDeselect(): void {}
}
