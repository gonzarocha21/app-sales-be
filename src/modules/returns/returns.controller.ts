import { RequestHandler } from "express";
import { sendSuccess } from "../../utils/apiResponse";
import { returnsService } from "./returns.service";

const list: RequestHandler = (_req, res, next) => {
  try {
    sendSuccess(res, returnsService.list());
  } catch (error) {
    next(error);
  }
};

const create: RequestHandler = (req, res, next) => {
  try {
    sendSuccess(res, returnsService.create(req.body), undefined, 201);
  } catch (error) {
    next(error);
  }
};

export const returnsController = {
  list,
  create
};
