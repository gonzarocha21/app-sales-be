import { randomUUID } from "crypto";
import { SaleItem, StockMovement } from "../../models";
import { AppError } from "../../utils/AppError";
import { stockLotsService } from "../stock-lots/stockLots.service";
import { stockMovementsService } from "../stock-movements/stockMovements.service";

type ReturnRecord = {
  id: string;
  externalReference?: string;
  saleId?: string;
  locationId: string;
  items: SaleItem[];
  createdAt: string;
};

type CreateReturnPayload = {
  externalReference?: string;
  saleId?: string;
  locationId?: string;
  items?: SaleItem[];
};

type CreateReturnResult = {
  return: ReturnRecord;
  movements: StockMovement[];
};

const returns: ReturnRecord[] = [];

const validateItems = (items: unknown): SaleItem[] => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new AppError("Return items are required", 400);
  }

  items.forEach((item) => {
    if (!item.productId) {
      throw new AppError("Each return item must include productId", 400);
    }

    if (typeof item.quantity !== "number" || item.quantity <= 0) {
      throw new AppError("Each return item quantity must be greater than zero", 400);
    }
  });

  return items as SaleItem[];
};

export const returnsService = {
  list: () => returns,

  create: (payload: CreateReturnPayload): CreateReturnResult => {
    if (!payload.locationId) {
      throw new AppError("Return locationId is required", 400);
    }

    const items = validateItems(payload.items);
    const movements = items.map((item) => {
      stockLotsService.increase(item.productId, payload.locationId as string, item.quantity);

      return stockMovementsService.create({
        productId: item.productId,
        toLocationId: payload.locationId,
        quantity: item.quantity,
        type: "return"
      });
    });

    const returnRecord: ReturnRecord = {
      id: randomUUID(),
      externalReference: payload.externalReference,
      saleId: payload.saleId,
      locationId: payload.locationId,
      items,
      createdAt: new Date().toISOString()
    };

    returns.push(returnRecord);

    return {
      return: returnRecord,
      movements
    };
  }
};
