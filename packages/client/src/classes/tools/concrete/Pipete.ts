import { ToolType } from "@guessthesketch/common"
import { store } from "../../../app/store"
import { setColor } from "../../../features/gameScreen/GameScreenSlice"
import { Tool } from "../Tool"

export class PipetteTool extends Tool {
  public type: ToolType = "" as ToolType

  onMouseReleased(event: MouseEvent): void {
    const res = this.sketch.get(this.sketch.mouseX, this.sketch.mouseY)
    let p1 = res[0].toString(16)
    if (p1.length == 1) p1 = `0${p1}`
    let p2 = res[1].toString(16)
    if (p2.length == 1) p2 = `0${p2}`
    let p3 = res[2].toString(16)
    if (p3.length == 1) p3 = `0${p3}`

    store.dispatch(setColor(`#${p1}${p2}${p3}`))
  }

  onMousePressed(event: MouseEvent): void {}
  onMouseDragged(event: MouseEvent): void {}

  onDeselect(): void {}
}
