import express from "express";
import createHttpError from "http-errors";
import { addWord, getAllWords, getRandomWord } from "../repositories/wordRepository";
 // putanja zavisi od tvoje strukture

const router = express.Router();

// POST /words - Dodaj novu reč
router.post("/words", async (req, res, next) => {
  try {
    const { word } = req.body;

    if (!word || typeof word !== "string") {
      return next(createHttpError(400, "Invalid word input."));
    }

    const newWord = await addWord(word);
    res.status(201).json(newWord);
  } catch (err) {
    next(createHttpError(500, "Failed to add word."));
  }
});

// GET /words - Vrati sve reči
router.get("/words", async (req, res, next) => {
  try {
    const words = await getAllWords();
    res.status(200).json(words);
  } catch (err) {
    next(createHttpError(500, "Failed to fetch words."));
  }
});

// GET /words/random - Vrati nasumičnu reč
router.get("/random", async (req, res, next) => {
  try {
    const word = await getRandomWord();
    if (!word) {
      return next(createHttpError(404, "No words found."));
    }
    res.status(200).json(word);
  } catch (err) {
    next(createHttpError(500, "Failed to fetch random word."));
  }
});

export default router;
