import { createCrudController } from "../../utils/createCrudController";
import { stockMovementsService } from "./stockMovements.service";

export const stockMovementsController = createCrudController("Stock movement", stockMovementsService);
