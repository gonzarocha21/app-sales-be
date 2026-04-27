import { StockLot, StockMovement } from "../../models";
import { stockLotsService } from "../stock-lots/stockLots.service";
import { stockMovementsService } from "../stock-movements/stockMovements.service";
import { AppError } from "../../utils/AppError";

type TransferStockPayload = {
  productId?: string;
  fromLocationId?: string;
  toLocationId?: string;
  quantity?: number;
};

type TransferStockResult = {
  origin: StockLot;
  destination: StockLot;
  movement: StockMovement;
};

const validateTransferPayload = (payload: TransferStockPayload) => {
  if (!payload.productId || !payload.fromLocationId || !payload.toLocationId || payload.quantity === undefined) {
    throw new AppError("productId, fromLocationId, toLocationId and quantity are required", 400);
  }

  if (payload.fromLocationId === payload.toLocationId) {
    throw new AppError("Origin and destination locations must be different", 400);
  }

  if (typeof payload.quantity !== "number" || payload.quantity <= 0) {
    throw new AppError("Transfer quantity must be greater than zero", 400);
  }
};

export const stockService = {
  transfer: (payload: TransferStockPayload): TransferStockResult => {
    validateTransferPayload(payload);

    const productId = payload.productId as string;
    const fromLocationId = payload.fromLocationId as string;
    const toLocationId = payload.toLocationId as string;
    const quantity = payload.quantity as number;

    const origin = stockLotsService.decrease(productId, fromLocationId, quantity);
    const destination = stockLotsService.increase(productId, toLocationId, quantity);
    const movement = stockMovementsService.create({
      productId,
      fromLocationId,
      toLocationId,
      quantity,
      type: "transfer"
    });

    return {
      origin,
      destination,
      movement
    };
  }
};
