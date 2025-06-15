import type { UserRepository } from "../../repositories/UserRepository";

export class UserService {
  constructor(private userRepository: UserRepository) {}

  // TODO
  // tipiziraj ovo za slucaj da ne nadje igraca
  async getUserById(id: string) {
    return await this.userRepository.fetch(id);
  }
}
