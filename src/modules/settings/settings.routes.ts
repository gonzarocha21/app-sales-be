import { createCrudRouter } from "../../utils/createCrudRouter";
import { settingsController } from "./settings.controller";

export const settingsRouter = createCrudRouter(settingsController);
