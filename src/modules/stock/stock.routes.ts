import { Router } from "express";
import { stockController } from "./stock.controller";

const stockRouter = Router();

stockRouter.post("/entry", stockController.entry);
stockRouter.post("/transfer", stockController.transfer);

export { stockRouter };
