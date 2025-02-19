import { RoomState } from "./classes/states/RoomState";
import { ConsumableTool } from "./classes/tools/Consumable";
import { concreteToolMap } from "./classes/tools/Map";
import { TimeoutableTool } from "./classes/tools/Timeoutable";
import { Tool } from "./classes/tools/Tool";
import type { PlayerId, RoomId, ToolType } from "./types/types";

export function assignTool(tool: Tool) {
  if (tool.canBeAssigned()) {
    tool.assign();
    tool.init();
  } else {
    throw `Can't be assigned`;
  }
}

export function useTool(room: RoomState, playerId: PlayerId, param: any) {
  const tool = room.getPlayersTool(playerId);

  if (tool === undefined) {
    throw `No tool`;
  }

  return tool.use(param);
}

export function deselectTool(room: RoomState, playerId: PlayerId) {
  const tool = room.getPlayersTool(playerId);

  if (tool === undefined) {
    throw `No tool`;
  }

  tool.deselect();
}

function testRegularTool() {
  const playerId = "player1";
  const room = new RoomState({
    pen: {
      count: 1,
    },
    global: {},
  });

  assignTool(room.getNewTool("pen", playerId));
  useTool(room, playerId, { x: 123, y: 425 });
  deselectTool(room, playerId);

  try {
    useTool(room, playerId, { x: 123, y: 425 });
    return console.log(`Error. User can use tool after it's been deselected`);
  } catch (e) {
    console.log(`Good. Can't use tool after it's been deselected.`);
  }

  assignTool(room.getNewTool("pen", playerId));
  useTool(room, playerId, { x: 123, y: 425 });
}
// testRegularTool();

function testConsumableTool() {
  const playerId = "player1";
  const room = new RoomState({
    pen: {
      count: 1,
      consumable: {
        maxUses: 2,
      },
    },
    global: {},
  });

  assignTool(room.getNewTool("pen", playerId));
  useTool(room, playerId, { x: 123, y: 425 });

  useTool(room, playerId, {});

  try {
    useTool(room, playerId, {});
    return console.log(`Error. User can use tool after it's been consumed`);
  } catch (e) {
    console.log(`Good. Can't use tool after it's been consumed.`);
  }

  deselectTool(room, playerId);
  assignTool(room.getNewTool("pen", playerId));

  try {
    useTool(room, playerId, {});
    return console.log(`Error. User can use tool after it's been consumed`);
  } catch (e) {
    console.log(
      `Good. Can't use tool after it's been consumed, even if you reassign it.`
    );
  }
}
// testConsumableTool();

async function testTimeoutableTool() {
  const playerId = "player1";
  const room = new RoomState({
    pen: {
      count: 1,
      timeoutable: {
        useTime: 500,
        cooldownTime: 2000,
      },
    },
    global: {},
  });

  assignTool(room.getNewTool("pen", playerId));
  useTool(room, playerId, { x: 123, y: 425 });

  await new Promise((resolve) => setTimeout(resolve, 500));

  try {
    useTool(room, playerId, {});
    return console.log(`Error. User can use tool after its time has passed`);
  } catch (e) {
    console.log(`Good. Can't use tool after its time has passed.`);
  }

  try {
    assignTool(room.getNewTool("pen", playerId));
    console.log(`Error. User can select tool while it is on cooldown`);
  } catch (e) {
    console.log(`Good. User can't select tool while it is on cooldown`);
  }

  await new Promise((resolve) => setTimeout(resolve, 2000));
  assignTool(room.getNewTool("pen", playerId));
  useTool(room, playerId, {});
}
// await testTimeoutableTool();

export {};

export type ToolConfig = {
  count: number;
  consumable?: {
    maxUses: number;
  };
  timeoutable?: {
    useTime: number;
    cooldownTime: number;
  };
};

type GameConfig = {};

export type RoomConfig = {
  [key in ToolType]: ToolConfig;
} & {
  global: GameConfig;
};

export class ToolBuilder {
  constructor(
    private roomId: RoomId,
    private type: ToolType,
    private config: ToolConfig
  ) {}

  build(playerId: PlayerId): Tool {
    let tool = new concreteToolMap[this.type](this.roomId, playerId);

    if (this.config.consumable !== undefined) {
      tool = new ConsumableTool(tool, this.config.consumable.maxUses);
    }

    if (this.config.timeoutable !== undefined) {
      tool = new TimeoutableTool(
        tool,
        this.config.timeoutable.useTime,
        this.config.timeoutable.cooldownTime
      );
    }

    return tool;
  }
}
