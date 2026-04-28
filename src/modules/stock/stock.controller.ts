import { RequestHandler } from "express";
import { sendSuccess } from "../../utils/apiResponse";
import { stockService } from "./stock.service";

const transfer: RequestHandler = (req, res, next) => {
  try {
    sendSuccess(res, stockService.transfer(req.body), "Stock transferred", 201);
  } catch (error) {
    next(error);
  }
};

export const stockController = {
  transfer
};
