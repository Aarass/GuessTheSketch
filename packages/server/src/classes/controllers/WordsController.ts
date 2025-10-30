import { AddWordDtoSchema } from "@guessthesketch/common";
import type { RequestHandler } from "express";
import createHttpError from "http-errors";
import { Controller } from "./Controller";
import type { AppContext } from "../AppContext";

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
