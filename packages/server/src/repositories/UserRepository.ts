import { Schema, Repository, type Entity } from "redis-om";
import { client } from "../drivers/redis";
import { InfrastructureManager } from "../classes/InfrastructureManager";

interface User extends Entity {
  username: string;
}

const userSchema = new Schema<User>("User", {
  username: { type: "string" },
});

export type UserRepository = Repository<User>;

export function createUserRepository(): UserRepository {
  void InfrastructureManager.getInstance().connectRedis();

  return new Repository(userSchema, client);
}
