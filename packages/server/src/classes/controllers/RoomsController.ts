import { GlobalState } from "../states/GlobalState";
import { authenticate } from "../../middlewares/express/authenticate";
import { Room } from "../Room";
import type { JoinRoomResult } from "@guessthesketch/common";
import type { AppContext } from "../AppContext";
import { Controller } from "./Controller";
import type { RequestHandler } from "express";

export class RoomsController extends Controller {
  constructor(ctx: AppContext) {
    super(ctx);
    this.router.post("/rooms", authenticate, this.createRoomHandler);
    this.router.post("/rooms/:id/join", authenticate, this.joinRoomHandler);
  }

  private createRoomHandler: RequestHandler = async (req, res) => {
    const ownerId = req.session.userId;
    const room = new Room(ownerId);
    GlobalState.getInstance().addRoom(room);

    res.send({ roomId: room.id });
  };

  private joinRoomHandler: RequestHandler = async (req, res) => {
    const roomId = req.params["id"];
    const room = GlobalState.getInstance().getRoomById(roomId);

    if (room) {
      const result: JoinRoomResult = {
        roomId: room.id,
        ownerId: room.ownerId,
      };

      req.session.roomId = roomId;
      res.send(result);

      console.log("User joined room via http");
    } else {
      console.log("No room found");
      res.sendStatus(400);
    }
  };
}
