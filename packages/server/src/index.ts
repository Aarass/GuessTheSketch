import { App } from "./classes/App";
import { AppContext } from "./classes/AppContext";
import { AuthService } from "./classes/services/AuthService";
import { UserService } from "./classes/services/UserService";
import { createUserRepository } from "./repositories/userRepository";

const userRepository = createUserRepository();
const authService = new AuthService(userRepository);
const userService = new UserService(userRepository);

const ctx = new AppContext(authService, userService);

new App(ctx).run();
