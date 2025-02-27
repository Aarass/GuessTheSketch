import type { ControlsSocket, ToolType } from "@guessthesketch/common";
import { deselectTool } from "./events/deselectTool";
import { useTool } from "./events/useTool";
import { toolTypes } from "../../types/types";
import { selectTool } from "./events/selectTool";
import type { GuardedSocket } from "../../utility/guarding";
import type { MyNamespaces } from "../..";

export function registerHandlersForControls(
  namespaces: MyNamespaces,
  socket: GuardedSocket<ControlsSocket>
) {
  socket.join(socket.request.session.roomId);

  socket.on("select tool", (param: ToolType) => {
    if (!isToolType(param)) {
      return console.log("Parameter is not a tool type");
    }

    selectTool(namespaces, socket, param);
  });

  socket.on("use tool", (param: string) => {
    let obj;
    try {
      obj = JSON.parse(param);
    } catch {
      return console.log("Bad parameter");
    }

    useTool(namespaces, socket, obj);
  });

  (["disconnect", "deselect tool"] as const).forEach((event) =>
    socket.on(event, () => {
      deselectTool(namespaces, socket);
    })
  );
}

function isToolType(param: string): param is ToolType {
  for (const type in toolTypes) {
    if (param === type) return true;
  }
  return false;
}
