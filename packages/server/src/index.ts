import { App } from "./classes/App";
import { AppContext } from "./classes/AppContext";
import { AuthController } from "./classes/controllers/AuthController";
import { RoomsController } from "./classes/controllers/RoomsController";
import { WordsController } from "./classes/controllers/WordsController";
import { AuthService } from "./classes/services/AuthService";
import { UserService } from "./classes/services/UserService";
import { WordService } from "./classes/services/WordService";
import { ToolRegistry } from "./classes/ToolRegistry";
import { Eraser } from "./classes/tools/concrete/Eraser";
import { Pen } from "./classes/tools/concrete/Pen";
import { createUserRepository } from "./repositories/UserRepository";
import { createMockWordRepository } from "./repositories/WordRepository";

const toolRegistry = ToolRegistry.getInstance();
toolRegistry.registerTool(Pen.toolType, Pen);
toolRegistry.registerTool(Eraser.toolType, Eraser);

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
