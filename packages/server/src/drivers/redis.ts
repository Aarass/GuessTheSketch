import { createClient } from "redis";

export const client = createClient();

export async function connect() {
  try {
    await client.connect();
    console.log("Redis connected...");
  } catch (error) {
    console.error("Redis connection failed", error);
    process.exit(1);
  }
}

export function getNewClient() {
  let new_client = client.duplicate();
  new_client.connect().catch(console.error);

  return new_client;
}
