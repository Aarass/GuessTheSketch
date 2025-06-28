import { App } from "./classes/App";
import { AppContext } from "./classes/AppContext";
import { AuthController } from "./classes/controllers/AuthController";
import { ReplayController } from "./classes/controllers/ReplayController";
import { RoomsController } from "./classes/controllers/RoomsController";
import { WordsController } from "./classes/controllers/WordsController";
import { AuthService } from "./classes/services/AuthService";
import { PersistanceService } from "./classes/services/PersitanceService";
import { UserService } from "./classes/services/UserService";
import { WordService } from "./classes/services/WordService";
import { ToolRegistry } from "./classes/ToolRegistry";
import { Eraser } from "./classes/tools/concrete/Eraser";
import { Line } from "./classes/tools/concrete/Line";
import { Pen } from "./classes/tools/concrete/Pen";
import { Rect } from "./classes/tools/concrete/Rect";
import { Circle } from "./classes/tools/concrete/Circle";
import { createUserRepository } from "./repositories/UserRepository";
import { createMockWordRepository } from "./repositories/WordRepository";
import { Bucket } from "./classes/tools/concrete/Bucket";
import { GlobalState } from "./classes/states/GlobalState";
import { RestoreController } from "./classes/controllers/RestoreController";

const state = GlobalState.getInstance();

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

const authService = new AuthService(userRepository);
const userService = new UserService(userRepository);
const wordService = new WordService(wordRepository);
const persistanceService = new PersistanceService();

const controllers = [
  new AuthController(),
  new RoomsController(state),
  new WordsController(),
  new ReplayController(state),
  new RestoreController(state),
];

const ctx = new AppContext(
  authService,
  userService,
  wordService,
  persistanceService,
);
const app = new App(ctx, controllers);

app.run();
