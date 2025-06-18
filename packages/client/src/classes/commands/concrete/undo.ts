import p5 from "p5"
import { GameState } from "../../../features/gameScreen/GameState"
import { sockets } from "../../../global"
import { Command } from "../command"

export class UndoCommand extends Command {
  constructor(private sketch: p5) {
    super()
  }

  execute(): void {
    const gameState = GameState.getInstance()

    const last = gameState.drawings.at(-1)
    if (last === undefined) {
      return
    }

    //this.sketch.redraw()

    sockets.controls?.emit("delete drawing", last.id)
  }
  getName(): string {
    return "Undo"
  }
}
