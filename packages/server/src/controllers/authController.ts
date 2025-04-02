import express from "express";
import createHttpError from "http-errors";
import {
  LoginDtoSchema,
  type LoginResult,
  type PlayerId,
  type RoomId,
} from "@guessthesketch/common";
import authService from "../services/authService";
import type { Session, SessionData } from "express-session";

declare module "express-session" {
  interface SessionData {
    userId: PlayerId;
    roomId: RoomId | null;
  }
}

declare module "http" {
  interface IncomingMessage {
    session: Session & SessionData;
  }
}

let router = express.Router();

router.post("/login", async (req, res, next) => {
  const validationResult = await LoginDtoSchema.safeParseAsync(req.body);
  if (!validationResult.success) {
    return next(createHttpError(404, validationResult.error));
  }

  const data = validationResult.data;
  const user = await authService.login(data);

  req.session.userId = user.id;
  req.session.roomId = null;

  const result: LoginResult = { id: user.id };
  res.status(200).send(result);
});

router.post("/refresh", async (req, res, next) => {
  const userId = req.session.userId;

  if (userId) {
    const result: LoginResult = { id: userId };
    res.status(200).send(result);
  } else {
    res.sendStatus(401);
  }
});

router.post("/logout", async (req, res, next) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        throw err;
      }
    });
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    return next(createHttpError(400, `Logout failed`));
  }
});

export default router;
