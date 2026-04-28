import { RequestHandler } from "express";
import { sendSuccess } from "../../utils/apiResponse";
import { salesService } from "./sales.service";

const list: RequestHandler = (_req, res, next) => {
  try {
    sendSuccess(res, salesService.list());
  } catch (error) {
    next(error);
  }
};

const create: RequestHandler = (req, res, next) => {
  try {
    sendSuccess(res, salesService.create(req.body), undefined, 201);
  } catch (error) {
    next(error);
  }
};

const getById: RequestHandler = (req, res, next) => {
  try {
    sendSuccess(res, salesService.getById(req.params.id));
  } catch (error) {
    next(error);
  }
};

const update: RequestHandler = (req, res, next) => {
  try {
    sendSuccess(res, salesService.update(req.params.id, req.body), "Sale updated");
  } catch (error) {
    next(error);
  }
};

const remove: RequestHandler = (req, res, next) => {
  try {
    sendSuccess(res, salesService.remove(req.params.id), "Sale deleted");
  } catch (error) {
    next(error);
  }
};

export const salesController = {
  list,
  create,
  getById,
  update,
  remove
};
