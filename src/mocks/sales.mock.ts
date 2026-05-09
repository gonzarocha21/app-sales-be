import { Sale } from "../models";

export const mockSales: Sale[] = [
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
