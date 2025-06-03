import express from "express";
import { GlobalState } from "../classes/states/GlobalState";
import { authenticate } from "../middlewares/express/authenticate";
import { Room } from "../classes/Room";
import type { JoinRoomResult } from "@guessthesketch/common";

let router = express.Router();

router.post("/rooms", authenticate, async (req, res) => {
  const ownerId = req.session.userId;
  const room = new Room(ownerId);
  GlobalState.getInstance().addRoom(room);

  res.send({ roomId: room.id });
});

router.post("/rooms/:id/join", authenticate, async (req, res) => {
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
});

export default router;
