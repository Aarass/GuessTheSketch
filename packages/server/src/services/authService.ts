import { EntityId } from "redis-om";
import type { LoginDto, PlayerId, User } from "@guessthesketch/common";
import { userRepository } from "../repositories/userRepository";

async function login(dto: LoginDto) {
  const { username } = dto;

  try {
    const result = await userRepository.save({ username });

    const user: User = {
      id: result[EntityId]! as PlayerId,
      username: result.username,
    };

    return user;
  } catch (err) {
    console.log(err);
    return Promise.reject("Couldn't create user");
  }
}

export default { login };
