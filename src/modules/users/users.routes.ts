import { createCrudRouter } from "../../utils/createCrudRouter";
import { usersController } from "./users.controller";

export const usersRouter = createCrudRouter(usersController);
