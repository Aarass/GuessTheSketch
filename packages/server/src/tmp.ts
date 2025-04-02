// import type { ToolConfig } from "@guessthesketch/common";
// import { RoomState } from "./classes/states/RoomState";
// import { ConsumableTool } from "./classes/tools/Consumable";
// import { TimeoutableTool } from "./classes/tools/Timeoutable";
// import { Tool } from "./classes/tools/Tool";
// import type { PlayerId, RoomId, ToolType } from "./types/types";
// import { Pen } from "./classes/tools/concrete/Pen";

// export function assignTool(tool: Tool) {
//   if (tool.canBeAssigned()) {
//     tool.assign();
//     tool.init();
//   } else {
//     throw `Can't be assigned`;
//   }
// }

// export function useTool(room: RoomState, playerId: PlayerId, param: any) {
//   const tool = room.getPlayersTool(playerId);

//   if (tool === undefined) {
//     throw `No tool`;
//   }

//   return tool.use(param);
// }

// export function deselectTool(room: RoomState, playerId: PlayerId) {
//   const tool = room.getPlayersTool(playerId);

//   if (tool === undefined) {
//     throw `No tool`;
//   }

//   tool.deselect();
// }

// function testRegularTool() {
//   const playerId = "player1";
//   const room = new RoomState({
//     pen: {
//       count: 1,
//     },
//     global: {},
//   });

//   assignTool(room.getNewTool("pen", playerId));
//   useTool(room, playerId, { x: 123, y: 425 });
//   deselectTool(room, playerId);

//   try {
//     useTool(room, playerId, { x: 123, y: 425 });
//     return console.log(`Error. User can use tool after it's been deselected`);
//   } catch (e) {
//     console.log(`Good. Can't use tool after it's been deselected.`);
//   }

//   assignTool(room.getNewTool("pen", playerId));
//   useTool(room, playerId, { x: 123, y: 425 });
// }
// // testRegularTool();

// function testConsumableTool() {
//   const playerId = "player1";
//   const room = new RoomState({
//     pen: {
//       count: 1,
//       consumable: {
//         maxUses: 2,
//       },
//     },
//     global: {},
//   });

//   assignTool(room.getNewTool("pen", playerId));
//   useTool(room, playerId, { x: 123, y: 425 });

//   useTool(room, playerId, {});

//   try {
//     useTool(room, playerId, {});
//     return console.log(`Error. User can use tool after it's been consumed`);
//   } catch (e) {
//     console.log(`Good. Can't use tool after it's been consumed.`);
//   }

//   deselectTool(room, playerId);
//   assignTool(room.getNewTool("pen", playerId));

//   try {
//     useTool(room, playerId, {});
//     return console.log(`Error. User can use tool after it's been consumed`);
//   } catch (e) {
//     console.log(
//       `Good. Can't use tool after it's been consumed, even if you reassign it.`
//     );
//   }
// }
// // testConsumableTool();

// async function testTimeoutableTool() {
//   const playerId = "player1";
//   const room = new RoomState({
//     pen: {
//       count: 1,
//       timeoutable: {
//         useTime: 500,
//         cooldownTime: 2000,
//       },
//     },
//     global: {},
//   });

//   assignTool(room.getNewTool("pen", playerId));
//   useTool(room, playerId, { x: 123, y: 425 });

//   await new Promise((resolve) => setTimeout(resolve, 500));

//   try {
//     useTool(room, playerId, {});
//     return console.log(`Error. User can use tool after its time has passed`);
//   } catch (e) {
//     console.log(`Good. Can't use tool after its time has passed.`);
//   }

//   try {
//     assignTool(room.getNewTool("pen", playerId));
//     console.log(`Error. User can select tool while it is on cooldown`);
//   } catch (e) {
//     console.log(`Good. User can't select tool while it is on cooldown`);
//   }

//   await new Promise((resolve) => setTimeout(resolve, 2000));
//   assignTool(room.getNewTool("pen", playerId));
//   useTool(room, playerId, {});
// }
// // await testTimeoutableTool();

// export class ToolBuilder {
//   static build(
//     playerId: PlayerId,
//     roomId: RoomId,
//     type: ToolType,
//     config: ToolConfig
//   ): Tool {
//     let tool = this.getBaseTool(type, playerId, roomId);

//     if (config.consumable !== undefined) {
//       tool = new ConsumableTool(tool, config.consumable.maxUses);
//     }

//     if (config.timeoutable !== undefined) {
//       tool = new TimeoutableTool(
//         tool,
//         config.timeoutable.useTime,
//         config.timeoutable.cooldownTime
//       );
//     }

//     return tool;
//   }

//   private static getBaseTool(
//     type: ToolType,
//     playerId: PlayerId,
//     roomId: RoomId
//   ) {
//     return new this.map[type](roomId, playerId);
//   }

//   private static map: {
//     [key in ToolType]: new (roomId: RoomId, playerId: PlayerId) => Tool;
//   } = {
//     pen: Pen,
//   };
// }
