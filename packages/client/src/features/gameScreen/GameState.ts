import { Tool } from "./GameScreen"
import { Drawing } from "@guessthesketch/common"

export class GameState {
  currentTool: Tool | null
  drawings: Drawing[]
  inFly: {
    drawing: Drawing | null
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

  private static instance: GameState | null = null
  static getInstance() {
    if (this.instance == null) {
      this.instance = new GameState()
    }
    return this.instance
  }
}
