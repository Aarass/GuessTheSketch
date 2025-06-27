import { NewDrawing, ToolType } from "@guessthesketch/common"
import { DrawingAutoFillIn } from "../../../utils/autoFillin"
import { Tool } from "../Tool"

export class FloodFillTool extends Tool {
  public type: ToolType = "bucket"

  onMouseReleased(event: MouseEvent): void {
    let drawing: NewDrawing = {
      ...DrawingAutoFillIn(),
      type: "flood",
      p: {
        x: this.sketch.mouseX,
        y: this.sketch.mouseY,
      },
    }

    this.commit(drawing)
  }

  onMousePressed(event: MouseEvent): void {}
  onMouseDragged(event: MouseEvent): void {}

  onDeselect(): void {}
}
