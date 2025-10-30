import { GameState } from "../../../features/gameScreen/GameState"
import { sockets } from "../../../global"
import { Command } from "../command"

export class DeselectToolCommand extends Command {
  constructor(private gameState: GameState) {
    super()
  }
  override async execute() {
    if (sockets.controls) {
      const { success } = await sockets.controls.emitWithAck("deselect tool")

      if (success) {
        this.gameState.currentTool?.deactivate()
        this.gameState.currentTool?.onDeselect()
        this.gameState.currentTool = null
        this.gameState.currentToolId = null
      }
    } else {
      throw new Error("Controls namespace is null")
    }
  }

  override getName(): string {
    return "Deselect"
  }
}
