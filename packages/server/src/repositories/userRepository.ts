import { Schema, Repository, type Entity } from "redis-om";
import { getClient } from "../drivers/redis";

interface User extends Entity {
  username: string;
}

const userSchema = new Schema<User>("User", {
  username: { type: "string" },
});

export type UserRepository = Repository<User>;

export function createUserRepository(): UserRepository {
  return new Repository(userSchema, getClient());
}
