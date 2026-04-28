import { randomUUID } from "crypto";
import { StockMovement } from "../../models";
import { AppError } from "../../utils/AppError";
import { stockLotsService } from "../stock-lots/stockLots.service";
import { stockMovementsService } from "../stock-movements/stockMovements.service";

type ReturnRecord = {
  id: string;
  externalReference?: string;
  saleId?: string;
  productId: string;
  quantity: number;
  locationId: string;
  createdAt: string;
};

type CreateReturnPayload = {
  productId?: string;
  quantity?: number;
  locationId?: string;
};

type CreateReturnResult = {
  movement: Pick<StockMovement, "type">;
};

const returns: ReturnRecord[] = [];

const validatePayload = (payload: CreateReturnPayload) => {
  if (!payload.productId || !payload.locationId || payload.quantity === undefined) {
    throw new AppError("productId, quantity and locationId are required", 400);
  }

  if (typeof payload.quantity !== "number" || payload.quantity <= 0) {
    throw new AppError("Return quantity must be greater than zero", 400);
  }
};

export const returnsService = {
  list: () => returns,

  create: (payload: CreateReturnPayload): CreateReturnResult => {
    validatePayload(payload);

    const productId = payload.productId as string;
    const locationId = payload.locationId as string;
    const quantity = payload.quantity as number;

    stockLotsService.increase(productId, locationId, quantity);
    const movement = stockMovementsService.create({
      productId,
      toLocationId: locationId,
      quantity,
      type: "return"
    });

    const returnRecord: ReturnRecord = {
      id: randomUUID(),
      productId,
      quantity,
      locationId,
      createdAt: new Date().toISOString()
    };

    returns.push(returnRecord);

    return {
      movement: {
        type: movement.type
      }
    };
  }
};
