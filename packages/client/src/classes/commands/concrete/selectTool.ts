import p5 from "p5"
import { GameState } from "../../../features/gameScreen/GameState"
import { sockets } from "../../../global"
import { Tool } from "../../tools/Tool"
import { Command } from "../command"

export class SelectToolCommand extends Command {
  constructor(
    private ToolConstructor: new (sketch: p5) => Tool,
    private sketch: p5,
  ) {
    super()
  }

  execute(): void {
    const gameState = GameState.getInstance()
    const prev = gameState.currentTool
    if (prev) {
      prev.onDeselect()
      sockets.controls?.emit("deselect tool")
    }

    const newTool = new this.ToolConstructor(this.sketch)
    sockets.controls?.emit("select tool", newTool.type)

    // TODO uradi ovo tek kada server potvrdi
    newTool.activate()
    gameState.currentTool = newTool
  }

  getName() {
    return this.ToolConstructor.name
  }
}
