import { EntityId } from "redis-om";
import type { LoginDto, PlayerId, User } from "@guessthesketch/common";
import type { UserRepository } from "../../repositories/UserRepository";
import { err, ok, type Result } from "neverthrow";

export class AuthService {
  constructor(private userRepository: UserRepository) {}

  public async login(dto: LoginDto): Promise<Result<User, string>> {
    const { username } = dto;

    try {
      const result = await this.userRepository.save({ username });

      const id = result[EntityId];
      if (id === undefined) return err("Unexpected");

      const user: User = {
        id: id as PlayerId,
        username: result.username,
      };

      return ok(user);
    } catch (error) {
      console.error(error);
      return err("Couldn't create user");
    }
  }
}
