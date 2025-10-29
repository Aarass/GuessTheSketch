import {
  toolTypes,
  type RoomId,
  type ToolConfigs,
  type ToolType,
} from "@guessthesketch/common";
import { ToolState, type ToolStateChangeObserver } from "../ToolState";
import { BaseStateComponent } from "./BaseState";
import { ConsumableStateComponent } from "./ConsumableState";
import { TimeoutableStateComponent } from "./TimeoutableState";
import type { MessagingCenter } from "../../MessagingCenter";

type StatesRecord = Record<ToolType, ToolState>;

export class ToolStates {
  constructor(public readonly states: StatesRecord) {}

  public setupNotifications(roomId: RoomId, messagingCenter: MessagingCenter) {
    for (const [type, state] of Object.entries(this.states)) {
      state.registerListener(
        new Observer((state) => {
          messagingCenter.notifyToolStateChange(
            roomId,
            type as ToolType,
            state,
          );
        }),
      );
    }
  }
}

export class ToolStatesBuilder {
  constructor(private config: ToolConfigs) {}

  build(): ToolStates {
    const record: Partial<StatesRecord> = {};

    for (const type of toolTypes) {
      const config = this.config[type];

      const components = [];

      components.push(
        new BaseStateComponent({
          toolsLeft: config.count,
        }),
      );

      if (config.consumable) {
        components.push(new ConsumableStateComponent());
      }

      if (config.timeoutable) {
        components.push(new TimeoutableStateComponent());
      }

      const state = ToolState.ctor(components);

      record[type] = state;
    }

    return new ToolStates(record as StatesRecord);
  }
}

class Observer implements ToolStateChangeObserver {
  constructor(public onChange: (state: object) => void) {}
}
//
//
//
// private bootstrapCommunication(
//   roomId: RoomId,
//   type: ToolType,
//   state: ToolState,
//   messagingCenter: MessagingCenter,
// ) {
//   state.registerListener(
//     new Observer((newState) => {
//       messagingCenter.notifyToolStateChange(roomId, type, newState);
//     }),
//   );
// }
