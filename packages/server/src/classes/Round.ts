import type { RoomId, RoundId } from "@guessthesketch/common/types/ids";
import { v4 as uuid } from "uuid";
import type { AppContext } from "./AppContext";
import { GuessingManager } from "./GuessingManager";
import type { ToolStatesBuilder } from "./states/tools/ToolStatesBuilder";
import { ToolBuilder } from "./tools/ToolBuilder";
import { ToolsManager } from "./ToolsManager";
import type { MessagingCenter } from "./MessagingCenter";
import type { ToolType } from "@guessthesketch/common";
import type { ToolState, ToolStateChangeObserver } from "./states/ToolState";

export class Round {
  public id: RoundId = uuid() as RoundId;

  public guessingManager;
  public toolsManager;

  constructor(
    roomId: RoomId,
    ctx: AppContext,
    toolBuilder: ToolBuilder,
    toolStatesBuilder: ToolStatesBuilder,
    messagingCenter: MessagingCenter,
  ) {
    this.guessingManager = new GuessingManager(ctx);

    const states = toolStatesBuilder.build();
    bootstrapCommunication(roomId, states, messagingCenter);

    this.toolsManager = new ToolsManager(toolBuilder, states, messagingCenter);
  }

  public async start() {
    await this.guessingManager.init();
  }
}

function bootstrapCommunication(
  roomId: RoomId,
  states: Record<ToolType, ToolState>,
  messagingCenter: MessagingCenter,
) {
  for (const [_type, state] of Object.entries(states)) {
    const type = _type as ToolType;

    state.registerListener(
      new Observer((state) => {
        messagingCenter.notifyToolStateChange(roomId, type, state);
      }),
    );
  }
}

class Observer implements ToolStateChangeObserver {
  constructor(public onChange: (state: object) => void) {}
}
