import { EntityId } from "redis-om";
import type { LoginDto, PlayerId, User } from "@guessthesketch/common";
import type { UserRepository } from "../../repositories/UserRepository";

export class AuthService {
  constructor(private userRepository: UserRepository) {}

  async login(dto: LoginDto) {
    const { username } = dto;

    try {
      const result = await this.userRepository.save({ username });

      const user: User = {
        id: result[EntityId]! as PlayerId,
        username: result.username,
      };

      return user;
    } catch (err) {
      console.error(err);
      return Promise.reject("Couldn't create user");
    }
  }
}
