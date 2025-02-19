import { userRepository } from "../repositories/userRepository";

async function getUserById(id: string) {
  return await userRepository.fetch(id);
}

export default { getUserById };
