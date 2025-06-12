import { App } from "./classes/App";
import { AppContext } from "./classes/AppContext";
import { AuthService } from "./classes/services/AuthService";
import { UserService } from "./classes/services/UserService";
import { WordService } from "./classes/services/WordService";
import { createUserRepository } from "./repositories/UserRepository";
import {
  createMockWordRepository,
  createWordRepository,
} from "./repositories/WordRepository";

const userRepository = createUserRepository();
// const wordRepository = createWordRepository();
const wordRepository = createMockWordRepository();

const authService = new AuthService(userRepository);
const userService = new UserService(userRepository);
const wordService = new WordService(wordRepository);

const ctx = new AppContext(authService, userService, wordService);

new App(ctx).run();
