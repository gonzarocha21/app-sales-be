import { RequestHandler } from "express";
import { sendSuccess } from "../../utils/apiResponse";
import { productsService } from "./products.service";

const list: RequestHandler = (_req, res, next) => {
  try {
    sendSuccess(res, productsService.list());
  } catch (error) {
    next(error);
  }
};

const create: RequestHandler = (req, res, next) => {
  try {
    sendSuccess(res, productsService.create(req.body), "Product created", 201);
  } catch (error) {
    next(error);
  }
};

const getById: RequestHandler = (req, res, next) => {
  try {
    sendSuccess(res, productsService.getById(req.params.id));
  } catch (error) {
    next(error);
  }
};

const update: RequestHandler = (req, res, next) => {
  try {
    sendSuccess(res, productsService.update(req.params.id, req.body), "Product updated");
  } catch (error) {
    next(error);
  }
};

const remove: RequestHandler = (req, res, next) => {
  try {
    sendSuccess(res, productsService.remove(req.params.id), "Product deleted");
  } catch (error) {
    next(error);
  }
};

export const productsController = {
  list,
  create,
  getById,
  update,
  remove
};
