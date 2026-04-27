import { Router } from "express";
import { reportsController } from "./reports.controller";

const reportsRouter = Router();

reportsRouter.get("/", reportsController.list);
reportsRouter.get("/stock", reportsController.stock);
reportsRouter.get("/stock/low", reportsController.lowStock);
reportsRouter.get("/sales", reportsController.sales);

export { reportsRouter };
