import type { RequestHandler } from "express";
import { authenticate } from "../../middlewares/express/authenticate";
import { GlobalState } from "../states/GlobalState";
import { Controller } from "./Controller";

export class ReplayController extends Controller {
  constructor() {
    super();

    this.router.get(
      "/replay/:roomId/:gameId",
      authenticate,
      this.gameReplayHandler,
    );

    this.router.get(
      "/replay/:roomId/:gameId/:roundId",
      authenticate,
      this.roundReplayHandler,
    );
  }

  private gameReplayHandler: RequestHandler = async (req, res) => {
    const roomId = req.params["roomId"];
    const gameId = req.params["gameId"];

    const replay = await this.ctx.persistanceService.getGameReplay(
      roomId,
      gameId,
    );

    res.send(replay);
  };

  private roundReplayHandler: RequestHandler = async (req, res) => {
    const roomId = req.params["roomId"];
    const gameId = req.params["gameId"];
    const roundId = req.params["roundId"];

    const replay = await this.ctx.persistanceService.getRoundReplay(
      roomId,
      gameId,
      roundId,
    );

    res.send(replay);
  };
}
