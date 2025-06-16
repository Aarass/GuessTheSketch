import { type UserRepository } from "../../repositories/UserRepository";

export class UserService {
  constructor(private userRepository: UserRepository) {}

  async getUserById(id: string) {
    const res = await this.userRepository.fetch(id);

    // Redis i Redis OM su odlucili da mora ovako. Evo isecka iz dokumentacije
    // Redis, and by extension Redis OM, doesn't differentiate between missing and null.
    // So, if you fetch an entity that doesn't exist, it will happily return you an
    // empty entity, complete with the provided entity ID:
    // https://www.npmjs.com/package/redis-om#missing-entities-and-null-values

    //eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (res.username === undefined) {
      return null;
    }

    return res;
  }
}
