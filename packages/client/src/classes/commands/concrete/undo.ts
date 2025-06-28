import { GameState } from "../../../features/gameScreen/GameState"
import { sockets } from "../../../global"
import { Command } from "../command"

export class UndoCommand extends Command {
  constructor(private gameState: GameState) {
    super()
  }
  override async execute() {
    const work = async () => {
      const drawingToDelete = this.gameState.confirmedDrawings.at(-1)
      if (!drawingToDelete) return

      // TODO opet mozda nesto optimistic

      if (sockets.controls) {
        await sockets.controls.emitWithAck("delete drawing", drawingToDelete.id)
      } else {
        throw new Error("Controls namespace is null")
      }
    }

    if (this.gameState.unconfirmedDrawings.getAll().length === 0) {
      work()
    } else {
      this.gameState.unconfirmedDrawings.onEmptyOnce(work)
    }
  }

  override getName(): string {
    return "Undo"
  }
}
