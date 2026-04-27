import { RequestHandler } from "express";
import { adjustmentsService } from "./adjustments.service";

const list: RequestHandler = (_req, res, next) => {
  try {
    res.json({
      data: adjustmentsService.list()
    });
  } catch (error) {
    next(error);
  }
};

const create: RequestHandler = (req, res, next) => {
  try {
    res.status(201).json({
      message: "Stock adjusted",
      data: adjustmentsService.create(req.body)
    });
  } catch (error) {
    next(error);
  }
};

export const adjustmentsController = {
  list,
  create
};
