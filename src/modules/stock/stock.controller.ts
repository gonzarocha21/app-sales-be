import { RequestHandler } from "express";
import { sendSuccess } from "../../utils/apiResponse";
import { stockService } from "./stock.service";

const entry: RequestHandler = (req, res, next) => {
  try {
    sendSuccess(res, stockService.entry(req.body), "Stock entry registered successfully", 201);
  } catch (error) {
    next(error);
  }
};

const transfer: RequestHandler = (req, res, next) => {
  try {
    sendSuccess(res, stockService.transfer(req.body), undefined, 201);
  } catch (error) {
    next(error);
  }
};

export const stockController = {
  entry,
  transfer
};
