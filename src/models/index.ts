export type LocationType = "warehouse" | "store";
export type StockMovementType = "in" | "out" | "transfer" | "adjustment" | "return" | "removal";
export type SaleStatus = "registered" | "returned" | "cancelled";
export type UserRole = "admin" | "manager" | "operator";

export interface Product {
  id: string;
  name: string;
  sku: string;
  categoryId?: string;
  price: number;
  active: boolean;
}

export interface Location {
  id: string;
  name: string;
  type: LocationType;
  active: boolean;
}

export interface StockLot {
  id: string;
  productId: string;
  locationId: string;
  quantity: number;
  expirationDate?: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  fromLocationId?: string;
  toLocationId?: string;
  quantity: number;
  type: StockMovementType;
  createdAt: string;
}

export interface Sale {
  id: string;
  externalReference?: string;
  locationId: string;
  items: SaleItem[];
  status: SaleStatus;
  total: number;
  createdAt: string;
}

export interface SaleItem {
  productId: string;
  quantity: number;
  unitPrice?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
}
