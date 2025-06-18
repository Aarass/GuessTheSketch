import p5 from "p5"
import { GameState } from "../../../features/gameScreen/GameState"
import { Command } from "../command"

export class DeleteAllCommand extends Command {
  constructor(private sketch: p5) {
    super()
  }

  execute(): void {
    const gameState = GameState.getInstance()
    gameState.drawings.length = 0
    //this.sketch.redraw()
  }
  getName(): string {
    return "Bin"
  }
}
