import { RequestHandler } from "express";
import { sendSuccess } from "../../utils/apiResponse";
import { adjustmentsService } from "./adjustments.service";

const list: RequestHandler = (_req, res, next) => {
  try {
    sendSuccess(res, adjustmentsService.list());
  } catch (error) {
    next(error);
  }
};

const create: RequestHandler = (req, res, next) => {
  try {
    sendSuccess(res, adjustmentsService.create(req.body), "Stock adjusted", 201);
  } catch (error) {
    next(error);
  }
};

export const adjustmentsController = {
  list,
  create
};
