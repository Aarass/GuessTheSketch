import type { ToolType, RoomId, PlayerId } from "../../types/types";
import { Pen } from "./concrete/Pen";
import { Tool } from "./Tool";

export const concreteToolMap: {
  [key in ToolType]: new (roomId: RoomId, playerId: PlayerId) => Tool;
} = {
  pen: Pen,
};
