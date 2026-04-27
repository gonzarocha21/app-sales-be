import { createCrudController } from "../../utils/createCrudController";
import { usersService } from "./users.service";

export const usersController = createCrudController("User", usersService);
