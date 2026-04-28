import { randomUUID } from "crypto";
import { PaymentMethod, Sale, SaleItem } from "../../models";
import { AppError } from "../../utils/AppError";
import { stockLotsService } from "../stock-lots/stockLots.service";
import { stockMovementsService } from "../stock-movements/stockMovements.service";

const sales: Sale[] = [
  {
    id: "sale-1",
    externalReference: "EXT-001",
    locationId: "location-1",
    items: [
      {
        productId: "product-1",
        quantity: 1,
        unitPrice: 100
      }
    ],
    status: "registered",
    total: 100,
    createdAt: "2026-04-27T00:00:00.000Z"
  }
];

type CreateSalePayload = {
  externalReference?: string;
  locationId?: string;
  paymentMethod?: PaymentMethod;
  items?: SaleItem[];
};

type CreateSaleResult = {
  sale: {
    id: string;
    totalAmount: number;
  };
};

type UpdateSalePayload = Partial<Omit<Sale, "id">>;

const findSale = (id: string) => {
  const sale = sales.find((item) => item.id === id);

  if (!sale) {
    throw new AppError("Sale not found", 404);
  }

  return sale;
};

const validateItems = (items: unknown): SaleItem[] => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new AppError("Sale items are required", 400);
  }

  items.forEach((item) => {
    if (!item.productId) {
      throw new AppError("Each sale item must include productId", 400);
    }

    if (typeof item.quantity !== "number" || item.quantity <= 0) {
      throw new AppError("Each sale item quantity must be greater than zero", 400);
    }

    if (typeof item.unitPrice !== "number" || item.unitPrice < 0) {
      throw new AppError("Each sale item unitPrice must be a positive number", 400);
    }
  });

  return items as SaleItem[];
};

const getRequiredQuantityByProduct = (items: SaleItem[]) => {
  return items.reduce<Record<string, number>>((requiredQuantity, item) => {
    requiredQuantity[item.productId] = (requiredQuantity[item.productId] ?? 0) + item.quantity;
    return requiredQuantity;
  }, {});
};

const calculateTotal = (items: SaleItem[]) => {
  return items.reduce((total, item) => total + (item.unitPrice ?? 0) * item.quantity, 0);
};

const acceptedPaymentMethods: PaymentMethod[] = ["cash", "card", "other"];

const validatePaymentMethod = (paymentMethod: unknown) => {
  if (!paymentMethod || !acceptedPaymentMethods.includes(paymentMethod as PaymentMethod)) {
    throw new AppError("Payment method must be cash, card or other", 400);
  }
};

export const salesService = {
  list: () => sales,

  create: (payload: CreateSalePayload): CreateSaleResult => {
    if (!payload.locationId) {
      throw new AppError("Sale locationId is required", 400);
    }

    validatePaymentMethod(payload.paymentMethod);

    const items = validateItems(payload.items);
    const requiredQuantityByProduct = getRequiredQuantityByProduct(items);

    Object.entries(requiredQuantityByProduct).forEach(([productId, requiredQuantity]) => {
      const availableQuantity = stockLotsService.getAvailableQuantity(productId, payload.locationId as string);

      if (availableQuantity < requiredQuantity) {
        throw new AppError(`Not enough stock for product ${productId}`, 400);
      }
    });

    items.forEach((item) => {
      stockLotsService.decrease(item.productId, payload.locationId as string, item.quantity);

      stockMovementsService.create({
        productId: item.productId,
        fromLocationId: payload.locationId,
        quantity: item.quantity,
        type: "sale"
      });
    });

    const sale: Sale = {
      id: randomUUID(),
      externalReference: payload.externalReference,
      locationId: payload.locationId,
      items,
      status: "registered",
      paymentMethod: payload.paymentMethod,
      total: calculateTotal(items),
      createdAt: new Date().toISOString()
    };

    sales.push(sale);

    return {
      sale: {
        id: sale.id,
        totalAmount: sale.total
      }
    };
  },

  getById: (id: string): Sale => findSale(id),

  update: (id: string, payload: UpdateSalePayload): Sale => {
    const sale = findSale(id);

    Object.assign(sale, payload, { id });

    return sale;
  },

  remove: (id: string) => {
    const index = sales.findIndex((item) => item.id === id);

    if (index === -1) {
      throw new AppError("Sale not found", 404);
    }

    const [deletedSale] = sales.splice(index, 1);

    return deletedSale;
  }
};
