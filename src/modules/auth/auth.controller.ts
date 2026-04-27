import { createCrudController } from "../../utils/createCrudController";
import { authService } from "./auth.service";

export const authController = createCrudController("Auth", authService);
