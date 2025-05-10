import mongoose, { Schema, Document } from "mongoose";
import dotenv from "dotenv";
dotenv.config();

export interface IWord extends Document {
  word: string;
}

const wordSchema = new Schema<IWord>({
  word: { type: String, required: true },
});

const Word = mongoose.model<IWord>("Word", wordSchema);

const mongoURI = process.env.MONGO_URI!;

export const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log("MongoDB Atlas connected...");
  } catch (error) {
    console.error("MongoDB connection failed", error);
    process.exit(1);
  }
};

export const addWord = async (wordText: string): Promise<IWord> => {
  const word = new Word({ word: wordText });
  return await word.save();
};

export const getAllWords = async (): Promise<IWord[]> => {
  return await Word.find();
};

export const getRandomWord = async (): Promise<IWord | null> => {
  const count = await Word.countDocuments();
  if (count === 0) return null;
  const randomIndex = Math.floor(Math.random() * count);
  return await Word.findOne().skip(randomIndex);
};

