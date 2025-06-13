import {
  LoginDtoSchema,
  type LoginResult,
  type PlayerId,
  type RoomId,
} from "@guessthesketch/common";
import type { RequestHandler } from "express";
import type { Session, SessionData } from "express-session";
import createHttpError from "http-errors";
import { Controller } from "./Controller";

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

export class AuthController extends Controller {
  constructor() {
    super();

    this.router.post("/login", this.loginHandler);
    this.router.post("/refresh", this.refreshHandler);
    this.router.post("/logout", this.logoutHandler);
  }

  private loginHandler: RequestHandler = async (req, res, next) => {
    const validationResult = await LoginDtoSchema.safeParseAsync(req.body);

    if (!validationResult.success) {
      return next(createHttpError(404, validationResult.error));
    }

    const data = validationResult.data;
    const user = await this.ctx.authService.login(data);

    req.session.userId = user.id;
    req.session.roomId = null;

    const result: LoginResult = { id: user.id };
    res.status(200).send(result);
  };

  private refreshHandler: RequestHandler = async (req, res) => {
    const userId = req.session.userId;

    if (userId) {
      const result: LoginResult = { id: userId };
      res.status(200).send(result);
    } else {
      res.sendStatus(401);
    }
  };

  private logoutHandler: RequestHandler = async (req, res, next) => {
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
  };
}
