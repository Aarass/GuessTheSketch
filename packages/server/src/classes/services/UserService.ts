import type { UserRepository } from "../../repositories/userRepository";

export class UserService {
  constructor(private userRepository: UserRepository) {}

  async getUserById(id: string) {
    return await this.userRepository.fetch(id);
  }
}
