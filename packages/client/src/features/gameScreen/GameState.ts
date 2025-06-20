import { Drawing, DrawingInFly } from "@guessthesketch/common"
import { Tool } from "../../classes/tools/Tool"

export class GameState {
  currentTool: Tool | null
  drawings: Drawing[]
  inFly: {
    drawing: DrawingInFly | null
    i: number | null
  }

  private constructor() {
    this.currentTool = null
    this.drawings = []
    this.inFly = {
      drawing: null,
      i: null,
    }
  }

  reset() {
    this.currentTool?.deactivate()
    this.currentTool = null

    this.drawings = []
    this.inFly = {
      drawing: null,
      i: null,
    }
  }

  private static instance: GameState | null = null
  static getInstance() {
    if (this.instance == null) {
      this.instance = new GameState()
    }
    return this.instance
  }
}
