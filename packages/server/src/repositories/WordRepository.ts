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
    const word = new Word({
      word: words[Math.floor(Math.random() * words.length)],
    });

    return Promise.resolve(word);
  }
}

export function createMockWordRepository() {
  return new MockWordRepository();
}

const words = [
  "cat",
  "dog",
  "car",
  "house",
  "tree",
  "bicycle",
  "sun",
  "rain",
  "snow",
  "mountain",
  "ocean",
  "boat",
  "airplane",
  "helicopter",
  "phone",
  "computer",
  "television",
  "book",
  "pencil",
  "table",
  "chair",
  "bed",
  "fridge",
  "cup",
  "ball",
  "guitar",
  "piano",
  "dragon",
  "dinosaur",
  "robot",
  "astronaut",
  "firefighter",
  "police officer",
  "doctor",
  "teacher",
  "superhero",
  "elf",
  "pirate",
  "clown",
  "balloon",
  "rocket",
  "space",
  "moon",
  "planet",
  "alien",
  "zombie",
  "vampire",
  "ghost",
  "witch",
  "wizard",
  "castle",
  "crown",
  "sword",
  "shield",
  "map",
  "treasure",
  "island",
  "jungle",
  "forest",
  "desert",
  "bridge",
  "road",
  "train",
  "bus",
  "truck",
  "motorcycle",
  "camera",
  "mirror",
  "toothbrush",
  "toilet",
  "lamp",
  "clock",
  "hat",
  "shoes",
  "glasses",
  "glove",
  "scarf",
  "backpack",
  "ice cream",
  "cake",
  "pizza",
  "hamburger",
  "fries",
  "banana",
  "apple",
  "grapes",
  "strawberry",
  "watermelon",
  "pumpkin",
  "spider",
  "snake",
  "fish",
  "whale",
  "shark",
  "turtle",
  "penguin",
  "bear",
  "lion",
  "tiger",
  "monkey",
  "elephant",
  "giraffe",
  "kangaroo",
  "horse",
  "chicken",
  "duck",
  "owl",
  "eagle",
  "butterfly",
  "bee",
  "snail",
  "cloud",
  "lightning",
  "rainbow",
  "star",
  "volcano",
  "island",
  "fence",
  "barn",
  "tractor",
];
