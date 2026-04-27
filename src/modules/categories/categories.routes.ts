import { createCrudRouter } from "../../utils/createCrudRouter";
import { categoriesController } from "./categories.controller";

export const categoriesRouter = createCrudRouter(categoriesController);
