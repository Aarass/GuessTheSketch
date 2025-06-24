import type { RequestHandler } from "express";
import createHttpError from "http-errors";
import { Controller } from "./Controller";
import { AddWordDtoSchema } from "@guessthesketch/common";
import { GlobalState } from "../states/GlobalState";
import { authenticate } from "../../middlewares/express/authenticate";

export class WordsController extends Controller {
  constructor() {
    super();

    this.router.get("/word", authenticate, this.getCurrentWordHandler);
    this.router.post("/words", this.addWordHandler);
    this.router.get("/words", this.getAllWordsHandler);
    this.router.get("/words/random", this.getRandomWordHandler);
  }

  private getCurrentWordHandler: RequestHandler = async (req, res) => {
    const userId = req.session.userId;
    const roomId = req.session.roomId;

    if (!roomId) {
      res.sendStatus(400);
      return;
    }

    const state = GlobalState.getInstance();

    const room = state.getRoomById(roomId);
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

  // Dodaj novu reč
  private addWordHandler: RequestHandler = async (req, res, next) => {
    try {
      const validationResult = await AddWordDtoSchema.safeParseAsync(req.body);

      if (!validationResult.success) {
        next(createHttpError(404, validationResult.error));
        return;
      }

      const data = validationResult.data;

      const newWord = await this.ctx.wordService.addWord(data.word);
      res.status(201).json(newWord);
    } catch {
      next(createHttpError(500, "Failed to add word."));
    }
  };

  // Vrati sve reči
  private getAllWordsHandler: RequestHandler = async (_req, res, next) => {
    try {
      const words = await this.ctx.wordService.getAllWords();
      res.status(200).json(words);
    } catch {
      next(createHttpError(500, "Failed to fetch words."));
    }
  };

  // Vrati nasumičnu reč
  private getRandomWordHandler: RequestHandler = async (_req, res, next) => {
    try {
      const word = await this.ctx.wordService.getRandomWord();
      if (!word) {
        next(createHttpError(404, "No words found."));
        return;
      }
      res.status(200).json(word);
    } catch {
      next(createHttpError(500, "Failed to fetch random word."));
    }
  };
}
