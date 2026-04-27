import { createCrudController } from "../../utils/createCrudController";
import { categoriesService } from "./categories.service";

export const categoriesController = createCrudController("Category", categoriesService);
