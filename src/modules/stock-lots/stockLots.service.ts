import { randomUUID } from "crypto";
import { StockLot } from "../../models";
import { AppError } from "../../utils/AppError";

const stockLots: StockLot[] = [
  {
    id: "stock-lot-1",
    productId: "product-1",
    locationId: "location-1",
    quantity: 25,
    expirationDate: "2026-12-31"
  }
];

type CreateStockLotPayload = Omit<StockLot, "id">;
type UpdateStockLotPayload = Partial<Omit<StockLot, "id">>;

const findStockLot = (id: string) => {
  const stockLot = stockLots.find((item) => item.id === id);

  if (!stockLot) {
    throw new AppError("Stock lot not found", 404);
  }

  return stockLot;
};

const validateQuantity = (quantity: unknown) => {
  if (typeof quantity !== "number" || quantity < 0) {
    throw new AppError("Stock lot quantity must be a positive number", 400);
  }
};

export const stockLotsService = {
  list: () => stockLots,

  create: (payload: Partial<CreateStockLotPayload>): StockLot => {
    if (!payload.productId || !payload.locationId || payload.quantity === undefined) {
      throw new AppError("Stock lot productId, locationId and quantity are required", 400);
    }

    validateQuantity(payload.quantity);

    const stockLot: StockLot = {
      id: randomUUID(),
      productId: payload.productId,
      locationId: payload.locationId,
      quantity: payload.quantity,
      expirationDate: payload.expirationDate
    };

    stockLots.push(stockLot);

    return stockLot;
  },

  getById: (id: string): StockLot => findStockLot(id),

  update: (id: string, payload: UpdateStockLotPayload): StockLot => {
    const stockLot = findStockLot(id);

    if (payload.quantity !== undefined) {
      validateQuantity(payload.quantity);
    }

    Object.assign(stockLot, payload, { id });

    return stockLot;
  },

  remove: (id: string) => {
    const index = stockLots.findIndex((item) => item.id === id);

    if (index === -1) {
      throw new AppError("Stock lot not found", 404);
    }

    const [deletedStockLot] = stockLots.splice(index, 1);

    return deletedStockLot;
  },

  decrease: (productId: string, locationId: string, quantity: number): StockLot => {
    validateQuantity(quantity);

    const stockLot = stockLots.find(
      (item) => item.productId === productId && item.locationId === locationId && item.quantity >= quantity
    );

    if (!stockLot) {
      throw new AppError("Not enough stock in origin location", 400);
    }

    stockLot.quantity -= quantity;

    return stockLot;
  },

  increase: (productId: string, locationId: string, quantity: number): StockLot => {
    validateQuantity(quantity);

    let stockLot = stockLots.find((item) => item.productId === productId && item.locationId === locationId);

    if (!stockLot) {
      stockLot = {
        id: randomUUID(),
        productId,
        locationId,
        quantity: 0
      };
      stockLots.push(stockLot);
    }

    stockLot.quantity += quantity;

    return stockLot;
  },

  setQuantity: (productId: string, locationId: string, quantity: number): StockLot => {
    validateQuantity(quantity);

    let stockLot = stockLots.find((item) => item.productId === productId && item.locationId === locationId);

    if (!stockLot) {
      stockLot = {
        id: randomUUID(),
        productId,
        locationId,
        quantity: 0
      };
      stockLots.push(stockLot);
    }

    stockLot.quantity = quantity;

    return stockLot;
  },

  getAvailableQuantity: (productId: string, locationId: string): number => {
    return stockLots
      .filter((item) => item.productId === productId && item.locationId === locationId)
      .reduce((total, item) => total + item.quantity, 0);
  }
};
