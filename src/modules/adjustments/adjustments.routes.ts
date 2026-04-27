import { Router } from "express";
import { adjustmentsController } from "./adjustments.controller";

const adjustmentsRouter = Router();

adjustmentsRouter.get("/", adjustmentsController.list);
adjustmentsRouter.post("/", adjustmentsController.create);

export { adjustmentsRouter };
