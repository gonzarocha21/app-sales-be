import { randomUUID } from "crypto";
import { MOVEMENT_TYPES, MovementType, StockMovement } from "../../models";
import { AppError } from "../../utils/AppError";

const stockMovements: StockMovement[] = [
  {
    id: "stock-movement-1",
    productId: "product-1",
    toLocationId: "location-1",
    quantity: 10,
    type: "entry",
    createdAt: "2026-04-27T00:00:00.000Z"
  }
];

type CreateStockMovementPayload = Omit<StockMovement, "id" | "createdAt"> & Partial<Pick<StockMovement, "createdAt">>;
type UpdateStockMovementPayload = Partial<Omit<StockMovement, "id">>;
export type StockMovementFilters = {
  productId?: string;
  locationId?: string;
  fromLocationId?: string;
  toLocationId?: string;
  type?: MovementType;
  dateFrom?: string;
  dateTo?: string;
};

const findStockMovement = (id: string) => {
  const stockMovement = stockMovements.find((item) => item.id === id);

  if (!stockMovement) {
    throw new AppError("Stock movement not found", 404);
  }

  return stockMovement;
};

const validateQuantity = (quantity: unknown) => {
  if (typeof quantity !== "number" || quantity <= 0) {
    throw new AppError("Stock movement quantity must be greater than zero", 400);
  }
};

const validateDate = (date: string, fieldName: string) => {
  if (Number.isNaN(Date.parse(date))) {
    throw new AppError(`${fieldName} must be a valid date`, 400);
  }
};

export const stockMovementsService = {
  list: (filters: StockMovementFilters = {}) => {
    if (filters.type && !MOVEMENT_TYPES.includes(filters.type)) {
      throw new AppError("Invalid stock movement type", 400);
    }

    if (filters.dateFrom) {
      validateDate(filters.dateFrom, "dateFrom");
    }

    if (filters.dateTo) {
      validateDate(filters.dateTo, "dateTo");
    }

    return stockMovements.filter((movement) => {
      const movementDate = Date.parse(movement.createdAt);

      return (
        (!filters.productId || movement.productId === filters.productId) &&
        (!filters.type || movement.type === filters.type) &&
        (!filters.fromLocationId || movement.fromLocationId === filters.fromLocationId) &&
        (!filters.toLocationId || movement.toLocationId === filters.toLocationId) &&
        (!filters.locationId ||
          movement.fromLocationId === filters.locationId ||
          movement.toLocationId === filters.locationId) &&
        (!filters.dateFrom || movementDate >= Date.parse(filters.dateFrom)) &&
        (!filters.dateTo || movementDate <= Date.parse(filters.dateTo))
      );
    });
  },

  create: (payload: Partial<CreateStockMovementPayload>): StockMovement => {
    if (!payload.productId || !payload.quantity || !payload.type) {
      throw new AppError("Stock movement productId, quantity and type are required", 400);
    }

    validateQuantity(payload.quantity);

    const stockMovement: StockMovement = {
      id: randomUUID(),
      productId: payload.productId,
      fromLocationId: payload.fromLocationId,
      toLocationId: payload.toLocationId,
      quantity: payload.quantity,
      type: payload.type,
      createdAt: payload.createdAt ?? new Date().toISOString()
    };

    stockMovements.push(stockMovement);

    return stockMovement;
  },

  getById: (id: string): StockMovement => findStockMovement(id),

  update: (id: string, payload: UpdateStockMovementPayload): StockMovement => {
    const stockMovement = findStockMovement(id);

    if (payload.quantity !== undefined) {
      validateQuantity(payload.quantity);
    }

    Object.assign(stockMovement, payload, { id });

    return stockMovement;
  },

  remove: (id: string) => {
    const index = stockMovements.findIndex((item) => item.id === id);

    if (index === -1) {
      throw new AppError("Stock movement not found", 404);
    }

    const [deletedStockMovement] = stockMovements.splice(index, 1);

    return deletedStockMovement;
  }
};
