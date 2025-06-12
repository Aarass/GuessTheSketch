import mongoose from "mongoose";

const mongoURI = process.env.MONGO_URI!;

/**
 * Important! Mongoose buffers all the commands until it's connected to the database. This means that you don't have to wait until it connects to MongoDB in order to define models, run queries, etc.
 */
export const connect = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log("MongoDB Atlas connected...");
  } catch (error) {
    console.error("MongoDB connection failed", error);
    process.exit(1);
  }
};
