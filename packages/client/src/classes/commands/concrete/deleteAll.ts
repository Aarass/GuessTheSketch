// import p5 from "p5"
// import { GameState } from "../../../features/gameScreen/GameState"
import { Command } from "../command"

export class DeleteAllCommand extends Command {
  override async execute() {
    throw `Not Implemented Yet`
    // const gameState = GameState.getInstance()
    // gameState.drawings.length = 0
    //this.sketch.redraw()
  }

  override getName(): string {
    return "Bin"
  }
}
