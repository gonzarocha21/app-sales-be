import { createCrudRouter } from "../../utils/createCrudRouter";
import { locationsController } from "./locations.controller";

export const locationsRouter = createCrudRouter(locationsController);
