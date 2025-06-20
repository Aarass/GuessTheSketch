import p5 from "p5"
import { GameState } from "../../../features/gameScreen/GameState"
import { sockets } from "../../../global"
import { Tool } from "../../tools/Tool"
import { Command } from "../command"
import { DeselectTool } from "./deselectTool"

const gameState = GameState.getInstance()

export class SelectToolCommand extends Command {
  private deselectTool = new DeselectTool()

  constructor(
    private ToolConstructor: new (sketch: p5) => Tool,
    private sketch: p5,
  ) {
    super()
  }

  override async execute() {
    if (gameState.currentTool) {
      await this.deselectTool.execute()
    }

    if (sockets.controls) {
      const tool = new this.ToolConstructor(this.sketch)

      const { success } = await sockets.controls.emitWithAck(
        "select tool",
        tool.type,
      )

      if (success) {
        tool.activate()
        gameState.currentTool = tool
      }
    } else {
      throw new Error("Controls namespace is null")
    }
  }

  override getName() {
    return this.ToolConstructor.name
  }
}
