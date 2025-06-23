import { createClient } from "redis";

export const client = createClient({ url: "redis://localhost:6380" });

export async function connect() {
  try {
    await client.connect();
    console.log("Redis connected...");
  } catch (error) {
    console.error("Redis connection failed", error);
    process.exit(1);
  }
}
