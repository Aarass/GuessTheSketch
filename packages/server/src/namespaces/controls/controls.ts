import { deselectTool } from "./events/deselectTool";
import { useTool } from "./events/useTool";
import { toolTypes } from "../../types/types";
import { selectTool } from "./events/selectTool";
import type { ToolType } from "@guessthesketch/common";
import type { Server, Socket } from "socket.io";

export function registerHandlersForControls(io: Server, socket: Socket) {
  socket.on("select tool", (param: string) => {
    if (!isToolType(param)) {
      return console.log("Parameter is not a tool type");
    }

    selectTool(io, socket, param);
  });

  socket.on("use tool", (param: string) => {
    let obj;
    try {
      obj = JSON.parse(param);
    } catch {
      return console.log("Bad parameter");
    }

    useTool(io, socket, obj);
  });

  ["disconnect", "deselect tool"].forEach((event) =>
    socket.on(event, () => {
      deselectTool(io, socket);
    })
  );
}

function isToolType(param: string): param is ToolType {
  for (const type in toolTypes) {
    if (param === type) return true;
  }
  return false;
}
