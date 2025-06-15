import { EntityId } from "redis-om";
import type { LoginDto, PlayerId, User } from "@guessthesketch/common";
import type { UserRepository } from "../../repositories/UserRepository";

export class AuthService {
  constructor(private userRepository: UserRepository) {}

  async login(dto: LoginDto) {
    const { username } = dto;

    try {
      const result = await this.userRepository.save({ username });

      const id = result[EntityId];

      if (id === undefined) {
        throw new Error("Unexpected");
      }

      const user: User = {
        id: id as PlayerId,
        username: result.username,
      };

      return user;
    } catch (err) {
      console.error(err);
      throw new Error("Couldn't create user");
    }
  }
}
