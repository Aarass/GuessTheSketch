import { GlobalState } from "../states/GlobalState";
import { authenticate } from "../../middlewares/express/authenticate";
import { Room } from "../Room";
import type { JoinRoomResult } from "@guessthesketch/common";
import { Controller } from "./Controller";
import type { RequestHandler } from "express";

export class RoomsController extends Controller {
  constructor() {
    super();

    this.router.post("/rooms", authenticate, this.createRoomHandler);
    this.router.post("/rooms/:id/join", authenticate, this.joinRoomHandler);
    this.router.post("/rooms/refresh", authenticate, this.refreshHandler);
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  private createRoomHandler: RequestHandler = async (req, res) => {
    const ownerId = req.session.userId;
    const room = new Room(this.ctx, ownerId);
    GlobalState.getInstance().addRoom(room);

    res.send({ roomId: room.id });
  };

  // eslint-disable-next-line @typescript-eslint/require-await
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

  // eslint-disable-next-line @typescript-eslint/require-await
  private refreshHandler: RequestHandler = async (req, res) => {
    console.warn("refreshHandler u room");
    const userId = req.session.userId;
    const roomId = req.session.roomId;
    req.session.save();

    if (!roomId) {
      res.sendStatus(400);
      return;
    }

    const room = GlobalState.getInstance().getRoomById(roomId);
    if (!room) {
      res.sendStatus(400);
      return;
    }

    const user = await this.ctx.userService.getUserById(userId);
    if (!user) {
      res.sendStatus(400);
      return;
    }

    room.addPlayer(userId, user.username);

    const result: JoinRoomResult = {
      roomId: room.id,
      ownerId: room.ownerId,
    };
    res.send(result);
  };
}
