import { StockMovement } from "../../models";
import { stockLotsService } from "../stock-lots/stockLots.service";
import { stockMovementsService } from "../stock-movements/stockMovements.service";
import { AppError } from "../../utils/AppError";

type TransferStockPayload = {
  productId?: string;
  quantity?: number;
  originLocationId?: string;
  destinationLocationId?: string;
};

type TransferStockResult = {
  movement: Pick<StockMovement, "type">;
};

type StockEntryPayload = {
  productId?: string;
  locationId?: string;
  quantity?: number;
  expirationDate?: string | null;
  notes?: string;
};

type StockEntryResult = {
  movement: Pick<StockMovement, "id" | "type" | "productId" | "quantity">;
};

const validateTransferPayload = (payload: TransferStockPayload) => {
  if (!payload.productId || !payload.originLocationId || !payload.destinationLocationId || payload.quantity === undefined) {
    throw new AppError("productId, quantity, originLocationId and destinationLocationId are required", 400);
  }

  if (payload.originLocationId === payload.destinationLocationId) {
    throw new AppError("Origin and destination locations must be different", 400);
  }

  if (typeof payload.quantity !== "number" || payload.quantity <= 0) {
    throw new AppError("Transfer quantity must be greater than zero", 400);
  }
};

const validateEntryPayload = (payload: StockEntryPayload) => {
  if (!payload.productId || !payload.locationId || payload.quantity === undefined) {
    throw new AppError("productId, locationId and quantity are required", 400);
  }

  if (typeof payload.quantity !== "number" || payload.quantity <= 0) {
    throw new AppError("Stock entry quantity must be greater than zero", 400);
  }

  if (payload.expirationDate !== undefined && payload.expirationDate !== null && Number.isNaN(Date.parse(payload.expirationDate))) {
    throw new AppError("expirationDate must be a valid date or null", 400);
  }
};

export const stockService = {
  entry: (payload: StockEntryPayload): StockEntryResult => {
    validateEntryPayload(payload);

    const productId = payload.productId as string;
    const locationId = payload.locationId as string;
    const quantity = payload.quantity as number;

    stockLotsService.create({
      productId,
      locationId,
      quantity,
      expirationDate: payload.expirationDate ?? undefined
    });

    const movement = stockMovementsService.create({
      productId,
      toLocationId: locationId,
      quantity,
      type: "entry"
    });

    return {
      movement: {
        id: movement.id,
        type: movement.type,
        productId: movement.productId,
        quantity: movement.quantity
      }
    };
  },

  transfer: (payload: TransferStockPayload): TransferStockResult => {
    validateTransferPayload(payload);

    const productId = payload.productId as string;
    const originLocationId = payload.originLocationId as string;
    const destinationLocationId = payload.destinationLocationId as string;
    const quantity = payload.quantity as number;

    stockLotsService.decrease(productId, originLocationId, quantity);
    stockLotsService.increase(productId, destinationLocationId, quantity);
    const movement = stockMovementsService.create({
      productId,
      fromLocationId: originLocationId,
      toLocationId: destinationLocationId,
      quantity,
      type: "transfer"
    });

    return {
      movement: {
        type: movement.type
      }
    };
  }
};
