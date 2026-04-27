import { createCrudController } from "../../utils/createCrudController";
import { stockLotsService } from "./stockLots.service";

export const stockLotsController = createCrudController("Stock lot", stockLotsService);
