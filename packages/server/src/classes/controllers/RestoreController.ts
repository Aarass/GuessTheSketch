import type { RequestHandler } from "express";
import createHttpError from "http-errors";
import { authenticate } from "../../middlewares/express/authenticate";
import { Controller } from "./Controller";
import type { AppContext } from "../AppContext";

export class RestoreController extends Controller {
  constructor(ctx: AppContext) {
    super(ctx);

    this.router.get("/restore/config", authenticate, this.getConfigHandler);
    this.router.get(
      "/restore/leaderboard",
      authenticate,
      this.getLeaderboardHandler,
    );
    this.router.get(
      "/restore/teamOnMove",
      authenticate,
      this.getTeamOnMoveHandler,
    );
    this.router.get("/restore/drawings", authenticate, this.getDrawingsHandler);
    this.router.get("/restore/word", authenticate, this.getWordHandler);
    this.router.get("/restore/clock", authenticate, this.getClockHander);
    this.router.get(
      "/restore/roundsCount",
      authenticate,
      this.getRoundsCountHandler,
    );
  }

  private getConfigHandler: RequestHandler = async (req, res, next) => {
    const roomId = req.session.roomId;

    if (!roomId) {
      next(createHttpError(400, "No room id in your session data"));
      return;
    }

    const room = this.ctx.roomsService.getRoomById(roomId);

    if (!room) {
      next(createHttpError(400, "No room found with id in your session data"));
      return;
    }

    const game = room.currentGame;
    if (!game) {
      next(createHttpError(400, "Game is null"));
      return;
    }

    res.send(game.getProcessedConfig());
  };

  private getLeaderboardHandler: RequestHandler = async (req, res, next) => {
    const roomId = req.session.roomId;

    if (!roomId) {
      next(createHttpError(400, "No room id in your session data"));
      return;
    }

    const room = this.ctx.roomsService.getRoomById(roomId);

    if (!room) {
      next(createHttpError(400, "No room found with id in your session data"));
      return;
    }

    const game = room.currentGame;
    if (!game) {
      next(createHttpError(400, "Game is null"));
      return;
    }

    res.send(game.getLeaderboard());
  };

  private getTeamOnMoveHandler: RequestHandler = async (req, res, next) => {
    const roomId = req.session.roomId;

    if (!roomId) {
      next(createHttpError(400, "No room id in your session data"));
      return;
    }

    const room = this.ctx.roomsService.getRoomById(roomId);

    if (!room) {
      next(createHttpError(400, "No room found with id in your session data"));
      return;
    }

    const game = room.currentGame;
    if (!game) {
      next(createHttpError(400, "Game is null"));
      return;
    }

    const teamOnMove = game.getTeamOnMove();

    res.send({ teamId: teamOnMove?.id ?? null });
  };

  private getDrawingsHandler: RequestHandler = async (req, res, next) => {
    const roomId = req.session.roomId;

    if (!roomId) {
      next(createHttpError(400, "No room id in your session data"));
      return;
    }

    const room = this.ctx.roomsService.getRoomById(roomId);

    if (!room) {
      next(createHttpError(400, "No room found with id in your session data"));
      return;
    }

    const game = room.currentGame;
    if (!game) {
      next(createHttpError(400, "Game is null"));
      return;
    }

    const round = game.currentRound;

    if (!round) {
      next(createHttpError(400, "Round is null"));
      return;
    }

    res.send(
      await this.ctx.persistanceService.getRoundReplay(
        room.id,
        game.id,
        round.id,
      ),
    );
  };

  private getWordHandler: RequestHandler = async (req, res, next) => {
    const userId = req.session.userId;
    const roomId = req.session.roomId;

    if (!roomId) {
      next(createHttpError(400, "No room id in your session data"));
      return;
    }

    const room = this.ctx.roomsService.getRoomById(roomId);

    if (!room) {
      next(createHttpError(400, "No room found with id in your session data"));
      return;
    }

    const game = room.currentGame;
    if (!game) {
      next(createHttpError(400, "Game is null"));
      return;
    }

    const round = game.currentRound;

    if (!round) {
      next(createHttpError(400, "Round is null"));
      return;
    }

    const myTeam = game.findPlayersTeam(userId);
    if (!myTeam) {
      res.sendStatus(400);
      return;
    }

    const myTeamIsOnMove = game.isTeamOnMove(myTeam.id);

    const word = round.guessingManager.getWord(myTeamIsOnMove ? false : true);

    res.send({
      word,
    });
  };

  private getClockHander: RequestHandler = async (req, res, next) => {
    const roomId = req.session.roomId;

    if (!roomId) {
      next(createHttpError(400, "No room id in your session data"));
      return;
    }

    const room = this.ctx.roomsService.getRoomById(roomId);

    if (!room) {
      next(createHttpError(400, "No room found with id in your session data"));
      return;
    }

    const game = room.currentGame;
    if (!game) {
      next(createHttpError(400, "Game is null"));
      return;
    }

    const clock = game.getTimeLeft();

    res.send({
      clock,
    });
  };

  private getRoundsCountHandler: RequestHandler = async (req, res, next) => {
    const roomId = req.session.roomId;

    if (!roomId) {
      next(createHttpError(400, "No room id in your session data"));
      return;
    }

    const room = this.ctx.roomsService.getRoomById(roomId);

    if (!room) {
      next(createHttpError(400, "No room found with id in your session data"));
      return;
    }

    const game = room.currentGame;
    if (!game) {
      next(createHttpError(400, "Game is null"));
      return;
    }

    res.send(game.getRoundsCount());
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
