import type { RequestHandler } from "express";
import createHttpError from "http-errors";
import type { AppContext } from "../AppContext";
import { Controller } from "./Controller";

export class WordsController extends Controller {
  constructor(ctx: AppContext) {
    super(ctx);

    this.router.post("/words", this.addWordHandler);
    this.router.get("/words", this.getAllWordsHandler);
    this.router.get("/words/random", this.getRandomWordHandler);
  }

  // Dodaj novu reč
  private addWordHandler: RequestHandler = async (req, res, next) => {
    try {
      const { word } = req.body;

      if (!word || typeof word !== "string") {
        return next(createHttpError(400, "Invalid word input."));
      }

      const newWord = await this.ctx.wordService.addWord(word);
      res.status(201).json(newWord);
    } catch (err) {
      next(createHttpError(500, "Failed to add word."));
    }
  };

  // Vrati sve reči
  private getAllWordsHandler: RequestHandler = async (_req, res, next) => {
    try {
      const words = await this.ctx.wordService.getAllWords();
      res.status(200).json(words);
    } catch (err) {
      next(createHttpError(500, "Failed to fetch words."));
    }
  };

  // Vrati nasumičnu reč
  private getRandomWordHandler: RequestHandler = async (_req, res, next) => {
    try {
      const word = await this.ctx.wordService.getRandomWord();
      if (!word) {
        return next(createHttpError(404, "No words found."));
      }
      res.status(200).json(word);
    } catch (err) {
      next(createHttpError(500, "Failed to fetch random word."));
    }
  };
}
