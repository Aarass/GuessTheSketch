import { App } from "./classes/App";
import { AppContext } from "./classes/AppContext";
import { AuthController } from "./classes/controllers/AuthController";
import { RoomsController } from "./classes/controllers/RoomsController";
import { WordsController } from "./classes/controllers/WordsController";
import { AuthService } from "./classes/services/AuthService";
import { UserService } from "./classes/services/UserService";
import { WordService } from "./classes/services/WordService";
import { createUserRepository } from "./repositories/UserRepository";
import {
  createMockWordRepository,
  createWordRepository,
} from "./repositories/WordRepository";

const userRepository = createUserRepository();
const wordRepository = createMockWordRepository();
// const wordRepository = createWordRepository();

const authService = new AuthService(userRepository);
const userService = new UserService(userRepository);
const wordService = new WordService(wordRepository);

const controllers = [
  new AuthController(),
  new RoomsController(),
  new WordsController(),
];

const ctx = new AppContext(authService, userService, wordService);
const app = new App(ctx, controllers);

app.run();
