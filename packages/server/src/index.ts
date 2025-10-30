import { App } from "./classes/App";
import { AppContext } from "./classes/AppContext";
import { AuthController } from "./classes/controllers/AuthController";
import { ReplayController } from "./classes/controllers/ReplayController";
import { RestoreController } from "./classes/controllers/RestoreController";
import { RoomsController } from "./classes/controllers/RoomsController";
import { WordsController } from "./classes/controllers/WordsController";
import { AuthService } from "./classes/services/AuthService";
import { PersistanceService } from "./classes/services/PersitanceService";
import { RoomsService } from "./classes/services/RoomsService";
import { UserService } from "./classes/services/UserService";
import { WordService } from "./classes/services/WordService";
import { ToolRegistry } from "./classes/ToolRegistry";
import { Bucket } from "./classes/tools/concrete/Bucket";
import { Circle } from "./classes/tools/concrete/Circle";
import { Eraser } from "./classes/tools/concrete/Eraser";
import { Line } from "./classes/tools/concrete/Line";
import { Pen } from "./classes/tools/concrete/Pen";
import { Rect } from "./classes/tools/concrete/Rect";
import { createUserRepository } from "./repositories/UserRepository";
import { createMockWordRepository } from "./repositories/WordRepository";

const toolRegistry = ToolRegistry.getInstance();
toolRegistry.registerTool(Pen.toolType, Pen);
toolRegistry.registerTool(Line.toolType, Line);
toolRegistry.registerTool(Rect.toolType, Rect);
toolRegistry.registerTool(Circle.toolType, Circle);
toolRegistry.registerTool(Bucket.toolType, Bucket);
toolRegistry.registerTool(Eraser.toolType, Eraser);

const userRepository = createUserRepository();
const wordRepository = createMockWordRepository();
// const wordRepository = createWordRepository();

const roomsService = RoomsService.getInstance();
const authService = new AuthService(userRepository);
const userService = new UserService(userRepository);
const wordService = new WordService(wordRepository);
const persistanceService = new PersistanceService();

const ctx = new AppContext(
  roomsService,
  authService,
  userService,
  wordService,
  persistanceService,
);

const controllers = [
  new AuthController(ctx),
  new RoomsController(ctx),
  new WordsController(ctx),
  new ReplayController(ctx),
  new RestoreController(ctx),
];

const app = new App(ctx, controllers);
app.run();
