import p5 from "p5"
import { GameState } from "../../../features/gameScreen/GameState"
import { sockets } from "../../../global"
import { Tool } from "../../tools/Tool"
import { Command } from "../command"
import { DeselectTool } from "./deselectTool"

export class SelectToolCommand extends Command {
  private deselectTool

  constructor(
    private ToolConstructor: new (sketch: p5, gameState: GameState) => Tool,
    private sketch: p5,
    private gameState: GameState,
  ) {
    super()

    this.deselectTool = new DeselectTool(gameState)
  }

  override async execute() {
    if (this.gameState.currentTool) {
      await this.deselectTool.execute()
    }

    if (sockets.controls) {
      const tool = new this.ToolConstructor(this.sketch, this.gameState)

      const { success } = await sockets.controls.emitWithAck(
        "select tool",
        tool.type,
      )

      if (success) {
        tool.activate()
        this.gameState.currentTool = tool
      }
    } else {
      throw new Error("Controls namespace is null")
    }
  }

  override getName() {
    return this.ToolConstructor.name
  }
}
