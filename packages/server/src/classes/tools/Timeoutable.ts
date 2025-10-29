import type {
  Drawing,
  ToolType,
  UnvalidatedNewDrawingWithType,
} from "@guessthesketch/common";
import { Tool } from "./Tool";
import { TimeoutableStateComponent } from "../states/tools/TimeoutableState";
import { assert } from "../../utility/dbg";

// -----------------
// --- Decorator ---
// -----------------
export class TimeoutableTool extends Tool {
  toolType: ToolType;

  constructor(
    private wrappee: Tool,
    private useTime: number,
    private cooldownTime: number,
  ) {
    super(wrappee.state, wrappee.id);

    this.toolType = this.wrappee.toolType;
  }

  override init() {
    this.wrappee.init();
    setTimeout(() => {
      // const playerId = this.manager.getToolsPlayer(this);
      //
      // if (playerId) {
      //   this.manager.detachTool(this);
      //   // this.messagingCenter.notifyToolDeactivated(playerId);
      // } else {
      //   console.error("no playerId after detaching the tool");
      // }

      const comp = this.state.findComponent(TimeoutableStateComponent);
      assert(comp);

      console.log("Released timeoutable tool");

      setTimeout(() => {
        this.releaseResources();
      }, this.cooldownTime);
    }, this.useTime);
  }

  override getDrawing(drawing: UnvalidatedNewDrawingWithType): Drawing {
    return this.wrappee.getDrawing(drawing);
  }

  override use(drawing: UnvalidatedNewDrawingWithType) {
    return this.wrappee.use(drawing);
  }

  override releaseResources() {
    this.wrappee.releaseResources();
    console.log("Released resources of timeoutable tool");
  }
}
