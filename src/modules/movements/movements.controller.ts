import { RequestHandler } from "express";
import { StockMovementFilters } from "../stock-movements/stockMovements.service";
import { stockMovementsService } from "../stock-movements/stockMovements.service";

const list: RequestHandler = (req, res, next) => {
  try {
    const filters: StockMovementFilters = {
      productId: req.query.productId as string | undefined,
      locationId: req.query.locationId as string | undefined,
      fromLocationId: req.query.fromLocationId as string | undefined,
      toLocationId: req.query.toLocationId as string | undefined,
      type: req.query.type as StockMovementFilters["type"],
      dateFrom: req.query.dateFrom as string | undefined,
      dateTo: req.query.dateTo as string | undefined
    };

    res.json({
      data: stockMovementsService.list(filters)
    });
  } catch (error) {
    next(error);
  }
};

export const movementsController = {
  list
};
