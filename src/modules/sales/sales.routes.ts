import { createCrudRouter } from "../../utils/createCrudRouter";
import { salesController } from "./sales.controller";

export const salesRouter = createCrudRouter(salesController);
