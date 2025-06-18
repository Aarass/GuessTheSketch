import { ToolType, Point, Drawing, NewDrawing } from "@guessthesketch/common"
import { DrawingAutoFillIn } from "../../../utils/autoFillin"
import { Tool } from "../Tool"

export class CircleTool extends Tool {
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
    const tmp: Drawing = {
      ...DrawingAutoFillIn(),
      type: "circle",
      p: {
        x: this.startingPoint.x,
        y: this.startingPoint.y,
      },
      r: this.getRadius(),
    }

    this.showTmpDrawing(tmp)

    //this.sketch.redraw()
  }

  onMouseReleased(_: MouseEvent): void {
    const drawing: NewDrawing = {
      tempId: Date.now().toString(),
      ...DrawingAutoFillIn(),
      type: "circle",
      p: {
        x: this.startingPoint.x,
        y: this.startingPoint.y,
      },
      r: this.getRadius(),
    }

    this.commit(drawing)

    //this.sketch.redraw()
  }

  onDeselect(): void {}
}
