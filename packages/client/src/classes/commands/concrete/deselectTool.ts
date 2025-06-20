import { GameState } from "../../../features/gameScreen/GameState"
import { sockets } from "../../../global"
import { Command } from "../command"

const gameState = GameState.getInstance()

export class DeselectTool extends Command {
  override async execute() {
    // TODO nesto optimistic mozda?
    // da privremeno deselecta tool dok ne dobije odgovor
    // a onda da i potvrdi

    if (sockets.controls) {
      const { success } = await sockets.controls.emitWithAck("deselect tool")

      if (success) {
        if (gameState.currentTool) {
          gameState.currentTool.onDeselect()
          gameState.currentTool = null
        }
      }
    } else {
      throw new Error("Controls namespace is null")
    }
  }

  override getName(): string {
    return "Deselect"
  }
}
