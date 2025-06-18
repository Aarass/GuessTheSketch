import { GameState } from "../../../features/gameScreen/GameState"
import { sockets } from "../../../global"
import { Command } from "../command"

export class DeselectTool extends Command {
  execute(): void {
    const gameState = GameState.getInstance()
    const prev = gameState.currentTool
    if (prev) {
      prev.onDeselect()
      sockets.controls?.emit("deselect tool")
    }

    gameState.currentTool = null
  }

  getName(): string {
    return "Deselect"
  }
}
