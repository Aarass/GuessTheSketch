import type { RequestHandler } from "express";
import { authenticate } from "../../middlewares/express/authenticate";
import { GlobalState } from "../states/GlobalState";
import { Controller } from "./Controller";

// TODO
// u sred sam refactoringa, ne znam da li je ovo okej, da li ovaj handler treba da bude tu
export class ReplayController extends Controller {
  constructor(private state: GlobalState) {
    super();

    this.router.get("/replay/round", authenticate, this.roundReplayHandler);
  }

  private roundReplayHandler: RequestHandler = async (req, res) => {
    const roomId = req.session.roomId;

    if (!roomId) {
      res.sendStatus(400);
      return;
    }

    const room = this.state.getRoomById(roomId);

    if (!room) {
      res.sendStatus(400);
      return;
    }

    const game = room.currentGame;
    if (!game) {
      res.sendStatus(400);
      return;
    }

    const round = game.currentRound;

    if (!round) {
      res.sendStatus(400);
      return;
    }

    const replay = await this.ctx.persistanceService.getRoundReplay(
      room.id,
      game.id,
      round.id,
    );

    res.send(replay);
  };
}

// this.router.get(
//   "/replay/:roomId/:gameId/:roundId",
//   authenticate,
//   this.roundReplayHandler,
// );

// private roundReplayHandler: RequestHandler = async (req, res) => {
//   const roomId = req.params["roomId"];
//   const gameId = req.params["gameId"];
//   const roundId = req.params["roundId"];
//
//   const replay = await this.ctx.persistanceService.getRoundReplay(
//     roomId as RoomId,
//     gameId as GameId,
//     roundId as RoundId,
//   );
//
//   res.send(replay);
// };
