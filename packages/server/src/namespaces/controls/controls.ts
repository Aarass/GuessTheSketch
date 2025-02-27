import type { ControlsSocket, ToolType } from "@guessthesketch/common";
import { deselectTool } from "./actions/deselectTool";
import { useTool } from "./actions/useTool";
import { selectTool } from "./actions/selectTool";
import type { GuardedSocket } from "../../utility/guarding";
import type { MyNamespaces } from "../..";

export function registerHandlersForControls(
  namespaces: MyNamespaces,
  socket: GuardedSocket<ControlsSocket>
) {
  socket.join(socket.request.session.roomId);

  socket.on("select tool", (toolType: ToolType) => {
    selectTool(namespaces, socket, toolType);
  });

  socket.on("use tool", (drawing) => {
    useTool(namespaces, socket, drawing);
  });

  (["disconnect", "deselect tool"] as const).forEach((event) =>
    socket.on(event, () => {
      deselectTool(namespaces, socket);
    })
  );
}

// import { toolTypes } from "../../types/types";

// function isToolType(param: string): param is ToolType {
//   for (const type in toolTypes) {
//     if (param === type) return true;
//   }
//   return false;
// }
