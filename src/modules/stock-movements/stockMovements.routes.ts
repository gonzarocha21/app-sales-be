import { createCrudRouter } from "../../utils/createCrudRouter";
import { stockMovementsController } from "./stockMovements.controller";

export const stockMovementsRouter = createCrudRouter(stockMovementsController);
