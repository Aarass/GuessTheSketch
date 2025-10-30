import type { JoinRoomResult, RoomId } from "@guessthesketch/common";
import type { RequestHandler } from "express";
import createHttpError from "http-errors";
import { authenticate } from "../../middlewares/express/authenticate";
import { Room } from "../Room";
import { Controller } from "./Controller";
import type { AppContext } from "../AppContext";

export class RoomsController extends Controller {
  constructor(ctx: AppContext) {
    super(ctx);

    this.router.post("/rooms", authenticate, this.createRoomHandler);
    this.router.post("/rooms/:id/join", authenticate, this.joinRoomHandler);
    this.router.post("/rooms/refresh", authenticate, this.refreshHandler);
  }

  private createRoomHandler: RequestHandler = (req, res) => {
    const ownerId = req.session.userId;
    const room = new Room(this.ctx, ownerId);

    this.ctx.roomsService.addRoom(room);

    res.send({ roomId: room.id });
  };

  private joinRoomHandler: RequestHandler = async (req, res, next) => {
    const userId = req.session.userId;
    const user = await this.ctx.userService.getUserById(userId);

    if (user === null) {
      next(createHttpError(400, "User is null"));
      return;
    }

    const roomId = req.params["id"];
    const room = this.ctx.roomsService.getRoomById(roomId as RoomId);

    if (room === null) {
      next(createHttpError(400, "No room found"));
      return;
    }

    const result: JoinRoomResult = {
      roomId: room.id,
      ownerId: room.ownerId,
    };

    room.addPlayer(userId, user.username);

    req.session.roomId = roomId as RoomId;
    res.send(result);

    console.log("User joined room via http");
  };

  private refreshHandler: RequestHandler = async (req, res) => {
    const userId = req.session.userId;
    const roomId = req.session.roomId;

    if (!roomId) {
      res.sendStatus(400);
      return;
    }

    const room = this.ctx.roomsService.getRoomById(roomId);
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

    res.send({
      roomId: room.id,
      ownerId: room.ownerId,
    } satisfies JoinRoomResult);
  };
}
