import { Drawing, DrawingInFly, NewDrawing } from "@guessthesketch/common"
import { Tool } from "../../classes/tools/Tool"

type InFly = {
  drawing: DrawingInFly
  i?: number | null | undefined
}

export class GameState {
  currentTool: Tool | null = null
  inFly: InFly | null = null
  unconfirmedDrawings: NewDrawing[] = []
  confirmedDrawings: Drawing[] = []

  reset() {
    this.currentTool?.deactivate()

    this.currentTool = null
    this.inFly = null
    this.unconfirmedDrawings = []
    this.confirmedDrawings = []
  }

  getAllDrawings(): (Drawing | NewDrawing)[] {
    return [...this.confirmedDrawings, ...this.unconfirmedDrawings]
  }

  private static instance: GameState | null = null
  static getInstance() {
    if (this.instance == null) {
      this.instance = new GameState()
    }
    return this.instance
  }
}
