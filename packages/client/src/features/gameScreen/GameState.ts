import {
  Drawing,
  DrawingInFly,
  NewDrawing,
  RoundReplay,
} from "@guessthesketch/common"
import { Tool } from "../../classes/tools/Tool"
import { getDrawingsRequest } from "../restore/restoreApi"

export class GameState {
  currentTool: Tool | null = null
  confirmedDrawings: Drawing[] = []
  unconfirmedDrawings = new UnconfirmedDrawings()
  drawingInFly: DrawingInFly | null = null
  deleteFlag: boolean = false

  processNewDrawing(drawing: Drawing) {
    if (drawing.type !== "eraser") {
      console.log(drawing)
      this.confirmedDrawings.push(drawing)
    } else {
      this.deleteFlag = true
      this.confirmedDrawings = this.confirmedDrawings.filter(
        d => d.id !== drawing.toDelete,
      )
    }
  }

  prependDrawings(drawings: Drawing[]) {
    const copy = [...this.confirmedDrawings]
    this.confirmedDrawings = []

    for (const drawing of drawings) {
      this.processNewDrawing(drawing)
    }

    this.confirmedDrawings.push(...copy)
  }

  reset() {
    this.currentTool?.deactivate()

    this.currentTool = null
    this.confirmedDrawings = []
    this.unconfirmedDrawings = new UnconfirmedDrawings()
    this.drawingInFly = null
    this.deleteFlag = true
  }

  async tryRestoreDrawings() {
    try {
      const res = await getDrawingsRequest()
      const replay = (await res.json()) as RoundReplay
      this.prependDrawings(replay)
    } catch {}
  }

  // private static instance: GameState | null = null
  // static getInstance() {
  //   if (this.instance == null) {
  //     this.instance = new GameState()
  //   }
  //   return this.instance
  // }
}

class UnconfirmedDrawings {
  private drawings: NewDrawing[] = []

  public add(drawing: NewDrawing) {
    this.drawings.push(drawing)
  }

  public confirm(drawing: NewDrawing) {
    this.remove(drawing)
  }

  public reject(drawing: NewDrawing) {
    this.removeListeners()
    this.remove(drawing)
  }

  private remove(drawing: NewDrawing) {
    this.drawings = this.drawings.filter(d => d !== drawing)

    if (this.drawings.length === 0) {
      this.emitEmpty()
    }
  }

  public getAll() {
    return this.drawings
  }

  private listeners: (() => void)[] = []

  public onEmptyOnce(listener: () => void) {
    this.listeners.push(listener)
  }

  private removeListeners() {
    this.listeners = []
  }

  private emitEmpty() {
    const copy = [...this.listeners]
    this.listeners = []

    copy.forEach(l => l())
  }
}
