import { createCrudRouter } from "../../utils/createCrudRouter";
import { stockLotsController } from "./stockLots.controller";

export const stockLotsRouter = createCrudRouter(stockLotsController);
