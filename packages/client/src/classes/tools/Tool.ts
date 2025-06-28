import { ToolType, NewDrawing, DrawingInFly } from "@guessthesketch/common"
import p5 from "p5"
import { GameState } from "../../features/gameScreen/GameState"
import { sockets } from "../../global"

let inFlyTimeoutHandle: number | null = null

export abstract class Tool {
  public abstract type: ToolType

  protected abstract onMousePressed(event: MouseEvent): void
  protected abstract onMouseReleased(event: MouseEvent): void
  protected abstract onMouseDragged(event: MouseEvent): void

  abstract onDeselect(): void

  block: boolean = false

  constructor(
    protected sketch: p5,
    protected gameState: GameState,
  ) {}

  showTmpDrawing(drawing: DrawingInFly) {
    this.gameState.drawingInFly = drawing
  }

  async commit(drawing: NewDrawing) {
    if (!sockets.controls) {
      throw new Error(`Controls socket is not connected`)
    }

    this.gameState.unconfirmedDrawings.add(drawing)

    const { success } = await sockets.controls.emitWithAck("use tool", drawing)

    if (success) {
      this.gameState.unconfirmedDrawings.confirm(drawing)
    } else {
      this.gameState.unconfirmedDrawings.reject(drawing)
    }
  }

  activate() {
    this.sketch.mousePressed = this.helper(e => {
      try {
        if ((e.target as HTMLElement).tagName !== "CANVAS") throw ""
      } catch {
        this.block = true
        return
      }

      if (inFlyTimeoutHandle) {
        clearTimeout(inFlyTimeoutHandle)
      }

      this.block = false
      this.onMousePressed(e)
    })

    this.sketch.mouseReleased = this.helper(e => {
      if (!this.block) {
        this.onMouseReleased(e)
      }

      // Ovo resava flickering
      inFlyTimeoutHandle = window.setTimeout(() => {
        this.gameState.drawingInFly = null
      }, 100)
    })

    this.sketch.mouseClicked = () => {}
    this.sketch.mouseDragged = this.helper(e => {
      if (!this.block) {
        this.onMouseDragged(e)
      }
    })
  }

  deactivate() {
    const empty = () => {}
    this.sketch.mouseReleased = empty
    this.sketch.mousePressed = empty
    this.sketch.mouseClicked = empty
    this.sketch.mouseDragged = empty
  }

  private helper(fn: (event: MouseEvent) => void) {
    return (event?: MouseEvent) => {
      if (event) {
        fn(event)
        return true
      }
    }
  }
}
