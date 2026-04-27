import { createCrudRouter } from "../../utils/createCrudRouter";
import { authController } from "./auth.controller";

export const authRouter = createCrudRouter(authController);
