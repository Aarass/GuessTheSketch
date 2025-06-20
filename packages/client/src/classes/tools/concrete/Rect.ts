import {
  ToolType,
  Point,
  Drawing,
  NewDrawing,
  DrawingInFly,
} from "@guessthesketch/common"
import { DrawingAutoFillIn } from "../../../utils/autoFillin"
import { Tool } from "../Tool"

export class RectTool extends Tool {
  public type: ToolType = "pen"

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
      type: "rect",
      topLeft: {
        x: Math.round(this.startingPoint.x),
        y: Math.round(this.startingPoint.y),
      },
      w: Math.round(this.sketch.mouseX - this.startingPoint.x),
      h: Math.round(this.sketch.mouseY - this.startingPoint.y),
    }

    this.showTmpDrawing(tmp)
  }

  onMouseReleased(_: MouseEvent): void {
    const drawing: NewDrawing = {
      ...DrawingAutoFillIn(),
      type: "rect",
      topLeft: {
        x: Math.round(this.startingPoint.x),
        y: Math.round(this.startingPoint.y),
      },
      w: Math.round(this.sketch.mouseX - this.startingPoint.x),
      h: Math.round(this.sketch.mouseY - this.startingPoint.y),
    }

    this.commit(drawing)
  }

  onDeselect(): void {}
}
