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
    protected gameState = GameState.getInstance(),
  ) {}

  showTmpDrawing(drawing: DrawingInFly) {
    this.gameState.inFly = { drawing }
  }

  // TODO
  // crtez odavnde treba da ode u neki niz privremenih crteza
  // gde ce cekati potvrdu ili zabranu od servera
  async commit(drawing: NewDrawing) {
    // this.gameState.drawings.push(drawing)
    if (sockets.controls) {
      const { success } = await sockets.controls.emitWithAck(
        "use tool",
        drawing,
      )

      if (success) {
        // TODO
      } else {
        // TODO
      }
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

      inFlyTimeoutHandle = window.setTimeout(() => {
        this.gameState.inFly = null
      }, 300)
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
