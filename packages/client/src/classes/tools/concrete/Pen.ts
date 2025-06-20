import {
  ToolType,
  Point,
  Drawing,
  NewDrawing,
  DrawingInFly,
} from "@guessthesketch/common"
import { Tool } from "../Tool"
import { DrawingAutoFillIn } from "../../../utils/autoFillin"

export class PenTool extends Tool {
  public type: ToolType = "pen"

  points: Point[] = []

  override showTmpDrawing(drawing: DrawingInFly) {
    this.gameState.drawingInFly = drawing
  }

  onMousePressed(event: MouseEvent) {
    this.points = [
      {
        x: this.sketch.mouseX,
        y: this.sketch.mouseY,
      },
    ]

    const tmp: DrawingInFly = {
      ...DrawingAutoFillIn(),
      type: "freeline",
      points: this.points,
    }

    this.showTmpDrawing(tmp)
  }

  onMouseDragged(event: MouseEvent) {
    this.points.push({
      x: this.sketch.mouseX,
      y: this.sketch.mouseY,
    })

    // Ovde nije potrebno da explicitno postavimo in fly drawing
    // zbog prenosa vrednosti po referenci

    //this.sketch.redraw()
  }

  onMouseReleased(event: MouseEvent): void {
    const drawing: NewDrawing = {
      ...DrawingAutoFillIn(),
      type: "freeline",
      points: [...this.points],
    }

    this.commit(drawing)
  }

  onDeselect(): void {}
}
