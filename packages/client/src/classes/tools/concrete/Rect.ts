import { ToolType, Point, Drawing, NewDrawing } from "@guessthesketch/common"
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
    const tmp: Drawing = {
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

    //this.sketch.redraw()
  }

  onMouseReleased(_: MouseEvent): void {
    const drawing: NewDrawing = {
      tempId: Date.now().toString(),
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

    //this.sketch.redraw()
  }

  onDeselect(): void {}
}
