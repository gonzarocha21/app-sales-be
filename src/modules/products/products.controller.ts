import { RequestHandler } from "express";
import { sendSuccess } from "../../utils/apiResponse";
import { productsService } from "./products.service";

const list: RequestHandler = (_req, res, next) => {
  try {
    sendSuccess(res, productsService.list(_req.query));
  } catch (error) {
    next(error);
  }
};

const create: RequestHandler = (req, res, next) => {
  try {
    sendSuccess(res, productsService.create(req.body), "Product created successfully", 201);
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
    sendSuccess(res, productsService.update(req.params.id, req.body), "Product updated successfully");
  } catch (error) {
    next(error);
  }
};

const remove: RequestHandler = (req, res, next) => {
  try {
    const product = productsService.remove(req.params.id);

    sendSuccess(
      res,
      {
        id: product.id,
        status: product.status
      },
      "Product deactivated successfully"
    );
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
