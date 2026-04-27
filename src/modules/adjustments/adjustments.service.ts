import { randomUUID } from "crypto";
import { StockLot, StockMovement } from "../../models";
import { AppError } from "../../utils/AppError";
import { stockLotsService } from "../stock-lots/stockLots.service";
import { stockMovementsService } from "../stock-movements/stockMovements.service";

type AdjustmentRecord = {
  id: string;
  productId: string;
  locationId: string;
  previousQuantity: number;
  newQuantity: number;
  difference: number;
  reason?: string;
  createdAt: string;
};

type CreateAdjustmentPayload = {
  productId?: string;
  locationId?: string;
  quantity?: number;
  reason?: string;
};

type CreateAdjustmentResult = {
  adjustment: AdjustmentRecord;
  stockLot: StockLot;
  movement: StockMovement | null;
};

const adjustments: AdjustmentRecord[] = [];

const validatePayload = (payload: CreateAdjustmentPayload) => {
  if (!payload.productId || !payload.locationId || payload.quantity === undefined) {
    throw new AppError("productId, locationId and quantity are required", 400);
  }

  if (typeof payload.quantity !== "number" || payload.quantity < 0) {
    throw new AppError("Adjustment quantity must be a positive number", 400);
  }
};

export const adjustmentsService = {
  list: () => adjustments,

  create: (payload: CreateAdjustmentPayload): CreateAdjustmentResult => {
    validatePayload(payload);

    const productId = payload.productId as string;
    const locationId = payload.locationId as string;
    const newQuantity = payload.quantity as number;
    const previousQuantity = stockLotsService.getAvailableQuantity(productId, locationId);
    const difference = newQuantity - previousQuantity;
    const stockLot = stockLotsService.setQuantity(productId, locationId, newQuantity);
    const movementQuantity = Math.abs(difference);
    const movement =
      movementQuantity > 0
        ? stockMovementsService.create({
            productId,
            fromLocationId: difference < 0 ? locationId : undefined,
            toLocationId: difference > 0 ? locationId : undefined,
            quantity: movementQuantity,
            type: "adjustment"
          })
        : null;

    const adjustment: AdjustmentRecord = {
      id: randomUUID(),
      productId,
      locationId,
      previousQuantity,
      newQuantity,
      difference,
      reason: payload.reason,
      createdAt: new Date().toISOString()
    };

    adjustments.push(adjustment);

    return {
      adjustment,
      stockLot,
      movement
    };
  }
};
