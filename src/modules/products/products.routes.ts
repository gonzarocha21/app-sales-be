import { productsController } from "./products.controller";
import { createCrudRouter } from "../../utils/createCrudRouter";

export const productsRouter = createCrudRouter(productsController);
