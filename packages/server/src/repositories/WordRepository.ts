import mongoose, { Schema, Document } from "mongoose";
import { InfrastructureManager } from "../classes/InfrastructureManager";

export interface IWord extends Document {
  word: string;
}

const wordSchema = new Schema<IWord>({
  word: { type: String, required: true },
});

const Word = mongoose.model<IWord>("Word", wordSchema);

export interface IWordRepository {
  addWord(wordText: string): Promise<IWord>;
  getAllWords(): Promise<IWord[]>;
  getRandomWord(): Promise<IWord | null>;
}

class WordRepository implements IWordRepository {
  async addWord(wordText: string) {
    const word = new Word({ word: wordText });
    return await word.save();
  }

  async getAllWords() {
    return await Word.find();
  }

  async getRandomWord() {
    const count = await Word.countDocuments();
    if (count === 0) return null;
    const randomIndex = Math.floor(Math.random() * count);
    return await Word.findOne().skip(randomIndex);
  }
}

export function createWordRepository() {
  void InfrastructureManager.getInstance().connectMongo();

  return new WordRepository();
}

class MockWordRepository implements IWordRepository {
  addWord(wordText: string): Promise<IWord> {
    return new Promise((resolve) => {
      const word = new Word({ word: wordText });
      resolve(word);
    });
  }

  getAllWords(): Promise<IWord[]> {
    return new Promise((resolve) => {
      resolve([new Word({ word: "car" }), new Word({ word: "house" })]);
    });
  }

  getRandomWord(): Promise<IWord | null> {
    return new Promise((resolve) => {
      resolve(new Word({ word: "cat" }));
    });
  }
}

export function createMockWordRepository() {
  return new MockWordRepository();
}
