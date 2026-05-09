import { StockMovement } from "../models";

export const mockStockMovements: StockMovement[] = [
  {
    id: "stock-movement-1",
    productId: "product-1",
    toLocationId: "location-1",
    quantity: 10,
    type: "entry",
    createdAt: "2026-04-27T00:00:00.000Z"
  }
];
