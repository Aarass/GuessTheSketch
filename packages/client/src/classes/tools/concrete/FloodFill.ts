import { ToolType, Drawing, NewDrawing } from "@guessthesketch/common"
import { DrawingAutoFillIn } from "../../../utils/autoFillin"
import { Tool } from "../Tool"

export class FloodFillTool extends Tool {
  public type: ToolType = "pen"

  onMouseReleased(event: MouseEvent): void {
    let drawing: NewDrawing
    if (this.gameState.drawings.length == 0) {
      drawing = {
        tempId: Date.now().toString(),
        ...DrawingAutoFillIn(),
        type: "rect",
        topLeft: {
          x: 0,
          y: 0,
        },
        w: this.sketch.width,
        h: this.sketch.height,
      }
    } else {
      drawing = {
        tempId: Date.now().toString(),
        ...DrawingAutoFillIn(),
        type: "flood",
        p: {
          x: this.sketch.mouseX,
          y: this.sketch.mouseY,
        },
      }
    }

    this.commit(drawing)

    //this.sketch.redraw()
  }

  onMousePressed(event: MouseEvent): void {}
  onMouseDragged(event: MouseEvent): void {}

  onDeselect(): void {}
}
