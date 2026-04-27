import { createCrudController } from "../../utils/createCrudController";
import { settingsService } from "./settings.service";

export const settingsController = createCrudController("Setting", settingsService);
