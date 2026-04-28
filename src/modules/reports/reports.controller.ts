import { RequestHandler } from "express";
import { sendSuccess } from "../../utils/apiResponse";
import { reportsService } from "./reports.service";

const list: RequestHandler = (_req, res, next) => {
  try {
    sendSuccess(res, reportsService.list());
  } catch (error) {
    next(error);
  }
};

const stock: RequestHandler = (_req, res, next) => {
  try {
    sendSuccess(res, reportsService.getStockReport());
  } catch (error) {
    next(error);
  }
};

const lowStock: RequestHandler = (req, res, next) => {
  try {
    const threshold = req.query.threshold === undefined ? undefined : Number(req.query.threshold);

    sendSuccess(res, reportsService.getLowStockReport(threshold));
  } catch (error) {
    next(error);
  }
};

const sales: RequestHandler = (_req, res, next) => {
  try {
    sendSuccess(res, reportsService.getSalesReport());
  } catch (error) {
    next(error);
  }
};

export const reportsController = {
  list,
  stock,
  lowStock,
  sales
};
