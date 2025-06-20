import { GameState } from "../../../features/gameScreen/GameState"
import { sockets } from "../../../global"
import { Command } from "../command"

export class UndoCommand extends Command {
  override async execute() {
    const gameState = GameState.getInstance()

    const drawingToDelete = gameState.confirmedDrawings.at(-1)
    if (!drawingToDelete) return

    // TODO opet mozda nesto optimistic

    if (sockets.controls) {
      const {} = await sockets.controls.emitWithAck(
        "delete drawing",
        drawingToDelete.id,
      )
    } else {
      throw new Error("Controls namespace is null")
    }
  }

  override getName(): string {
    return "Undo"
  }
}
