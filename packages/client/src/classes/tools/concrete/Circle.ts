import {
  DrawingInFly,
  NewDrawing,
  Point,
  ToolType,
} from "@guessthesketch/common"
import { DrawingAutoFillIn } from "../../../utils/autoFillin"
import { Tool } from "../Tool"

export class CircleTool extends Tool {
  public type: ToolType = "circle"

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

  private getRadius() {
    return (
      this.sketch
        .createVector(
          this.sketch.mouseX - this.startingPoint.x,
          this.sketch.mouseY - this.startingPoint.y,
        )
        .mag() * 2
    )
  }

  onMouseDragged(_: MouseEvent): void {
    const tmp: DrawingInFly = {
      ...DrawingAutoFillIn(),
      type: "circle",
      p: {
        x: this.startingPoint.x,
        y: this.startingPoint.y,
      },
      r: this.getRadius(),
    }

    this.showTmpDrawing(tmp)
  }

  onMouseReleased(_: MouseEvent): void {
    const drawing: NewDrawing = {
      ...DrawingAutoFillIn(),
      type: "circle",
      p: {
        x: this.startingPoint.x,
        y: this.startingPoint.y,
      },
      r: this.getRadius(),
    }

    this.commit(drawing)
  }

  onDeselect(): void {}
}
