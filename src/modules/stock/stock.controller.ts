import { RequestHandler } from "express";
import { stockService } from "./stock.service";

const transfer: RequestHandler = (req, res, next) => {
  try {
    res.status(201).json({
      message: "Stock transferred",
      data: stockService.transfer(req.body)
    });
  } catch (error) {
    next(error);
  }
};

export const stockController = {
  transfer
};
