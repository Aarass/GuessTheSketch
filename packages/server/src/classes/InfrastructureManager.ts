import dotenv from "dotenv";
import { connect as connectRedis } from "../drivers/redis";
import { connect as connectMongo } from "../drivers/mongo";

export class InfrastructureManager {
  private connected = new Set();

  private constructor() {
    dotenv.config();
  }

  public async connectRedis() {
    if (!this.connected.has("redis")) {
      this.connected.add("redis");
      await connectRedis();
    }
  }

  public async connectMongo() {
    if (!this.connected.has("mongo")) {
      this.connected.add("mongo");
      await connectMongo();
    }
  }

  // -----------------
  // --- Singleton ---
  // -----------------
  private static instance: InfrastructureManager | null = null;

  static getInstance() {
    if (this.instance == null) {
      this.instance = new InfrastructureManager();
    }
    return this.instance;
  }
}
